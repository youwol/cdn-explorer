module.exports = {
    entryPoints: ['./src/app/index.ts'],
    exclude: ['./src/tests', './src/app/top-banner'],
    out: 'dist/docs',
    theme: 'default',
    categorizeByGroup: false,
    categoryOrder: ['Getting Started', '*'],
    excludeExternals: true,
}