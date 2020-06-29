---
layout: post
title: "promise简单实现"
date: 2017-1-10 19:30
comments: true
tags: 
    - es6
---

## 概念

ES6 原生提供了 Promise 对象。
所谓 Promise，就是一个对象，用来传递异步操作的消息。它代表了某个未来才会知道结果的事件（通常是一个异步操作），并且这个事件提供统一的 API，可供进一步处理。
Promise 对象有以下两个特点。
* （1）对象的状态不受外界影响。Promise 对象代表一个异步操作，有三种状态：Pending（进行中）、Resolved（已完成，又称 Fulfilled）和 Rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是 Promise 这个名字的由来，它的英语意思就是「承诺」，表示其他手段无法改变。
* （2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能：从 Pending 变为 Resolved 和从 Pending 变为 Rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果。就算改变已经发生了，你再对 Promise 对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。
有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise 对象提供统一的接口，使得控制异步操作更加容易。
Promise 也有一些缺点。首先，无法取消 Promise，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。第三，当处于 Pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。


## 用法
在写微信小程序的时候，有时需要等第一个异步请求返回内容之后再开始第二个异步请求，然后再做逻辑处理，
受够了层层嵌套的回调,决心换一个直观的写法。

原写法：
```javascript
    $.ajax({
        method:'',
        data:'',
        success:function() {
            $.ajax({
                success:function() {
                  //Do something
                },
                error:function() {
                  alert('err')
                }
            })
        },
        error:function() {
          alert('err')
        }
    })
```

用了promise之后：
```javascript
var a = new Promise(function(resolve,reject){
    $.ajax({
        success:function(data) {
          resolve(data)
        },
        error:function(e) {
          reject(e)
        }
    })
})
var b = new Promise(function(resolve,reject){
            $.ajax({
                success:function(data) {
                  resolve(data)
                },
                error:function(e) {
                  reject(e)
                }
            })
        })
a().then(function(data){console.log(data);return b}).then(data=>console.log(data));

```

##简单实现：

语法是es6，后面是经过babel编译的代码，不熟悉es6的同学不太影响阅读。

```javascript
class Promise{
  constructor(fn){
    this.state = 'pending';
    this.value = null;
    this.deferreds = [];
    
    this._resolve = this.resolve.bind(this)
    this._reject = this.reject.bind(this)
    fn(this._resolve,this._reject)
  }
  handle(deferred) { 
	    if (this.state === 'pending') {
	        this.deferreds.push(deferred);
            return;
	    }
	    var cb = this.state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected,
	        ret;
	    if (cb === null) {
	        cb = this.state === 'fulfilled' ? deferred.resolve : deferred.reject;
	        cb(this.value);
	        return;
	    }
	    try {
	        ret = cb(this.value);
	        deferred.resolve(ret);
	    } catch (e) {
	        deferred.reject(e);
	    } 
	}
  resolve(newValue) {
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;
          if (typeof then === 'function') {
              then.call(newValue, this.resolve, this.reject);
              return;
          }
      }
      this.state = 'fulfilled';
      this.value = newValue;
      this.finale();
  }
  reject(reason) {
      this.state = 'rejected';
      this.value = reason;
      this.finale();
  }
  finale() {
      setTimeout(function () {
          this.deferreds.forEach(function (deferred) {
              this.handle(deferred);
          }.bind(this));
      }.bind(this), 0);
  }
  then(onFulfilled, onRejected){
    return new Promise(function (resolve, reject) {
            this.handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        }.bind(this));
  }
}
//测试
var a = new Promise(function(res,rej){
  setTimeout(function(){
    let a = 1;
    let b = 2;
    if(1){
      res(a)
    }else{
      rej(b)
    }
  },2000)
});

var b = new Promise(function(res,rej){
  setTimeout(function(){
    let c = 3;
    let d = 4;
    if(1){
    
      res(c)
    }else{
      rej(d)
    }
  },2000)
});
a.then(y=>console.log(y),
  n=>console.log(n)
  ).then(()=>{return b}).then(y=>console.log(y))

```

编译之后；
```javascript

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = (function () {
  function Promise(fn) {
    _classCallCheck(this, Promise);

    this.state = 'pending';
    this.value = null;
    this.deferreds = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    fn(this.resolve, this.reject);
  }

  _createClass(Promise, [{
    key: 'handle',
    value: function handle(deferred) {

      if (this.state === 'pending') {
        this.deferreds.push(deferred);
        return;
      }
      var cb = this.state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected,
          ret;
      if (cb === null) {
        cb = this.state === 'fulfilled' ? deferred.resolve : deferred.reject;
        cb(this.value);
        return;
      }
      try {
        ret = cb(this.value);
        deferred.resolve(ret);
      } catch (e) {
        deferred.reject(e);
      }
    }
  }, {
    key: 'resolve',
    value: function resolve(newValue) {
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          then.call(newValue, this.resolve, this.reject);
          return;
        }
      }
      this.state = 'fulfilled';
      this.value = newValue;
      this.finale();
    }
  }, {
    key: 'reject',
    value: function reject(reason) {
      this.state = 'rejected';
      this.value = reason;
      this.finale();
    }
  }, {
    key: 'finale',
    value: function finale() {
      setTimeout((function () {
        console.log(this);
        this.deferreds.forEach((function (deferred) {

          this.handle(deferred);
        }).bind(this));
      }).bind(this), 0);
    }
  }, {
    key: 'then',
    value: function then(onFulfilled, onRejected) {

      return new Promise((function (resolve, reject) {

        this.handle({
          onFulfilled: onFulfilled || null,
          onRejected: onRejected || null,
          resolve: resolve,
          reject: reject
        });
      }).bind(this));
    }
  }]);

  return Promise;
})();

var a = new Promise(function (res, rej) {
  setTimeout(function () {
    var a = 1;
    var b = 2;
    if (1) {
      res(a);
    } else {
      rej(b);
    }
  }, 2000);
});

var b = new Promise(function (res, rej) {
  setTimeout(function () {
    var c = 3;
    var d = 4;
    if (1) {

      res(c);
    } else {
      rej(d);
    }
  }, 2000);
});

a.then(function (y) {
  return console.log(y);
}, function (n) {
  return console.log(n);
}).then(function () {
  return b;
}).then(function (y) {
  return console.log(y);
});
```