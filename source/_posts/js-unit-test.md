---
layout: post
title: "前端工程单元测试和功能测试"
date: 2017-2-17 21:25
comments: true
tags: 
    - js
    - nodejs
---

keyword: mocha, nightmare, nightwatch
***
### Web 应用越来越复杂，意味着更可能出错。测试是提高代码质量、降低错误的最好方法之一。

* 测试可以确保得到预期结果。
* 加快开发速度。
* 方便维护。
* 提供用法的文档。
* 对于长期维护的项目，测试可以减少投入时间，减轻维护难度。

### 测试的类型

* 单元测试（unit testing）
* 功能测试（feature testing）
* 集成测试（integration testing）
* 端对端测试 (End-to-End testing）

<!-- more -->

### 以测试为导向的开发模式

* TDD：测试驱动的开发（Test-Driven Development）
* BDD：行为驱动的开发（Behavior-Driven Development）
它们都要求先写测试，再写代码。

以上来自阮一峰
***

# mocha 

* [Mocha](http://mochajs.org/)是一个测试框架，在浏览器和node环境中都能使用。除了Mocha，类似的测试框架还有Jasmine、Karma、Tape等
* Mocha最好搭配一个断言库来使用，我用的是[chai](http://chaijs.com/)

## 动手

```bash
npm install mocha --global
npm install mocha,chai --save-dev
```

现有一个待测试的函数：
```javascript
    //a.js
    function a() {
        return 1
    }
    module.exports = test;
```
编写测试脚本：通常，测试脚本与所要测试的源码脚本同名，但是后缀名为.test.js（表示测试）或者.spec.js（表示规格）。
```javascript
    //a.test.js
    var a = require('a.js'),
    expert = require('chai').expert,
    should = require('chai').should(),
    assert = require('chai').assert;
    
    describe('a函数的测试', function() {
        it('a函数返回1', function() {
            expect(a()).to.be.equal(1);
        });
        it('a函数返回1', function() {
            a().should.equal(1);
        });
        it('a函数返回1',function() {
            assert.equal(a(),1)
        })
        
    });
```

上面这段代码，就是测试脚本，它可以独立执行。测试脚本里面应该包括一个或多个describe块，每个describe块应该包括一个或多个it块。
describe块称为"测试套件"（test suite），表示一组相关的测试。它是一个函数，第一个参数是测试套件的名称，第二个参数是一个实际执行的函数。
it块称为"测试用例"（test case），表示一个单独的测试，是测试的最小单位。它也是一个函数，第一个参数是测试用例的名称，第二个参数是一个实际执行的函数。

`expect(add(1, 1)).to.be.equal(2);`是一句断言。所谓"断言"，就是判断源码的实际执行结果与预期结果是否一致，如果不一致就抛出一个错误。上面这句断言的意思是，调用add(1, 1)，结果应该等于2。
所有的测试用例（it块）都应该含有一句或多句的断言。它是编写测试用例的关键。断言功能由断言库来实现，Mocha本身不带断言库，所以必须先引入断言库。

如果断言不成立，就会抛出一个错误。事实上，只要不抛出错误，测试用例就算通过。
上面代码用到chai的export、should和assert三种断言风格，读者可依据自己喜好随意选择。
## mocha 命令行参数

* --help或-h参数，用来查看Mocha的所有命令行参数。
* --reporter，-R 参数用来指定测试报告的格式，默认是spec格式。
* --reporters参数可以显示所有内置的报告格式。
* --watch，-w 参数用来监视指定的测试脚本。只要测试脚本有变化，就会自动运行Mocha。
* --bail，-b 参数指定只要有一个测试用例没有通过，就停止执行后面的测试用例。这对持续集成很有用。
* --grep，-g 参数用于搜索测试用例的名称（即it块的第一个参数），然后只执行匹配的测试用例。
* --invert，-i 参数表示只运行不符合条件的测试脚本，必须与--grep参数配合使用。
## ES6
如果测试脚本是用ES6写的，那么运行测试之前，需要先用Babel转码。
```bash
npm install babel-core babel-preset-es2015 --save-dev
```

然后，在项目目录下面，新建一个.babelrc配置文件。
```javascript
{
  "presets": [ "es2015" ]
}
```
最后，使用--compilers参数指定测试脚本的转码器。
```bash
../node_modules/mocha/bin/mocha  --compilers js:babel-core/register
```
上面代码中，--compilers参数后面紧跟一个用冒号分隔的字符串，冒号左边是文件的后缀名，右边是用来处理这一类文件的模块名。上面代码表示，运行测试之前，先用babel-core/register模块，处理一下.js文件。由于这里的转码器安装在项目内，所以要使用项目内安装的Mocha；如果转码器安装在全局，就可以使用全局的Mocha。
注意，Babel默认不会对Iterator、Generator、Promise、Map、Set等全局对象，以及一些全局对象的方法（比如Object.assign）转码。如果你想要对这些对象转码，就要安装babel-polyfill。

```bash
$ npm install babel-polyfill --save
```
然后，在你的脚本头部加上一行。
```javascript
import 'babel-polyfill'
```
## 测试用例的钩子

Mocha在describe块之中，提供测试用例的四个钩子：before()、after()、beforeEach()和afterEach()。它们会在指定时间执行。
```javascript
describe('hooks', function() {

  before(function() {
    // 在本区块的所有测试用例之前执行
  });

  after(function() {
    // 在本区块的所有测试用例之后执行
  });

  beforeEach(function() {
    // 在本区块的每个测试用例之前执行
  });

  afterEach(function() {
    // 在本区块的每个测试用例之后执行
  });

  // test cases
});
```

## 浏览器测试
除了在命令行运行，Mocha还可以在浏览器运行。
首先，使用`mocha init`命令在指定目录生成初始化文件。
然后，把需要测试的文件如`add.js`，以及断言库chai.js，加入index.html。
```html
<script>
  mocha.setup('bdd');
</script>
<script src="add.js"></script>
<script src="http://chaijs.com/chai.js"></script>
<script src="tests.js"></script>
<script>
  mocha.run();
</script>
```
最后，在`tests.js`里面写入测试脚本。
打开index.html就能看到测试结果。

## 生成规格文件
```bash
mocha --recursive -R markdown > spec.md
```
上面命令根据test目录的所有测试脚本，生成一个规格文件`spec.md。-R markdown`参数指定规格报告是markdown格式。
如果想生成HTML格式的报告spec.html，使用下面的命令。
```bash
$ mocha --recursive -R doc > spec.html
```

***

# Nightmare
  [nightmare](http://www.nightmarejs.org/)是一个基于phantomjs的测试框架一个基于phantomjs之上为测试应用封装的一套high level API。其API以goto, refresh, click, type…等简单的常用e2e测试动作封装，使得其语义清晰，简洁。

## 动手


```bash
# Linux & Mac
$ env ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/ npm install

# Windows
$ set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
$ npm install
```

注意，Nightmare 会先安装 Electron，而 Electron 的安装需要下载境外的包，有时会连不上，导致安装失败。所以，这里先设置了环境变量，指定使用国内的 Electron 源，然后才执行安装命令。

```javascript
var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true });
```

上面代码表示新建一个 Nightmare 实例，并且运行功能中，自动打开浏览器窗口。

```javascript
nightmare
  .goto('https://www.taobao.com/')
  .type('#q', '电视机')
  .click('form[action*="/search"] [type=submit]')
  .wait('#spulist-grid')
  .evaluate(function () {
    return document.querySelector('#spulist-grid .grid-item .info-cont')
      .textContent.trim();
  })
  .end()
```

上面代码表示，打开淘宝首页，在搜索框键入`电视机`，点击”搜索“按钮，等待`#spulist-grid`元素出现，在页面内注入（`evaluate`）代码，将执行结果返回。

```javascript
  .then(function (result) {
    console.log(result);
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });
```

Nightmare 会返回一个 Promise 对象，`then`方法指定操作成功的回调函数，`catch`方法指定操作失败的回调函数。

### 结合mocha

```javascript
var Nightmare = require('nightmare');
var expect = require('chai').expect;
var fork = require('child_process').fork;

describe('test index.html', function() {
  var child;

  before(function (done) {
    child = fork('./server.js');
    child.on('message', function (msg) {
      if (msg === 'listening') {
        done();
      }
    });
  });

  after(function () {
    child.kill();
  });

  it('点击后标题改变', function (done) {
    var nightmare = Nightmare({ show: true });
    nightmare
      .goto('http://127.0.0.1:8080/index.html')
      .click('h1')
      .wait(1000)
      .evaluate(function () {
        return document.querySelector('h1').textContent;
      })
      .end()
      .then(function(text) {
        expect(text).to.equal('Hello Clicked');
        done();
      })
  });

});

//子进程脚本server.js
var httpServer = require('http-server');
var server = httpServer.createServer();
server.listen(8080);
process.send('listening');
```

***

# nightwatch
[nightwatch](http://nightwatchjs.org/)与nightmare相似，都用于做端对端（e2e）测试。因为在vue-cli中使用的是nightwatch，所以一并介绍。

>Nightwatch是一套新近问世的基于Node.js的验收测试框架，使用Selenium WebDriver API以将Web应用测试自动化。它提供了简单的语法，支持使用JavaScript和CSS选择器，来编写运行在Selenium服务器上的端到端测试。

目前，Selenium是JavaScript的世界里验收测试方面最流行的工具之一，类似的还有PhantomJS。二者都有其独到的方法：Selenium使用其WebDriver API，而PhantomJS使用无界面的WebKit浏览器。它们都是非常成熟的工具，都具有强大的社区支持。它们与Nightwatch之间最大的不同，主要是在于语法的简易度以及对持续集成的支持。与Nightwatch相比，Selenium和PhantomJS都拥有更加冗长的语法，这会让编码变得更庞大，而且不支持从命令行中进行开箱即用的持续集成（JUnit XML或其他标准输出）。

不同于行为驱动测试（BDD）和单元测试独立运行并使用模拟/存根，端到端测试将试着尽可能从用户的视角，对真实系统的访问行为进行仿真。对Web应用来说，这意味着需要打开浏览器、加载页面、运行JavaScript，以及进行与DOM交互等操作。

## 动手

```bash
$ npm install [-g] nightwatch
```

### 配置文件：`nighewatch.conf.js` 或`nightwatch.json`
```javascript
{
  "src_folders" : ["tests"], //测试文件存放地址
  "output_folder" : "reports", //生成JUnit XML 测试报告保存地址
  "custom_commands_path" : "",
  "custom_assertions_path" : "",
  "page_objects_path" : "",
  "globals_path" : "", //外部全局扩展地址，能在test_settings中重新定义覆盖

  "selenium" : {  //selenium 配置
    "start_process" : false,
    "server_path" : "",
    "log_path" : "",
    "port" : 4444,
    "cli_args" : {
      "webdriver.chrome.driver" : "",
      "webdriver.gecko.driver" : "",
      "webdriver.edge.driver" : ""
    }
  },

  "test_settings" : { //所有测试选项
    "default" : {
      "launch_url" : "http://localhost",
      "selenium_port"  : 4444,
      "selenium_host"  : "localhost",
      "silent": true,
      "globals" : {
        "myGlobalVar" : "some value",
        "otherGlobal" : "some other value"
      }
      "screenshots" : {
        "enabled" : false,
        "path" : ""
      },
      "desiredCapabilities": { //传给selenium的浏览器驱动
        "browserName": "firefox",
        "marionette": true
      }
    },

    "chrome" : {
      "desiredCapabilities": {
        "browserName": "chrome"
      }
    },

    "edge" : {
      "desiredCapabilities": {
        "browserName": "MicrosoftEdge"
      }
    }
  }
}
```

其余配置项：
* live_output:boolean————Whether or not to buffer the output in case of parallel running. See below for details.
* disable_colors:boolean————Controls whether or not to disable coloring of the cli output globally.
* parallel_process_delay:integer————Specifies the delay(in milliseconds) between starting the child processes when running in parallel mode.
* test_workers:boolean|object————Whether or not to run individual test files in parallel. If set to true, runs the tests in parallel and determines the number of workers automatically. 
If set to an object, can specify specify the number of workers as "auto" or a number.Example: `"test_workers" : {"enabled" : true, "workers" : "auto"}`  
                                
* test_runner：string|object ————Specifies which test runner to use when running the tests. Values can be either default (built in nightwatch runner) or mocha.Example: `"test_runner" : {"type" : "mocha", "options" : {"ui" : "tdd"}}`
                            
#### Selenium设置
Nightwatch 能自动开启和停止Selenium进程，所以不用过多关注这一项。
If you'd like to enable this, set start_process to true and specify the location of the jar file inside server_path.
如果不想开启这项功能，设置start_process为true并且在server_path中指定selenium 的jar文件详细目录，例如： bin/selenium-server-standalone-2.43.0.jar

还有日志存放目录、监听端口、cli参数配置不多介绍

#### Test settings设置
default为必须，其他都是从此继承而来
```bash
 nightwatch --env chrome
```
即执行到chrome里的配置

```javascript
module.exports = {
  'Demo test' : function (browser) {
    console.log(browser.globals);
      // {
      //   "myGlobalVar" : "some value",
      //   "otherGlobal" : "some other value"
      // }

    browser
      .url(browser.launchUrl)
      // ...
      .end();
  }
};
```
以上是.test.js中的部分代码，用来说明配置关系。

还有其他详细配置，太长不看。
### 编写用例
一个基本的测试文件如下：
```javascrupt
module.exports = {
  'Demo test Google' : function (browser) {
    browser
      .url('http://www.google.com')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'nightwatch')
      .waitForElementVisible('button[name=btnG]', 1000)
      .click('button[name=btnG]')
      .pause(1000)
      .assert.containsText('#main', 'Night Watch')
      .end();
  }
};
```

调用`.end()`来关闭Selenium会话
```javascript
module.exports = {
  'step one' : function (browser) {
    browser
      .url('http://www.google.com')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'nightwatch')
      .waitForElementVisible('button[name=btnG]', 1000)
  },

  'step two' : function (browser) {
    browser
      .click('button[name=btnG]')
      .pause(1000)
      .assert.containsText('#main', 'Night Watch')
      .end();
  }
};
```
多个步骤的test

```javascript
module.exports = {
  before : function(browser) {
      console.log('Setting up...');
  },
  after : function(browser，done) {
      setTimeout(function(){
          done()
      },0)
  },
  'Demo test Google' : function (client) {
    client
      .url('http://google.no')
      .pause(1000);
    // expect element  to be present in 1000ms
    client.expect.element('body').to.be.present.before(1000);
    // expect element <#lst-ib> to have css property 'display'
    client.expect.element('#lst-ib').to.have.css('display');
    // expect element  to have attribute 'class' which contains text 'vasq'
    client.expect.element('body').to.have.attribute('class').which.contains('vasq');
    // expect element <#lst-ib> to be an input tag
    client.expect.element('#lst-ib').to.be.an('input');
    // expect element <#lst-ib> to be visible
    client.expect.element('#lst-ib').to.be.visible;
    client.end();
  }
};
```
expect的原型是来自chai的expect接口
同样拥有before\[Each\] and after\[Each\]钩子
异步操作使用回调函数来完成执行。如上面的done()

* Api接口
  [接口](http://nightwatchjs.org/api)大致分为如下四类
    1. expect 如 browser.expect.element('#main').text.to.equal('The Night Watch');
    2. assert
    3. 操作命令 如 client.click("#main ul li a.first");
    4. 浏览器驱动的协议 如： browser.url('http://localhost');
  
### 与mocha搭配使用
首先在nightwatch.json文件中添加：
```javascript
{
  ...
  "test_runner" : "mocha"
}
```
一个标准的与mocha搭配的测试文件应该如下
```javascript
var nightwatch = require('nightwatch');

describe('Github', function() {
  var client = nightwatch.initClient({
    silent : true
  });

  var browser = client.api();

  this.timeout(99999999);

  before(function() {

    browser.perform(function() {
      console.log('beforeAll')
    });

  });

  beforeEach(function(done) {
    browser.perform(function() {
      console.log('beforeEach')
    });

    client.start(done);
  });

  it('Demo test GitHub', function (done) {
    browser
      .url('https://github.com/nightwatchjs/nightwatch')
      .waitForElementVisible('body', 5000)
      .assert.title('nightwatchjs/nightwatch · GitHub')
      .waitForElementVisible('body', 1000)
      .assert.visible('.container .breadcrumb a span')
      .assert.containsText('.container .breadcrumb a span', 'nightwatch', 'Checking project title is set to nightwatch');

    client.start(done);
  });

  afterEach(function() {
    browser.perform(function() {
      console.log('afterEach')
    });
  });

  after(function(done) {
    browser.end(function() {
      console.log('afterAll')
    });

    client.start(done);
  });

});
```

### 单页面测试配置
可以通过配置nightwatch.js中`page_objects_path`来实现

page_object.js：
```javascript
//google.js
var googleCommands = {
  submit: function() {
    this.api.pause(1000);
    return this.waitForElementVisible('@submitButton', 1000)
      .click('@submitButton')
      .waitForElementNotPresent('@submitButton');
  }
};

module.exports = {
  commands: [googleCommands],
  elements: {
    searchBar: {
      selector: 'input[type=text]'
    },
    submitButton: {
      selector: 'button[name=btnG]'
    }
  }
};
```
test.js就可以变为：
```javascript
module.exports = {
  'Test': function (client) {
    var google = client.page.google();
    google.setValue('@searchBar', 'nightwatch')
      .submit();

    client.end();
  }
};
```

还可以定义elements和sections

```javascript
var sharedElements = {
  mailLink: 'a[href*="mail.google.com"]'
};

module.exports = {
  elements: [
    sharedElements,
    { searchBar: 'input[type=text]' }
  ],
  sections: {
      menu: {
        selector: '#gb',
        elements: {
          mail: {
            selector: 'a[href="mail"]'
          },
          images: {
            selector: 'a[href="imghp"]'
          }
        },
        sections: {
          apps: {
            selector: 'div.gb_pc',
            elements: {
              myAccount: {
                selector: '#gb192'
              },
              googlePlus: {
                selector: '#gb119'
              }
            }
          }
        }
      }
    }
}


//test.js中

module.exports = {
  'Test': function (client) {
    var google = client.page.google();
    google.expect.section('@menu').to.be.visible;

    var menuSection = google.section.menu;
    var appSection = menuSection.section.apps;
    menuSection.click('@appSection');

    appSection.expect.element('@myAccount').to.be.visible;
    appSection.expect.element('@googlePlus').to.be.visible;

    client.end();
  }
}
```

自此，终于可以结合vue代码写出一个完整的测试用例啦~~~

话不多说，试着撸代码去了。


# karma
Karma是一个测试任务管理工具，可以很容易和Jasmine、Mocha等市面上常用的测试框架打通，通过其插件可以快速集成到各种环境中。例如：本地环境、持续集成环境。