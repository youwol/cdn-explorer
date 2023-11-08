import { render, VirtualDOM, Stream$, child$ } from '@youwol/flux-view'
import { DockableTabs } from '@youwol/fv-tabs'
import { AssetsGateway } from '@youwol/http-clients'
import { dispatchHTTPErrors, HTTPError } from '@youwol/http-primitives'
import { ExplorerBannerView } from './top-banner.view'
import { BehaviorSubject, merge, ReplaySubject } from 'rxjs'
import {
    webpmPackageInfoModule,
    WebpmPackageInfoTypes,
} from '@youwol/os-widgets'
import { TabsState } from './tabs'
import { HTTPErrorView } from './errors.view'
import { AssetLightDescription, ChildApplicationAPI } from '@youwol/os-core'

require('./style.css')

export const defaultPackage = '@youwol/cdn-client'

/**
 * `webpmPackageInfoModule`, part of  @youwol/os-widgets, is an auxiliary module of it that needs to be loaded
 * on demand. This is the purpose of the next line.
 */
export const webpmPackageModule = await webpmPackageInfoModule()
/**
 *
 * @category State
 */
export class AppState {
    /**
     * @group Observables
     */
    public readonly assets$ = new ReplaySubject<AssetLightDescription>(1)

    /**
     * @group HTTP
     */
    public readonly client = new AssetsGateway.Client().assets

    /**
     * @group Observables
     */
    public readonly package$ =
        new ReplaySubject<WebpmPackageInfoTypes.PackageInfoState>(1)

    /**
     * @group Observables
     */
    public readonly errors$ = new ReplaySubject<HTTPError>(1)

    /**
     * @group Observables
     */
    public readonly search$ = new BehaviorSubject<string>(undefined)

    constructor() {
        const packageName = new URLSearchParams(window.location.search).get(
            'package',
        )
        this.search(packageName || defaultPackage)
        ChildApplicationAPI.setProperties({
            snippet: {
                class: 'd-flex align-items-center px-1',
                children: [
                    {
                        class: 'fas fa-search mr-1',
                    },
                    child$(this.search$, (search) => ({ innerText: search })),
                ],
            },
        })
    }

    search(packageName: string) {
        this.search$.next(packageName)
        this.client
            .getAsset$({
                assetId: window.btoa(window.btoa(packageName)),
            })
            .pipe(dispatchHTTPErrors(this.errors$))
            .subscribe((asset) => {
                const state = new webpmPackageModule.PackageInfoState({ asset })
                this.assets$.next(state.asset)
                state.metadata$.subscribe()
                this.package$.next(state)
            })
    }
}

/**
 *
 * @category Getting Started
 * @category View
 */
export class AppView implements VirtualDOM {
    /**
     * @group States
     */
    public readonly state: AppState

    /**
     * @group Immutable DOM Constants
     */
    public readonly class =
        'h-100 w-100 d-flex flex-column fv-text-primary position-relative'

    /**
     * @group Immutable DOM Constants
     */
    public readonly children: VirtualDOM[]

    /**
     * @group Immutable DOM Constants
     */
    public readonly style: Stream$<
        { [_key: string]: string },
        { [_key: string]: string }
    >

    constructor() {
        this.state = new AppState()

        this.children = [
            new ExplorerBannerView({ appState: this.state }),
            {
                class: 'w-100 flex-grow-1 position-relative',
                children: [
                    child$(
                        merge(this.state.package$, this.state.errors$),
                        (packageState) => {
                            if (packageState instanceof HTTPError) {
                                return new HTTPErrorView({
                                    packageName: this.state.search$.getValue(),
                                    error: packageState,
                                })
                            }
                            return new DockableTabs.View({
                                state: new TabsState({ packageState }),
                                styleOptions: {
                                    wrapper: {
                                        class: 'flex-grow-1 overflow-auto',
                                        style: {
                                            minHeight: '0px',
                                        },
                                    },
                                },
                            })
                        },
                    ),
                ],
            },
        ]
    }
}

document.getElementById('content').appendChild(render(new AppView()))
