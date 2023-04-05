/**
 * This application exposes information about packages published in the YouWol ecosystem:
 * *  the package's internal files structure
 * *  any custom links (doc, coverage, ...) expose by the package's pipeline
 * *  the reference(s) of the package within the YouWol files system
 *
 * The application URL can feature two query parameters:
 * *  **package**: the name of the package to load in the application (default to {@link defaultPackage})
 * *  **tab**: the tab selected ('files', 'references', or one of the name of the package's custom links).
 *
 * @module
 */
export * from './on-load'
export * from './top-banner.view'
export * from './tabs'
