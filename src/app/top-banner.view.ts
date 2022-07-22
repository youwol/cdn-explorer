import { TopBannerView } from '@youwol/os-top-banner'
import { attr$, child$ } from '@youwol/flux-view'
import { AppState } from './on-load'
import { basic } from '@youwol/installers-youwol'
import { filter, withLatestFrom } from 'rxjs/operators'
import { merge, Subject } from 'rxjs'
import { HTMLElement$ } from '@youwol/flux-view'

/**
 * @category View
 */
export class ExplorerBannerView extends TopBannerView {
    public readonly tmpSearch$ = new Subject<string>()
    public readonly click$ = new Subject<MouseEvent | KeyboardEvent>()

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
                        oninput: (ev) => {
                            this.tmpSearch$.next(ev.target.value)
                        },
                        onkeydown: (ev) => {
                            if (ev.key === 'Enter') {
                                this.click$.next(ev)
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
                            this.click$.next(ev)
                        },
                    },
                    child$(appState.packageState$, (packageState) => {
                        return new basic.PackageVersionSelect({
                            state: packageState,
                        })
                    }),
                ],
                connectedCallback: (elem: HTMLElement$) => {
                    elem.ownSubscriptions(
                        appState.search$.subscribe((v) =>
                            this.tmpSearch$.next(v),
                        ),
                        this.click$
                            .pipe(withLatestFrom(this.tmpSearch$))
                            .subscribe(([_, text]) => {
                                appState.search(text)
                            }),
                    )
                },
            },
        })
    }
}
