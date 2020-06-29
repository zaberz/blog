---
layout: post
title: "微信小程序的一次实践"
date: 2017-1-11 22:14
comments: true
tags: 
    - js
    - wxapp
---

微信宣布小程序开放内测第二天，公司运营拿到内测资格，欣喜若癫，誓要拿下微信给的这第一波红利。
当即随着微信开始了踩坑之旅。

### 代码结构：

```
wxapp
│  app.js                主程序入口
│  app.json              配置
│  app.wxss              全局样式
│  config.js             环境变量配置
│  configureStore.js     创建store
├─actions                
│      index.js
├─pages                  各业务页面存放目录
│  ├─index
│  │      index.js
│  │      index.json
│  │      index.wxml
│  │      index.wxss
│  ~...       
├─public                 公共资源：图片，组件
│  ├─image
│  └─components    
│      ├─toast
│      │    toast.js
│      │    toast.wxml
│      ~...    
├─reducers              
│      index.js
│      
└─utils                  公共函数
        mta_analysis.js
        promise.js
        redux.js
        util.js
```

<!-- more -->

最终代码结构如上；由于引入了redux，所以多了actions和reducers两个目录，至于为什么要大费周章在小程序中使用redux
曾经有人说过这样一句话：
>"如果你不知道是否需要 Redux，那就是不需要它。"

Redux 的创造者 Dan Abramov 又补充了一句：
>"只有遇到 React 实在解决不了的问题，你才需要 Redux 。"

我就是要用，你管我！？

### 遇到过的问题
* 遇到的第一个就是跨域的问题：之前的业务逻辑依赖于用户session，在小程序中每次请求所带的sessionid都是新的，不能维持登录态。
还有开发阶段在外网服务器没有对应api，并且wx.request强制检查域名的问题。
解决方法：加入config.js：配置环境变量；并且添加_ajax函数，把wx.request多封一层，在开发阶段使用XMLHttpRequest原生对象（在当时还可以，之后开发可以选择不验证域名，并且屏蔽了这个对象）
在每次发送的data中添加userid段，内容为服务器返回的用户标识。

* 组件仅仅是视图模板可重用，并非组件可重用：WXML语法中支持import和 include，在小程序开发中，只能将列表的模板抽象出来，不能将逻辑抽象出来，所以你就需要在两个页面上都实现一遍列表组件的控制逻辑，比如刷新、加载更多。。。
        
* wx.component不符合自己公司对于样式的需求，所以public下多了components目录，使用的时候要在wxml和js中分别引入。

* 在首次初始化时，缓存中无用户标识，每次发起请求时无标示要先请求授权，在回调函数中执行自己的逻辑。初始化时发起多个请求，异步的原因，需要用户多次确认授权，
造成很差的体验。解决方法：在app.js中全局添加一个单例promise对象，在还未得到服务器返回标识时，将所有请求推入等候队列，等得到后再执行。

### 成品

[生成K米点歌小程序二维码](http://www.ktvme.com/wap/applittle/getqrcode)
