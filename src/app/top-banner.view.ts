import { TopBannerView } from '@youwol/os-top-banner'
import { attr$, child$ } from '@youwol/flux-view'
import { AppState } from './on-load'
import { basic } from '@youwol/installers-youwol'
import { filter } from 'rxjs/operators'
import { merge } from 'rxjs'

export class ExplorerBannerView extends TopBannerView {
    constructor({ appState }: { appState: AppState }) {
        super({
            innerView: {
                class: 'd-flex w-100 justify-content-center my-auto align-items-center',
                children: [
                    {
                        tag: 'input',
                        type: 'text',
                        style: {
                            maxWidth: '300px',
                        },
                        class: 'w-100',
                        value: attr$(
                            merge(
                                appState.search$.pipe(
                                    filter((d) => d != undefined),
                                ),
                            ),
                            (search) => {
                                return search
                            },
                        ),
                        onkeydown: (ev) => {
                            if (ev.key === 'Enter') {
                                appState.search(ev.target.value)
                            }
                        },
                    },
                    {
                        class: 'border rounded p-1 mx-2 fv-pointer fv-btn fv-text-secondary fv-hover-xx-lighter',
                        children: [
                            {
                                class: 'fas fa-search',
                            },
                        ],
                        onclick: (ev) => {
                            appState.search(ev.target.value)
                        },
                    },
                    child$(appState.packageState$, (packageState) => {
                        return new basic.PackageVersionSelect({
                            state: packageState,
                        })
                    }),
                ],
            },
        })
    }
}
