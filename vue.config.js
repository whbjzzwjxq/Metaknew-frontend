module.exports = {
    'transpileDependencies': [
        'vuetify'
    ],
    'runtimeCompiler': true,
    'outputDir': 'template/',
    'assetsDir': 'static/dist',
    configureWebpack: {
        devtool: process.env.NODE_ENV === 'development' ? 'source-map' : '',
        module: {}
    }
};
