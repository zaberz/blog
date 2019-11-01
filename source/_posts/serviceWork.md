---
layout: post
title: service worker一日游
date: 2019-10-17
---

## service worker

### 与web worker的异同：

* Service Worker 工作在 worker context 中，是没有访问 DOM 的权限的，所以我们无法在 Service Worker 中获取 DOM 节点，也无法在其中操作 DOM 元素；
* 我们可以通过 postMessage 接口把数据传递给其他 JS 文件；
* Service Worker 中运行的代码不会被阻塞，也不会阻塞其他页面的 JS 文件中的代码；

* 不同的地方在于，Service Worker 是一个浏览器中的进程而不是浏览器内核下的线程，因此它在被注册安装之后，能够被在多个页面中使用，也不会因为页面的关闭而被销毁。因此，Service Worker 很适合被用与多个页面需要使用的复杂数据的计算——购买一次，全家“收益”。

### 支持的事件：
install,activate,message,fetch,sync,push
### 主要功能

* 离线缓存
* 服务端推送消息
* 代理请求&请求劫持
* 跨页面通信

### 上手

关于离线缓存
[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)
和消息通知[google develop](https://developers.google.com/web/fundamentals/codelabs/push-notifications/?hl=zh-cn#top_of_page)
这两篇里都已经安排的明明白白了。
 
唯一要提的是推送服务依赖一个FCM服务，而这个服务是被墙的，所以国内基本看不到推送消息。[具体文档](https://firebase.google.com/docs/cloud-messaging/?hl=zh-cn)

### 思考

* 在使用离线缓存时，甚至可以缓存入口html。而不是像配置了etag或者last-modified 一样，返回304。这就极大增强了应用离线访问的能力，如果站点是个纯静态的，那体验可以做到相当好。但是都9102年了，除了博客、文档，还存在纯静态的网站吗？
我们的痛点永远是首屏加载不够快。现在的spa应用基本上是先载好JS资源然后再发起异步请求，获取首屏数据渲染。所以才有ssr来解决下载文件，执行脚本到获取数据这段空白时间。
通过离线缓存，可以快速从本地打开页面，因为全是from appcache，不用同服务器交互，再载入框架shell页面之后，可以增加各种骨架屏、占位图来增强loading时的体验。

* 关于cache api，cache内容要求我们指定cache文件名，或者通过拦截fetch请求然后cache.add(response.clone())加入到AppCache中。spa应用大部分文件都是带hash的，所以要提前生成一份文件列表，需要做的工作有1、构建工程，生成dist文件。2、写脚本获取生成的js、css文件列表（或许还有image），更新service worker文件。使用请求拦截的情况需要判断请求是否未api请求，否则缓存了个接请求就大事不好了（虽然cache会忽略post等请求）。

* 如何做到更快？类似微博，在下次唤醒时保留的还是之前看的feed流内容。所以web应用也可以把状态管理里的内容存到indexdb里，等待下一次程序唤醒时找个合理的实际，再把store载入回来，因为内容都是cache过的，所以可以立马打开。

* service worker的优势只有请求代理和缓存吗？前面我们说到他与web worker的区别时提到他是一个进程。他提供了一个clients对象可以向所有打开的窗口postMessage。在一些特殊场景下：比如我现在正在做的在线答题，一张页面记录了答题进度，一张记录了答题详情，测试要求我们答题时另一张的页面要一起更新。放以前我就上socket或者根据visibilitychange重新获取数据了，
现在可以使用service worker向所有页面广播答题进度，对应界面收到消息之后再更新。

