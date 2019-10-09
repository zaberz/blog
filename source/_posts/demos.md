---
layout: post
title: 练手demos
date: 2019-10-08
---

### 同一首歌
[线上地址](www.ruaaaa.com:2333)

17年时写的，许久没维护，近期发现获取歌曲URL的方法失效了，修改了一下推上线继续用。使用socketio做歌曲同步，可以和异地的朋友同时听同一首歌。

### 仿bilibili视频人像弹幕遮罩

[线上地址](https://zaberz.github.io/bodypix/)
资源加载有点慢，用了tensorflowjs和一个已经训练好的人体识别模型。简单测试了一下在浏览器中做识别的效率，

### webrtc创建的视频聊天应用
[github](https://github.com/zaberz/webrtc-chat)
踩过的坑：在创建点对点连接的时候需要用先由服务器转发icecandidate信息，我用了socketio，等到链接建立成功之后才断开。
在建立连接之前就要指定要发送的内容，在连接建立成功之后不能修改。
在4G网络下基本上不能直连，需要有个stun服务器做转发

### node端的tensorflow
[github](https://github.com/zaberz/gomoku-js)
在node端使用tensorflow训练一个五子棋AI


