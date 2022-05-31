import { render, VirtualDOM, Stream$, child$ } from '@youwol/flux-view'
import { DockableTabs } from '@youwol/fv-tabs'
import {
    AssetsBackend,
    AssetsGateway,
    dispatchHTTPErrors,
    HTTPError,
} from '@youwol/http-clients'
import { ExplorerBannerView } from './top-banner.view'
import { BehaviorSubject, merge, ReplaySubject } from 'rxjs'
import { basic } from '@youwol/installers-youwol'
import { TabsState } from './tabs'
import { HTTPErrorView } from './errors.view'
import { ChildApplicationAPI } from '@youwol/os-core'

require('./style.css')

export class AppState {
    public readonly assets$ = new ReplaySubject<AssetsBackend.GetAssetResponse>(
        1,
    )
    public readonly client = new AssetsGateway.Client().assets
    public readonly packageState$ = new ReplaySubject<basic.PackageInfoState>(1)
    public readonly errors$ = new ReplaySubject<HTTPError>(1)
    public readonly search$ = new BehaviorSubject<string>(undefined)
    constructor() {
        const packageName = new URLSearchParams(window.location.search).get(
            'package-name',
        )
        this.search(packageName || '@youwol/os-core')
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
            .subscribe((response) => {
                this.assets$.next(response)
                const packageState = new basic.PackageInfoState({
                    asset: response,
                })
                packageState.metadata$.subscribe()
                this.packageState$.next(packageState)
            })
    }
}
export class AppView implements VirtualDOM {
    public readonly state: AppState
    public readonly class =
        'h-100 w-100 d-flex flex-column fv-text-primary position-relative'

    public readonly children: VirtualDOM[]
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
                        merge(this.state.packageState$, this.state.errors$),
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
