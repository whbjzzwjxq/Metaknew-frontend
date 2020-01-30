module.exports = {
    'transpileDependencies': [
        'vuetify'
    ],
    'runtimeCompiler': true,
    'outputDir': 'template/',
    'assetsDir': 'static/dist',
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'development') {
            config.devtool = 'source-map';
        }
    }
}
