import { DockableTabs } from '@youwol/fv-tabs'
import { BehaviorSubject, forkJoin } from 'rxjs'
import { basic } from '@youwol/installers-youwol'
import { filter, map, mergeMap } from 'rxjs/operators'
import { getUrlBase } from '@youwol/cdn-client'
import { child$, VirtualDOM } from '@youwol/flux-view'
import { AssetsGateway, raiseHTTPErrors } from '@youwol/http-clients'
import { GetPathResponse } from '@youwol/http-clients/dist/lib/explorer-backend'

export class TabsState extends DockableTabs.State {
    public readonly packageState: basic.PackageInfoState

    constructor(params: { packageState: basic.PackageInfoState }) {
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
        console.log(this.packageState)
        this.packageState.links$.subscribe((links) => {
            console.log('links', links)
        })
    }
}

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
                                new basic.ExplorerView({
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

export class PathsView implements VirtualDOM {
    public readonly children: VirtualDOM[]
    public readonly paths: GetPathResponse[]
    public readonly class = 'p-2 container'
    constructor(params: { paths: GetPathResponse[] }) {
        Object.assign(this, params)
        this.children = this.paths.map((path) => {
            return new PathView({ path })
        })
    }
}

export class PathView implements VirtualDOM {
    public readonly class = 'border rounded p-2 container w-50 mb-2'
    public readonly children: VirtualDOM[]
    public readonly path: GetPathResponse
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

export class PathElementView {
    public readonly class = 'align-items-center row'
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
