import { DockableTabs } from '@youwol/fv-tabs'
import { BehaviorSubject, forkJoin } from 'rxjs'
import { filter, map, mergeMap } from 'rxjs/operators'
import { getUrlBase } from '@youwol/cdn-client'
import { child$, VirtualDOM } from '@youwol/flux-view'
import { AssetsGateway, ExplorerBackend } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { WebpmPackageInfoTypes } from '@youwol/os-widgets'
import { webpmPackageModule } from './on-load'

type GetPathResponse = ExplorerBackend.GetPathResponse

/**
 * @category State
 */
export class TabsState extends DockableTabs.State {
    /**
     * @group States
     */
    public readonly packageState: WebpmPackageInfoTypes.PackageInfoState

    constructor(params: {
        packageState: WebpmPackageInfoTypes.PackageInfoState
    }) {
        super({
            disposition: 'left',
            viewState$: new BehaviorSubject<DockableTabs.DisplayMode>('pined'),
            tabs$: params.packageState.links$.pipe(
                map((links) => links.filter((l) => l.name != 'Explorer')),
                map((links) => [
                    new FilesTab(),
                    ...links.map((l) => new LinkTab(l)),
                    new ReferencesTab(),
                ]),
            ),
            selected$: new BehaviorSubject('Files'),
            persistTabsView: true,
        })
        Object.assign(this, params)
        const tab = new URLSearchParams(window.location.search)
            .get('tab')
            ?.toLowerCase()
        params.packageState.links$.subscribe((links) => {
            const map = {
                files: 'Files',
                references: 'References',
                ...links.reduce(
                    (acc, l) => ({ ...acc, [l.name.toLowerCase()]: l.name }),
                    {},
                ),
            }
            tab && map[tab] && this.selected$.next(map[tab])
        })
    }
}

/**
 * @category View
 */
export class FilesTab extends DockableTabs.Tab {
    constructor() {
        super({
            id: 'Files',
            title: 'Files',
            icon: 'fas fa-folder',
            content: ({ tabsState }: { tabsState: TabsState }) => {
                return {
                    class: 'h-100 w-100',
                    children: [
                        child$(
                            tabsState.packageState.selectedVersion$,
                            (version) =>
                                new webpmPackageModule.ExplorerView({
                                    asset: tabsState.packageState.asset,
                                    version,
                                }),
                        ),
                    ],
                }
            },
        })
        Object.assign(this)
    }
}
/**
 * @category View
 */
export class LinkTab extends DockableTabs.Tab {
    constructor(link: { name; version; url }) {
        super({
            id: link.name,
            title: link.name,
            icon: 'fas fa-link',
            content: ({ tabsState }: { tabsState: TabsState }) => {
                return {
                    class: 'h-100 w-100',
                    children: [
                        child$(
                            tabsState.selected$.pipe(
                                filter((selected) => selected == link.name),
                            ),
                            () => {
                                return {
                                    tag: 'iframe',
                                    class: 'h-100 w-100',
                                    style: {
                                        backgroundColor: 'white',
                                    },
                                    src: `${getUrlBase(
                                        tabsState.packageState.asset.name,
                                        link.version,
                                    )}/${link.url}`,
                                }
                            },
                        ),
                    ],
                }
            },
        })
        Object.assign(this)
    }
}
/**
 * @category View
 */
export class ReferencesTab extends DockableTabs.Tab {
    constructor() {
        const client = new AssetsGateway.Client().explorer
        super({
            id: 'References',
            title: 'References',
            icon: 'fas fa-file',
            content: ({ tabsState }: { tabsState: TabsState }) => {
                return {
                    children: [
                        child$(
                            client
                                .queryItemsByAssetId$({
                                    assetId:
                                        tabsState.packageState.asset.assetId,
                                })
                                .pipe(
                                    raiseHTTPErrors(),
                                    mergeMap(({ items }) => {
                                        return forkJoin(
                                            items.map((item) =>
                                                client.getPath$({
                                                    itemId: item.itemId,
                                                }),
                                            ),
                                        )
                                    }),
                                ),
                            (paths: GetPathResponse[]) => {
                                return new PathsView({ paths })
                            },
                        ),
                    ],
                }
            },
        })
        Object.assign(this)
    }
}

/**
 * @category View
 */
export class PathsView implements VirtualDOM {
    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable Constants
     */
    public readonly paths: GetPathResponse[]
    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'p-2 container'
    constructor(params: { paths: GetPathResponse[] }) {
        Object.assign(this, params)
        this.children = this.paths.map((path) => {
            return new PathView({ path })
        })
    }
}

/**
 * @category View
 */
export class PathView implements VirtualDOM {
    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'border rounded p-2 container w-50 mb-2'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable Constants
     */
    public readonly path: GetPathResponse

    /**
     * @group Immutable DOM Constants
     */
    public readonly style = {
        width: 'fit-content',
    }
    constructor(params: { path: GetPathResponse }) {
        Object.assign(this, params)
        this.children = [
            new PathElementView({
                icon: this.path.drive.groupId.includes('private')
                    ? 'fa-user'
                    : 'fa-users',
                text: this.path.drive.groupId.includes('private')
                    ? 'private'
                    : window.atob(this.path.drive.groupId),
            }),
            new PathElementView({
                icon: 'fa-hdd',
                text: this.path.drive.name,
            }),
            new PathElementView({
                icon: 'fa-file',
                text: this.path.folders.reduce((acc, e) => {
                    return `${acc}/${e.name}`
                }, ''),
            }),
        ]
    }
}
/**
 * @category View
 */
export class PathElementView {
    /**
     * @group Immutable DOM Constants
     */
    public readonly class = 'align-items-center row'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    constructor(params: { icon: string; text: string }) {
        this.children = [
            {
                class: `fas ${params.icon} col-2 text-center`,
            },
            {
                class: 'col-10',
                innerText: params.text,
            },
        ]
    }
}
