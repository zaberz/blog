---
layout: post
title: "记一次写jQuery插件"
date: 2016-5-18 16:33
comments: true
tags: 
    - js
---

一款js插件应该满足以下8个要求：
1. 代码相对独立
2. 链式操作
3. 插件可配置
4. 有可操作的方法，插件的生命周期可控制
5. 配置可被缓存
6. 可扩展
7. 无冲突处理
8. 事件代理，动态初始化

以往我们写插件的方式如下：
```javascript
function pluginName($selector){
    $.each($selector, function () {
        // to do something...
    });
}
// pluginName(document.getElementsByClassName("demo"));
```

<!-- more -->

现把代码扩展到jQuery上
```javascript
;(function ($) {
    // 扩展这个方法到jQuery.
    $.fn.extend({
        // 插件名字
        pluginName: function () {
            // 遍历匹配元素的集合
            // 注意这里有个"return"，作用是把处理后的对象返回，实现链式操作
            return this.each(function () {
                // 在这里编写相应的代码进行处理
            });
        }
    });
// 传递jQuery到内层作用域去, 如果window,document用的多的话, 也可以在这里传进去.
// })(jQuery, window, document, undefined);
})(jQuery, undefined);
// 调用方式 $(".selector").pluginName().otherMethod();
```
至此解决了
1. 代码相对独立
2. 链式操作
这2个问题，接下来给插件添加参数支持
```javascript
;(function($){
    $.fn.pluginName = function(options) {
        // 合并参数，通过“extend”合并默认参数和自定义参数
        var args = $.extend({}, $.fn.pluginName.defaults, options);
        return this.each(function() {
            console.log(args.text);
            // to do something...
        });
    };
    // 默认参数
    $.fn.pluginName.defaults = {
        text : "hello"
    };
})(jQuery);
// $(".selector").pluginName({text : "hello world!"});
```
现在来添加方法的支持，我前面所提到的生命周期可控制，意思差不多，例如添加reInit,destory等方法来控制插件。

```javascript
;(function($){
    $.fn.pluginName = function (method) {
        // 如果第一个参数是字符串, 就查找是否存在该方法, 找到就调用; 如果是object对象, 就调用init方法;.
        if (methods[method]) {
            // 如果存在该方法就调用该方法
            // apply 是吧 obj.method(arg1, arg2, arg3) 转换成 method(obj, [arg1, arg2, arg3]) 的过程.
            // Array.prototype.slice.call(arguments, 1) 是把方法的参数转换成数组.
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            // 如果传进来的参数是"{...}", 就认为是初始化操作.
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pluginName');
        }
    };
    // 不把方法扩展在 $.fn.pluginName 上. 在闭包内建个"methods"来保存方法, 类似共有方法.
    var methods = {
        /**
         * 初始化方法
         * @param _options
         * @return {*}
         */
        init : function (_options) {
            return this.each(function () {
                var $this = $(this);
                var args = $.extend({}, $.fn.pluginName.defaults, _options);
                // ...
            })
        },
        publicMethod : function(){
            private_methods.demoMethod();
        }
    };
    // 私有方法
    var private_methods = {
        demoMethod : function(){}
    }
    // 默认参数
    $.fn.pluginName.defaults = {
    };
})(jQuery);
// 调用方式
// $("div").pluginName({...});  // 初始化
// $("div").pluginName("publicMethod");  // 调用方法
```
至此已经能满足大部分插件需求。
1. 代码相对独立
2. 链式操作
3. 插件可配置
4. 有可操作的方法，插件的生命周期可控制
剩下的继续升级：

```javascript
;(function ($) {
    var Plugin = function (element, options) {
        this.element = element;
        this.options = options;
    };
    Plugin.prototype = {
        create: function () {
            console.log(this.element);
            console.log(this.options);
        }
    };
    $.fn.pluginName = function (options) {
        // 合并参数
        return this.each(function () {
            // 在这里编写相应的代码进行处理
            var ui = $._data(this, "pluginName");
            // 如果该元素没有初始化过(可能是新添加的元素), 就初始化它.
            if (!ui) {
                var opts = $.extend(true, {}, $.fn.pluginName.defaults, typeof options === "object" ? options : {});
                ui = new Plugin(this, opts);
                // 缓存插件
                $._data(this, "pluginName", ui);
            }
            // 调用方法
            if (typeof options === "string" && typeof ui[options] == "function") {
                // 执行插件的方法
                ui[options].apply(ui, args);
            }
        });
    };
    $.fn.pluginName.defaults = {};
})(jQuery);
```
`var ui = $._data(this, "pluginName");`这里画重点；
把初始化后的插件缓存起来后，方便了许多。通过代码$("#target").data("pluginName")就可以取到对象了
实现了
5. 配置可缓存

最后最后，解决剩下的三个要求

6. 可扩展
7. 无冲突处理
8. 事件代理，动态初始化
```javascript

!function ($) {
    "use strict";
    var Button = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Button.DEFAULTS, options);
    };
    Button.DEFAULTS = {
        loadingText: 'loading...'
    };
    Button.prototype.setState = function (state) {
        // ...
    };
    Button.prototype.toggle = function () {
        // ...
    };
    var old = $.fn.button; // 这里的 $.fn.button 有可能是之前已经有定义过的插件，在这里做无冲突处理使用。
    $.fn.button = function (option) {
        return this.each(function () {
            var $this = $(this);
            // 判断是否初始化过的依据
            var data = $this.data('bs.button');
            var options = typeof option == 'object' && option;
            // 如果没有初始化过, 就初始化它
            if (!data) $this.data('bs.button', (data = new Button(this, options)));
            if (option == 'toggle') data.toggle();
            else if (option) data.setState(option)
        })
    };
    // ① 暴露类名, 可以通过这个为插件做自定义扩展
    $.fn.button.Constructor = Button;
    // 扩展的方式
    // 设置 : $.fn.button.Constructor.newMethod = function(){}
    // 使用 : $btn.button("newMethod");
    // ② 无冲突处理
    $.fn.button.noConflict = function () {
        $.fn.button = old;
        return this
    };
    // ③ 事件代理, 智能初始化
    $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
        var $btn = $(e.target);
        // 查找要初始化的对象
        if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn');
        // 直接调用方法, 如果没有初始化, 内部会先进行初始化
        $btn.button('toggle');
        e.preventDefault();
    });
}(jQuery);
```

补充
现在的插件都要求灵活性要高，比如希望插件可以同时适配jQuery和Zepto，又或者需要支持AMD或者CMD规范。
支持jQuery和Zepto
复制代码 代码如下:
```javascript
if (window.jQuery || window.Zepto) {
  (function ($) {
      // plugin code...
  })(window.jQuery || window.Zepto);
}
```
中间件支持，node
复制代码 代码如下:
```javascript
if (typeof(module) !== 'undefined')
{
  module.exports = pluginName;
}
//requirejs(AMD) support
if (typeof define === 'function' && define.amd) {
  define([], function () {
      'use strict';
      return pluginName;
  });
}
//seajs(CMD) support
if (typeof define === 'function') {
  define([], function () {
      'use strict';
      return pluginName;
  });
}
````
### 实际：
看了这么多，下面是一个H5上传插件的代码

```javascript
(function ($) {
	"use strict";
	var Plugin = function (element, options) {
		this.element = element;
		this.options = options;
	};
	Plugin.prototype = {
		destroy: function () {
			$(this.element).empty();
			this.options.onDestroy && this.options.onDestroy()
		},
		init: function () {
		},
		settings: function () {
			var newOpt = {};
			newOpt[arguments[0][1]] = arguments[0][2];
			$.extend(this.options, newOpt);
			this.destroy();
			$(this.element).Uploadify(this.options);
		}
	};
	$.fn.Uploadify = function (opts) {
		var _this = $(this),
			arg = arguments;
		var itemTemp = '';
		$.fn.Uploadify.defaults = {
			fileTypeExts: '',//允许上传的文件类型，格式'*.jpg;*.doc'
			uploader: '',//文件提交的地址
			auto: false,//是否开启自动上传
			method: 'post',//发送请求的方式，get或post
			multi: true,//是否允许选择多个文件
			formData: null,//发送给服务端的参数，格式：{key1:value1,key2:value2}
			fileObjName: 'file',//在后端接受文件的参数名称，如PHP中的$_FILES['file']
			fileSizeLimit: 2048,//允许上传的文件大小，单位KB
			showUploadedPercent: false,//是否实时显示上传的百分比，如20%
			showUploadedSize: false,//是否实时显示已上传的文件大小，如1M/2M
			buttonText: '选择文件',//上传按钮上的文字
			removeTimeout: 1000,//上传完成后进度条的消失时间
			itemTemplate: itemTemp,//上传队列显示的模板
			onUploadStart: null,//上传开始时的动作
			onUploadSuccess: null,//上传成功的动作
			onUploadComplete: null,//上传完成的动作
			onUploadError: null, //上传失败的动作
			onInit: null,//初始化时的动作
			onCancel: null,//删除掉某个文件后的回调函数，可传入参数file
			queueID: '.uploadify-queue',//默认显示文件队列的div
			showImg: true,
			removeCompleted: false,
			uploadLimit: false,
			onDestory: null,
			showUpdateAll: true//显示全部上传按钮
		}
		// var option = $.extend({},$.fn.Uploadify.defaults,opts);
		var a;
		if (typeof opts == 'string') {
			a = opts
		} else {
			a = $.extend(true, {}, $.fn.Uploadify.defaults, typeof opts === "object" ? opts : {});
		}
		//将文件的单位由bytes转换为KB或MB，若第二个参数指定为true，则永远转换为KB
		var formatFileSize = function (size, byKB) {
			if (size > 1024 * 1024 && !byKB) {
				size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
			}
			else {
				size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
			}
			return size;
		}
		//根据文件序号获取文件
		var getFile = function (index, files) {
			for (var i = 0; i < files.length; i++) {
				if (files[i].index == index) {
					return files[i];
				}
			}
			return false;
		}
		//将输入的文件类型字符串转化为数组,原格式为*.jpg;*.png
		var getFileTypes = function (str) {
			var result = [];
			var arr1 = str.split(";");
			for (var i = 0, len = arr1.length; i < len; i++) {
				result.push(arr1[i].split(".").pop());
			}
			return result;
		}
		var options = a;
		return this.each(function () {
			var ui = $._data(this, "Uploadify");
			if (!ui) {
				ui = new Plugin(this, options);
				// 缓存插件
				$._data(this, "Uploadify", ui);
			}
			// 调用方法
			if (typeof options === "string" && typeof ui[options] == "function") {
				// 执行插件的方法
				ui[options].call(ui, arg);
				return
			}
			var _this = $(ui.element);
			//先添加上file按钮和上传列表
			var instanceNumber = $('.uploadify').length + 1;
			var inputStr = '<input class="selectbtn" style="display:none;" type="file" name="fileselect[]"';
			inputStr += ui.options.multi ? ' multiple' : '';
			inputStr += ' accept="';
			inputStr += getFileTypes(ui.options.fileTypeExts).join(",");
			inputStr += '"/>';
			inputStr += '<button type="button" class="uploadify-button style-uploadify-button btn-primary margin-10">';
			inputStr += ui.options.buttonText;
			inputStr += '</button>';
			if (options.showUpdateAll && (options.uploadLimit > 1 || options.uploadLimit === false)) {
				inputStr += '<button type="button" class="uploadify-all style-uploadify-button btn-primary margin-10">';
				inputStr += '全部上传';
				inputStr += '</button>';
			}
			var uploadFileListStr = '<div class="uploadify-queue"></div>';
			_this.append(inputStr + uploadFileListStr);
			//创建文件对象
			var fileObj = {
				fileInput: _this.find('.selectbtn'),				//html file控件
				uploadFileList: _this.find('.uploadify-queue'),
				url: ui.options.uploader,						//ajax地址
				fileFilter: [],					//过滤后的文件数组
				arrLastModified: [], 			//保存已上传过的文件数组
				filter: function (files) {		//选择文件组的过滤方法
					var arr = [];
					var typeArray = getFileTypes(ui.options.fileTypeExts);
					var fileCount = files.length;
					if (ui.options.uploadLimit !== false) {
						if (fileCount > ui.options.uploadLimit || (fileCount + this.fileFilter.length) > ui.options.uploadLimit) {
							alert('超过文件个数限制,请重新选择文件');
							return arr;
						}
					}
					if (typeArray.length > 0) {
						for (var i = 0, len = files.length; i < len; i++) {
							var hasInputed = false;
							var thisFile = files[i];
							if (parseInt(formatFileSize(thisFile.size, true)) > ui.options.fileSizeLimit) {
								alert('文件' + thisFile.name + '大小超出限制！');
								continue;
							}
							if ($.inArray(thisFile.name.split('.').pop(), typeArray) >= 0) {
								for (var j = 0; j < this.fileFilter.length; j++) {
									var fileFilter = this.fileFilter[j];
									if (thisFile.lastModified + thisFile.name == fileFilter.lastModified + fileFilter.name) {
										hasInputed = true;
										break;
									}
								}
								if (!hasInputed) arr.push(thisFile);
							}
							else {
								alert('文件' + thisFile.name + '类型不允许！');
							}
						}
					}
					return arr;
				},
				//文件选择后
				onSelect: function (files) {
					for (var i = 0, len = files.length; i < len; i++) {
						var file = files[i];
						//处理模板中使用的变量
						var $html = $(ui.options.itemTemplate.replace(/\${fileID}/g, 'fileupload_' + instanceNumber + '_' + file.index).replace(/\${fileName}/g, file.name).replace(/\${fileSize}/g, formatFileSize(file.size)).replace(/\${instanceID}/g, _this.attr('id')));
						file.id = 'fileupload_' + instanceNumber + '_' + file.index;
						//如果是自动上传，去掉上传按钮
						if (ui.options.auto) {
							$html.find('.uploadbtn').remove();
							$html.find('.delfilebtn').remove();
						}
						this.uploadFileList.append($html);
						//判断是否显示已上传文件大小
						if (ui.options.showUploadedSize) {
							var num = '<span class="progressnum"><span class="uploadedsize">0KB</span>/<span class="totalsize">${fileSize}</span></span>'.replace(/\${fileSize}/g, formatFileSize(file.size));
							$html.find('.uploadify-progress').after(num);
						}
						//判断是否显示上传百分比
						if (ui.options.showUploadedPercent) {
							var percentText = '<span class="up_percent">0%</span>';
							$html.find('.uploadify-progress').after(percentText);
						}
						//判断是否是自动上传
						if (ui.options.auto) {
							this.funUploadFile(file);
						}
						else {
							//如果配置非自动上传，绑定上传事件
							$html.find('.uploadbtn').on('click', (function (file) {
								return function () {
									fileObj.funUploadFile(file);
								}
							})(file));
						}
						//为删除文件按钮绑定删除文件事件
						$html.find('.delfilebtn').on('click', (function (file, callback) {
							// $elm = $html.find('.delfilebtn');
							//
							// typeof callback == 'function' && callback(file,$elm);
							return function () {
								fileObj.funDeleteFile(file.index);
							}
						})(file, ui.options.ondelate));
						this.showImg(file, 'fileupload_' + instanceNumber + '_' + file.index);
					}
					_this.find('.uploadify-all').unbind().on('click', function () {
						for (var i = 0, len = fileObj.fileFilter.length; i < len; i++) {
							var file = fileObj.fileFilter[i];
							fileObj.funUploadFile(file);
						}
					});
				},
				onProgress: function (file, loaded, total) {
					var eleProgress = _this.find('#fileupload_' + instanceNumber + '_' + file.index + ' .uploadify-progress');
					var percent = ((loaded / total * 100) - 1).toFixed(2) + '%';
					if (ui.options.showUploadedSize) {
						eleProgress.nextAll('.progressnum .uploadedsize').text(formatFileSize(loaded));
						eleProgress.nextAll('.progressnum .totalsize').text(formatFileSize(total));
					}
					if (ui.options.showUploadedPercent) {
						eleProgress.nextAll('.up_percent').text(percent);
					}
					eleProgress.children('.uploadify-progress-bar').css('width', percent);
				},		//文件上传进度
				/* 开发参数和内置方法分界线 */
				//获取选择文件，file控件
				showImg: function (file, elm) {
					var src = window.URL.createObjectURL(file);
					_this.find(ui.options.queueID).find('#' + elm).prepend('<img class="showimgtag" src="' + src + '">')
				},
				funGetFiles: function (e) {
					// 获取文件列表对象
					var files = e.target.files;
					//继续添加文件
					files = this.filter(files);
					for (var i = 0, len = files.length; i < len; i++) {
						this.fileFilter.push(files[i]);
					}
					this.funDealFiles(files);
					return this;
				},
				//选中文件的处理与回调
				funDealFiles: function (files) {
					var fileCount = _this.find('.uploadify-queue .uploadify-queue-item').length;//队列中已经有的文件个数
					for (var i = 0, len = files.length; i < len; i++) {
						files[i].index = ++fileCount;
						files[i].id = files[i].index;
					}
					//执行选择回调
					this.onSelect(files);
					return this;
				},
				//删除对应的文件
				funDeleteFile: function (index) {
					for (var i = 0, len = this.fileFilter.length; i < len; i++) {
						var file = this.fileFilter[i];
						if (file.index == index) {
							this.fileFilter.splice(i, 1);
							_this.find('#fileupload_' + instanceNumber + '_' + index).fadeOut();
							var lastModified = file.lastModified + file.name;
							for (var j = 0; j < fileObj.arrLastModified.length; j++) {
								if (fileObj.arrLastModified[j] === lastModified) {
									fileObj.arrLastModified.splice(j, 1);
								}
							}
							ui.options.onCancel && ui.options.onCancel(file);
							break;
						}
					}
					return this;
				},
				//文件上传
				funUploadFile: function (file) {
					var xhr = false;
					try {
						xhr = new XMLHttpRequest();//尝试创建 XMLHttpRequest 对象，除 IE 外的浏览器都支持这个方法。
					} catch (e) {
						xhr = ActiveXobject("Msxml12.XMLHTTP");//使用较新版本的 IE 创建 IE 兼容的对象（Msxml2.XMLHTTP）。
					}
					if (xhr.upload) {
						if ($.inArray(file.lastModified + file.name, fileObj.arrLastModified) != -1) return;
						// 上传中
						xhr.upload.addEventListener("progress", function (e) {
							fileObj.onProgress(file, e.loaded, e.total);
						}, false);
						// 文件上传成功或是失败
						xhr.onreadystatechange = function (e) {
							if (xhr.readyState == 4) {
								if (xhr.status == 200) {
									//校正进度条和上传比例的误差
									var thisfile = _this.find('#fileupload_' + instanceNumber + '_' + file.index);
									thisfile.find('.uploadify-progress-bar').css('width', '100%');
									ui.options.showUploadedSize && thisfile.find('.uploadedsize').text(thisfile.find('.totalsize').text());
									ui.options.showUploadedPercent && thisfile.find('.up_percent').text('100%');
									// _this.find('.uploadbtn').attr('disabled','disabled')
									ui.options.onUploadSuccess && ui.options.onUploadSuccess(file, xhr.responseText);
									//在指定的间隔时间后删掉进度条
									if (ui.options.removeCompleted && ui.options.removeTimeout > 0) {
										setTimeout(function () {
											_this.find('#fileupload_' + instanceNumber + '_' + file.index).fadeOut();
										}, ui.options.removeTimeout);
									}
								} else {
									ui.options.onUploadError && ui.options.onUploadError(file, xhr.responseText, fileObj.funUploadFile);
								}
								ui.options.onUploadComplete && ui.options.onUploadComplete(file, xhr.responseText);
								//清除文件选择框中的已有值
								fileObj.arrLastModified.push(file.lastModified + file.name);
								fileObj.fileInput.val('');
							}
						};
						ui.options.onUploadStart && ui.options.onUploadStart();
						// 开始上传
						xhr.open(ui.options.method, this.url, true);
						xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
						var fd = new FormData();
						fd.append(ui.options.fileObjName, file);
						if (ui.options.formData) {
							for (var key in ui.options.formData) {
								fd.append(key, ui.options.formData[key]);
							}
						}
						xhr.send(fd);
					}
				},
				init: function () {
					//文件选择控件选择
					if (this.fileInput.length > 0) {
						this.fileInput.change(function (e) {
							fileObj.funGetFiles(e);
							$(this).val('');
						});
					}
					//点击上传按钮时触发file的click事件
					_this.find('.uploadify-button').on('click', function () {
						_this.find('.selectbtn').trigger('click');
					});
					ui.options.onInit && ui.options.onInit();
				}
			};
			//初始化文件对象
			fileObj.init();
		});
	}
})(jQuery)

```