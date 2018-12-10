'use strict'
const utils = require('./utils')
const config = require('../config')
// 判断是否是生产环境
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

module.exports = {
  // 作为vue-loader的配置，loaders选项允许用户配置组件中使用的loader
  // 当前的cssLoaders
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  },
  postcss: [
    require('postcss-plugin-px2viewport')({
      viewportWidth: 750, // default 750
      toRem: true, // default false
      toViewport: false, // default true
      exclude: /node_modules\/vux/  // 有些第三方库不需要转换的，需升级到版本0.2.0
    })
  ]
}
