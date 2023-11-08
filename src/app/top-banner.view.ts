import { TopBannerView } from '@youwol/os-top-banner'
import { attr$, child$, HTMLElement$ } from '@youwol/flux-view'
import { AppState, webpmPackageModule } from './on-load'
import { filter, withLatestFrom } from 'rxjs/operators'
import { merge, Subject } from 'rxjs'

/**
 * @category View
 */
export class ExplorerBannerView extends TopBannerView {
    constructor({ appState }: { appState: AppState }) {
        const tmpSearch$ = new Subject<string>()
        const click$ = new Subject<MouseEvent | KeyboardEvent>()

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
                            tmpSearch$.next(ev.target.value)
                        },
                        onkeydown: (ev) => {
                            if (ev.key === 'Enter') {
                                click$.next(ev)
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
                            click$.next(ev)
                        },
                    },
                    child$(appState.package$, (packageState) => {
                        return new webpmPackageModule.PackageVersionSelect({
                            state: packageState,
                        })
                    }),
                ],
                connectedCallback: (elem: HTMLElement$) => {
                    elem.ownSubscriptions(
                        appState.search$.subscribe((v) => tmpSearch$.next(v)),
                        click$
                            .pipe(withLatestFrom(tmpSearch$))
                            .subscribe(([_, text]) => {
                                appState.search(text)
                            }),
                    )
                },
            },
        })
    }
}
