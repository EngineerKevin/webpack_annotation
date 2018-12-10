'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'

const ora = require('ora') // ora 命令行加载动画和各种图标
const rm = require('rimraf') // rimraf 包装好的rm -rf命令
const path = require('path') // path node中路径模块
const chalk = require('chalk') // chalk 用来修改控制台中字符串的样式（颜色/字体/背景）
const webpack = require('webpack') // webpack 打包代码
const config = require('../config') // config 当前项目配置文件
const webpackConfig = require('./webpack.prod.conf') // webpackConfig webpack配置入口文件

const spinner = ora('building for production...') // 定义一个ora实例，用来在console输出loading图标
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // if you are using ts-loader, setting this to true will make typescript errors show up during build
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
