---
layout: post
title: "mockjs"
date: 2017-3-2 15:25
comments: true
tags: 
    - nodejs
---
# Mock.js实现的功能
* 基于 数据模板 生成数据
* 基于 HTML模板 生成数据
* 拦截并模拟 Ajax请求

让前端独立于后端进行开发
[mockjs 文档]https://github.com/nuysoft/Mock/wiki

<!-- more -->

现在前端获取数据有2种方式：
1. 使用proxy代理，直接获取接口数据
2. 使用mockjs，获取随机数据


# 引入项目
关于mockjs的用法直接看文档有详细介绍，这里写的是如何引入项目，使开发使用mockjs，线上环境走正常流程
有以下三种实现方式：

* 1.在webpack配置中加上环境变量,入口文件中根据是否生产环境来判断是否使用mockjs
```javascript
//webpack.dev.config
new webpack.DefinePlugin({
      'process.env': config.dev.env
    });

//entry.js
if(process.env.NODE_ENV == 'production'){
    const mock = require('mock.js')
}

//mock.js
import Mock from 'mockjs'

Mock.mock( rurl, template )

```


* 2.在webpack.dev.conf.js配置文件中把写好的mock.js文件单独打包一份，在页面中引入，实现开发环境下引入脚本。
```javascript
var config = {
    entry: {
        app: '入口',
        vendor: ['mock.js'] //第三方库
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')//这是妮第三方库打包生成的文件
    ]
}
```

* 3.这个方法其实没有真正使用到mockjs，只是在发送请求的时候代理到自己的express中，然后返回需要的数据，具体用法如下：

```javascript

//dev-server.js
var app = new express()
var mockDir = path.resolve(__dirname, '../mock');
(function setMock(mockDir) {
  fs.readdirSync(mockDir).forEach(function (file) {
    var filePath = path.resolve(mockDir, file);
    var mock;
    if (fs.statSync(filePath).isDirectory()) {
      setMock(filePath);
    }
    else {
      mock = require(filePath);
      app.use(mock.api, argv.proxy ? proxyMiddleware({target: 'http://' + argv.proxy}) : mock.response);
    }
  });
})(mockDir);

// ~./mock/hello.js
module.exports = {
  api: '/api/hello',
  response: function (req, res) {
    res.send('mock-data');
  }
}

```

我用的是第二种写法，能够满足各种需求。
个人觉得mockjs不仅可以用在拦截ajax返回随机数据这方面，还可以用来做很好的单元测试工具。
