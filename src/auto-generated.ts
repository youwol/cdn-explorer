
const runTimeDependencies = {
    "load": {
        "@youwol/os-core": "^0.1.0",
        "@youwol/fv-tabs": "^0.2.0",
        "@youwol/os-top-banner": "^0.1.0",
        "@youwol/cdn-client": "^1.0.0",
        "@youwol/http-clients": "^1.0.0",
        "@youwol/flux-view": "^1.0.0",
        "@youwol/installers-youwol": "^0.1.0",
        "rxjs": "^6.5.5"
    },
    "differed": {},
    "includedInBundle": []
}
const externals = {
    "@youwol/os-core": "window['@youwol/os-core_APIv01']",
    "@youwol/fv-tabs": "window['@youwol/fv-tabs_APIv02']",
    "@youwol/os-top-banner": "window['@youwol/os-top-banner_APIv01']",
    "@youwol/cdn-client": "window['@youwol/cdn-client_APIv1']",
    "@youwol/http-clients": "window['@youwol/http-clients_APIv1']",
    "@youwol/flux-view": "window['@youwol/flux-view_APIv1']",
    "@youwol/installers-youwol": "window['@youwol/installers-youwol_APIv01']",
    "rxjs": "window['rxjs_APIv6']",
    "rxjs/operators": "window['rxjs_APIv6']['operators']"
}
const exportedSymbols = {
    "@youwol/os-core": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/os-core"
    },
    "@youwol/fv-tabs": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/fv-tabs"
    },
    "@youwol/os-top-banner": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/os-top-banner"
    },
    "@youwol/cdn-client": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/cdn-client"
    },
    "@youwol/http-clients": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/http-clients"
    },
    "@youwol/flux-view": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/flux-view"
    },
    "@youwol/installers-youwol": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/installers-youwol"
    },
    "rxjs": {
        "apiKey": "6",
        "exportedSymbol": "rxjs"
    }
}
export const setup = {
    name:'@youwol/cdn-explorer',
        assetId:'QHlvdXdvbC9jZG4tZXhwbG9yZXI=',
    version:'0.1.0',
    shortDescription:"CDN explorer application",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/cdn-explorer',
    npmPackage:'https://www.npmjs.com/package/@youwol/cdn-explorer',
    sourceGithub:'https://github.com/youwol/cdn-explorer',
    userGuide:'https://l.youwol.com/doc/@youwol/cdn-explorer',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols
}

export function getExportedSymbolName(module:string){
    return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
}
