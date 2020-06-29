---
layout: post
title: "vue.js的一次实践"
date: 2017-2-10 21:25
comments: true
tags: 
    - js
    - vue
---

keyword：nodejs，webpack，vue-cli，vue-router，vue-resource，vuex，vux

首先假装自己已经熟悉了nodejs和webpack的基本使用方法

<!-- more -->

### 安装
* 安装vue
    ``` bash
    npm install vue-cli -g
    vue init webpack projectname
    cd projectname
    npm install 
    ```
* 安装其他依赖
    ``` bash
    npm install vue-router, vue-resource, vuex, vux, vux-loader, vuex-i18n --save 
    ```
    
### 目录结构：

```
project
│  .babelrc
│  .editorconfig
│  .eslintignore
│  .eslintrc.js
│  .gitignore
│  index.html
│  package.json
│  README.md
│  
├─build
│      build.js
│      check-versions.js
│      dev-client.js
│      dev-server.js
│      utils.js
│      vue-loader.conf.js
│      webpack.base.conf.js
│      webpack.dev.conf.js
│      webpack.prod.conf.js
│      webpack.test.conf.js
│      
├─config
│      dev.env.js
│      index.js
│      prod.env.js
│      test.env.js
│      
├─src
│  │  App.vue
│  │  main.js
│  │  
│  ├─assets
│  │      logo.png
│  │      
│  ├─components
│  │      Hello.vue
│  │      
│  └─router
│          index.js
│          
├─static
│      .gitkeep
│      
└─test
    ├─e2e
    │  │  nightwatch.conf.js
    │  │  runner.js
    │  │  
    │  ├─custom-assertions
    │  │      elementCount.js
    │  │      
    │  └─specs
    │          test.js
    │          
    └─unit
        │  .eslintrc
        │  index.js
        │  karma.conf.js
        │  
        └─specs
                Hello.spec.js
                

```

### 根据需求修改脚手架：
* 引入vux和vux-loader：vux2必须配合vux-loader使用, 在build/webpack.base.conf.js里参照如下代码进行配置：
    ```javascript
    const vuxLoader = require('vux-loader')
    module.exports = vuxLoader.merge(webpackConfig, {
      options: {},
      plugins: [
        {
          name: 'vux-ui'
        },
        {
          name: 'less-theme',
          path: 'src/styles/theme.less'    //vux自定义主题文件
        }
        ]
    })
    ```

* vux部分组件用到i18n函数，如toast,故引入vuex-i18n；
    > 该插件通过$t()方法的使用易于访问本地化信息。
    这个插件将会在当前定义的区域中寻找将给定的字符串作为key，并返回相应的翻译。如果没有找到字符串，它将返回。
    
    在入口文件添加：
    ```javascript
    import Vue from 'vue'
    import Vuex from 'vuex'
    import vuexI18n from 'vuex-i18n'
    Vue.use(Vuex)
    // const debug = process.env.NODE_ENV !== 'production'
    let store = new Vuex.Store({
      modules: {
        i18n: vuexI18n.store,
      },
      // strict: debug,
    })
    Vue.use(vuexI18n.plugin, store)
    Vue.i18n.set('zh-CN')
    export default store
    ```

* 配置开发代理服务器：

修改config/index.js文件：
```javascript
{proxyTable: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
}
```
这样在请求 '/api/xxx'的时候会被代理到'localhost:9000/api/xxx'，用来解决本地node起的服务器取接口数据的跨域问题。

* 配置多入口：

    项目需求多入口，分模块。
    * 首先在build/utils.js 下添加：
    
        ```javascript
        var glob = require('glob');
        exports.getEntries = function (globPath) {
          var entries = {}
          glob.sync(globPath).forEach(function (entry) {
            var tmp = entry.split('/').splice(-3)
            var moduleName = tmp.slice(1, 2);
            entries[moduleName] = entry
          });
          return entries;
        }
      
        ```
        获取入口的函数   
    * 接着在build/webpack.dev.conf.js和build/webpack.prod.conf.js中先把<code>new HtmlWebpackPlugin()</code>删掉，然后添加：
    
        ```javascript
        var pages = utils.getEntries('./src/module/**/*.html')
        for(var page in pages) {
          // 配置生成的html文件，定义路径等
          var conf = {
            filename: page + '.html',
            template: pages[page], //模板路径
            inject: true,
            // excludeChunks 允许跳过某些chunks, 而chunks告诉插件要引用entry里面的哪几个入口            //即去除名字与html不一样的js;
            // 即去除名字与html不一样的js;
            excludeChunks: Object.keys(pages).filter(item => {
              return (item != page)
            })
          }
          // 需要生成几个html文件，就配置几个HtmlWebpackPlugin对象
          module.exports.plugins.push(new HtmlWebpackPlugin(conf))
        }
        ```
        
至此，脚手架就搭建完成

***
### 代码逻辑层

* 关于vue-router，应该抛开原先写后端的mvc模式，思维不能太僵化。个人的实践如下：
    
    在`router.js`中
    ```js
    var routers = {
      routes: [
        {
          path: '/',
          redirect: '/index/index'
        },
        {
          path: '/tool',
          name: 'Tool',
          component: Tool
        },
        {
          path: '/index',
          name: 'Index',
          component: IndexMain,
          children:[{
            path:'index',
            component:Index,
              children:[{
                path:'a',
                component:a
        }]
          },{
            path:'status/:id',
            component:Status
          },]
        },
        {
          path: '/login',
          name: 'login',
          component: login
        }
      ]
    }
    ```
    并且在`App.vue`中页面保持纯净：
    ```html
    <template>
      <div id="app">
        <router-view></router-view>
      </div>
    </template>
    ```
    通过路由嵌套来一层层加载组件；如
    `index.vue`
    ```html
      <template>
        <div>
          <top-header></top-header>
          <router-view></router-view>
          <bottom-menu></bottom-menu>
        </div>
      </template>
    ```
    `login.vue`
    ```html
      <template>
        <div>
          <box gap="10px 10px">
            <group>
              <x-input placeholder="请输入账号" required v-model="username"></x-input>
              <x-input placeholder="请输入密码" required v-model="password"></x-input>
            </group>
            <x-button :text="buttonText" :disabled="buttonDisable" @click.native="test" type="primary"></x-button>
          </box>
          <toast :text="toastText" v-model="toastShow" type="cancel"></toast>
          </div>
      </template>
    ```
    在/index的路由下，有头菜单和下方菜单tab组件，而/login下就是纯净的登录页面，增加了灵活性。
    
* 还是关于路由，路由实例化最好在main.js下执行而不是单独在router/index.js中。原因是实际项目有可能需要在路由中操作store，
如`router.beforeEach()`中做跳转的动画，单独文件取不到store。
    
* 关于vuex：
> 每一个 Vuex 应用的核心就是 store（仓库）。"store" 基本上就是一个容器，它包含着你的应用中大部分的状态(state)。Vuex 和单纯的全局对象有以下两点不同：
> 1. Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
> 2. 你不能直接改变 store 中的状态。改变 store 中的状态的唯一途径就是显式地提交(commit) mutations。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

具体使用方法参见：[vuex文档](http://vuex.vuejs.org/zh-cn/)

自此，就可以愉快的开始编写业务代码了。勇敢的少年啊，快去创造奇迹。
***
### 关于单元测试

我还不懂怎么用。断言库和end2end是什么我根本就不知道。
等学完mocha或者karma再补充更新。

***
未完待续。
