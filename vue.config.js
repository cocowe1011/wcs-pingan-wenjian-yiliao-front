const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        crypto: require.resolve('crypto-browserify')
      },
      alias: {
        '@': path.join(__dirname, 'src')
      }
    },
    plugins: [new NodePolyfillPlugin()]
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'wcs-pingan-wenjian-yiliao-front', //生成exe的名字
        appId: 'com.wl.wcs', //包名
        copyright: 'wl', //版权信息,
        nsis: {
          oneClick: false, // 是否一键安装
          allowElevation: true, // 允许请求提升。若为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, //是否允许修改安装目录
          installerIcon: './build/icons/icon.ico', // 安装时图标
          uninstallerIcon: './build/icons/icon.ico', //卸载时图标
          installerHeaderIcon: './build/icons/icon.ico', // 安装时头部图标
          createDesktopShortcut: true, // 是否创建桌面图标
          createStartMenuShortcut: true, // 是否创建开始菜单图标
          shortcutName: 'WCS', // 快捷方式名称
          runAfterFinish: false //是否安装完成后运行
        },
        win: {
          icon: 'build/icons/icon.ico', //图标路径
          target: [
            {
              target: 'nsis', //利用nsis制作安装程序
              arch: [
                'x64' //64位
                // "ia32" //32位
              ]
            }
          ]
        },
        asar: false
      }
    }
  }
});
