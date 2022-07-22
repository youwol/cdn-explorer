export {}
require('./style.css')
let cdn = window['@youwol/cdn-client']

await cdn.install({
    modules: [
        '@youwol/fv-group#0.x',
        '@youwol/fv-tabs#0.x',
        '@youwol/os-core#0.x',
        '@youwol/installers-youwol#0.x',
    ],
    css: [
        'bootstrap#4.4.1~bootstrap.min.css',
        'fontawesome#5.12.1~css/all.min.css',
        '@youwol/fv-widgets#latest~dist/assets/styles/style.youwol.css',
    ],
    displayLoadingScreen: true,
})

await import('./on-load')
