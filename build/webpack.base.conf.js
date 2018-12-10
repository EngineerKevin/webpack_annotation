'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const webpack = require('webpack')

//__dirname是node的全局变量，指的是当前被执行js的绝对路径
// 路径配置方法
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

// 本方法返回eslint-loader的loader配置，在module中会根据config.dev.useEslint来决定进不进行配置
// 文档：https://www.npmjs.com/package/eslint-loader
// 注意：webpack中使用eslint-loader需要同时安装eslint
// 在根目录下使用.eslintrc.js对eslint进行规则配置，具体规则可以查看@https://cn.eslint.org/
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  context: path.resolve(__dirname, '../'),
  // webpack配置的入口起点，也就是当前src下的main.js
  entry: {
    // 此处用了对象语法，除了app(应用程序)入口之外，还可以有vendor(第三方库)入口
    app: './src/main.js'
  },
  // output最低要求是，将它的值设置为一个对象，包括path和filename
  output: {
    // 目标输出目录 path 的绝对路径，从config中获取
    path: config.build.assetsRoot,
    // filename 用于输出文件的文件名
    filename: '[name].js',
    // publicPath用于指定cdn
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      '@': resolve('src'),
      '@common': resolve('src/common'),
      'utils': resolve('src/utils'),
      'api': resolve('src/api'),
      'router': resolve('src/router'),
      'components': resolve('src/components'),
      'assets': resolve('src/assets'),
      'mixins': resolve('src/mixins')
    }
  },
  // 编译工具
  module: {
    rules: [
      // 根据当前配置判断需不需要用eslint
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      // 处理vue文件的loader
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // 这里是vue-loader的配置文件
        options: vueLoaderConfig
      },
      // 处理es6语法的babel-loader
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      // 静态资源路径loader
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  // webpack插件
  plugins: [
    // 关于这个内置插件，详情请见笔记
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname),
      manifest: require('./manifest.json')
    })
  ],
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
