---
layout: post
title: "从vue源码看测试集成"
date: 2017-12-21 23:32
comments: true
tags: 
    - javascript
---

### 从测试命令开始：

入口测试指令npm run test;
在package.json 当中；
```
"test": "npm run lint && flow check && npm run test:types && npm run test:cover && npm run test:e2e -- --env phantomjs && npm run test:ssr && npm run test:weex",
```
前三条是语法检测，按照各自的代码格式或者语法配置说明配置好之后就能顺利跑起来，并且带自动纠正功能。


<!-- more -->


### npm run test:cover
```
"test:cover": "karma start test/unit/karma.cover.config.js"
```
单元测试部分，能够生成测试覆盖率报告；
首先看入口测试配置：karma.cover.config.js；
第一行导入了所有测试都引入的基本配置文件karma.base.config.js;其中定义了单元测试的基本框架以及入口文件等；

结合两份配置分析。

首先是一些基本概念：

* Karma是一个基于Node.js的JavaScript测试执行过程管理工具（Test Runner）。
* Jasmine是单元测试框架，本单将介绍用Karma让Jasmine测试自动化完成。
* istanbul是一个单元测试代码覆盖率检查工具，可以很直观地告诉我们，单元测试对代码的控制程度。


#### 使用karma框架 
* [karma](http://karma-runner.github.io/2.0/index.html)介绍;
* [jasmine](https://jasmine.github.io/1.3/introduction.html)语法介绍;

karma配置中定义了：
* 使用Jasmine单元测试框架；
* karma-webpack 的基本配置（对于模块化的源代码，需要使用webpack进行预处理）；
* 待测试的文件和测试文件的总入口：'index.js'（在index.js中通过require.content来动态引入需要测试的文件，减少源码更改之后测试配置改动的需求）；
* 定义js文件需要使用的预处理器：['webpack','sourcemap'];
* 使用phantomjs无头浏览器，不实例化页面，加快测试速度；
* 报告类型选用['mocha', 'coverage'];其中 [karma-mocha-reporter](https://www.npmjs.com/package/karma-mocha-reporter)用来更改报告样式;[coverage](https://www.npmjs.com/package/karma-coverage)用来生成测试覆盖率报告；
* coverageReporter配置测试覆盖率报告的风格，已经报告生成目录；

注意的点:
一般我们在配置测试覆盖率的时候写法是：
```
preprocessors: {
    './src/*.js': ['coverage']
},
```
使用coverage预处理把src目录下的所有js文件全都加入覆盖率统计当中；
但是使用karma-coverage检测Webpack打包后的代码，会出现覆盖率出错的情况,因为一般代码覆盖率的检测是需要统计被测试代码中需要测试的量，比如函数、行数等信息，然而打包后的代码因为被混入了很多别的代码，或者是变量被私有化了，这些统计就会出问题。

在这里作者使用了[babel-plugin-istanbul](http://gotwarlost.github.io/istanbul/)
插件在代码打包之前进行统计;
自此，单元测试配置基本解决；剩下的就是测试代码的编写；
遵循jasmine使用规范；使用describe加回调函数的套件；一步步完成对源代码的测试用例编写；完善覆盖率
#### npm run test:e2e
端对端测试

