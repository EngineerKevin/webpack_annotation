'use strict'
const utils = require('./utils') // 预定义好的一些工具方法，详情请查看该文件
const webpack = require('webpack') // webpack 打包工具
const config = require('../config') // 当前项目配置文件
const merge = require('webpack-merge') // 这是一个webpack配置合并工具，它允许你将你的配置文件拆成多个文件，用此工具将多个配置文件合并成一个配置输出，比如本项目将webpack.conf.js拆成了3个文件，base(公共基础)·dev(开发配置)·prod(生产配置)
const path = require('path') // node提供的路径方法
const baseWebpackConfig = require('./webpack.base.conf') // 拆分出来的webpack基础配置
const CopyWebpackPlugin = require('copy-webpack-plugin') // 用来拷贝文件的webpack插件
const HtmlWebpackPlugin = require('html-webpack-plugin') // webpack中html操作简化插件
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin') // webpack错误输出优化插件
const portfinder = require('portfinder') // node的一个函数库，用来查询指定端口的状态

/*
 * process: process对象是一个全局变量，提供 Node.js 进程的有关信息以及控制进程。 因为是全局变量，所以无需使用 require()
 * process: process.env属性返回一个包含用户环境信息的对象
 * process.env.HOST 当前环境host
 * process.env.PORT 当前环境PORT
 * 以下代码为获取当前环境的host和port
 */

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

// 构造开发环境webpack配置，通过webpack-merge和baseConfig合并
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  // 安装调试用服务 npm install webpack-dev-server --save-dev
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    // 是否开启热更新
    hot: true,
    // 因为我们使用了CopyWebpackPlugin这个插件，所以不用设置内容路径
    contentBase: false, // since we use CopyWebpackPlugin.
    // 开启虚拟服务器时，为你的代码进行压缩。加快开发流程和优化的作用
    compress: true,
    // 服务器host
    host: HOST || config.dev.host,
    // 服务器port
    port: PORT || config.dev.port,
    // 设置是否自动打开浏览器
    open: config.dev.autoOpenBrowser,
    // 如果为 true ，在浏览器上全屏显示编译的errors或warnings。默认 false （关闭）
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    // 配置了 publicPath后， url = '主机名' + 'publicPath配置的' + '原来的url.path'
    publicPath: config.dev.assetsPublicPath,
    // 当您有一个单独的API后端开发服务器，并且想要在同一个域上发送API请求时，则代理这些 url
    proxy: config.dev.proxyTable,
    // true，则终端输出的只有初始启动信息。 webpack 的警告和错误是不输出到终端的
    // 引用FriendlyErrorsPlugin则必须设置为true
    quiet: true, // necessary for FriendlyErrorsPlugin
    // 一组自定义的监听模式，用来监听文件是否被改动过。
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    // 热加载扩展
    new webpack.HotModuleReplacementPlugin(),
    // 在热加载时直接返回更新文件名
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    // 存疑
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    // html-webpack-plugin，本插件用于简化html操作
    // 简单作用就是根据模板自动生成html文件
    new HtmlWebpackPlugin({
      // 生成的index.html
      filename: 'index.html',
      // 调用的模板
      // 可以使用html，jada，ejs等多种模板，但是需要配置指定模板的loaders
      template: 'index.html',
      // inject有四个值： true body head false
      // true 默认值，script标签位于html文件的 body 底部
      // body script标签位于html文件的 body 底部
      // head script标签位于html文件的 head中
      // false 不插入生成的js文件，这个几乎不会用到的
      inject: true
    }),
    // copy custom static assets
    // 基本作用是在webpack中拷贝文件和文件夹
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    // 使用ProvidePlugin加载的模块在使用时将不再需要import和require进行引入
    new webpack.ProvidePlugin({
      Vue: "vue"
    })
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
