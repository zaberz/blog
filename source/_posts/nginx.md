---
layout: post
title: 前端缓存和nginx配置实验
date: 2019-10-09
---

## 浏览器缓存

### 强缓存

- Expires: Expires是http1.0提出的一个表示资源过期时间的header，它描述的是一个绝对时间，由服务器返回。Expires 受限于本地时间，如果修改了本地时间，可能会造成缓存失效
    ```code
        Expires: Wed, 11 May 2018 07:20:00 GMT
    ```
- Cache-Control: Cache-Control 出现于 HTTP / 1.1，优先级高于 Expires ,表示的是相对时间
    ```code
        Cache-Control: max-age=315360000
    ```
    题外tips
        Cache-Control: no-cache不会缓存数据到本地的说法是错误的，详情《HTTP权威指南》P182
        Cache-Control: no-store才是真正的不缓存数据到本地
        Cache-Control: public可以被所有用户缓存（多用户共享），包括终端和CDN等中间代理服务器
        Cache-Control: private只能被终端浏览器缓存（而且是私有缓存），不允许中继缓存服务器进行缓存
        
### 协商缓存

当浏览器对某个资源的请求没有命中强缓存，就会发一个请求到服务器，验证协商缓存是否命中，如果协商缓存命中，请求响应返回的http状态为304并且会显示一个Not Modified的字符串
协商缓存是利用的是【Last-Modified，If-Modified-Since】和【ETag、If-None-Match】这两对Header来管理的
* Last-Modified，If-Modified-Since
    Last-Modified 表示本地文件最后修改日期，浏览器会在request header加上If-Modified-Since（上次返回的Last-Modified的值），询问服务器在该日期后资源是否有更新，有更新的话就会将新的资源发送回来
    但是如果在本地打开缓存文件，就会造成 Last-Modified 被修改，所以在 HTTP / 1.1 出现了 ETag
    
* ETag、If-None-Match

    Etag就像一个指纹，资源变化都会导致ETag变化，跟最后修改时间没有关系，ETag可以保证每一个资源是唯一的
    If-None-Match的header会将上次返回的Etag发送给服务器，询问该资源的Etag是否有更新，有变动就会发送新的资源回来
    
    ETag的优先级比Last-Modified更高
    
    具体为什么要用ETag，主要出于下面几种情况考虑：
    * 一些文件也许会周期性的更改，但是他的内容并不改变(仅仅改变的修改时间)，这个时候我们并不希望客户端认为这个文件被修改了，而重新GET；
    * 某些文件修改非常频繁，比如在秒以下的时间内进行修改，(比方说1s内修改了N次)，If-Modified-Since能检查到的粒度是s级的，这种修改无法判断(或者说UNIX记录MTIME只能精确到秒)；
    * 某些服务器不能精确的得到文件的最后修改时间。


## 启动nginx实验
纸上得来终觉浅，亲自动手才能记得更牢。下面跟着我的节奏，来一场快速的浏览器缓存实验。

### 测试页面
首先明确我们的需求，设计如下html。包含一个标准文档和一个jpg静态资源。
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>title</title>
</head>
<body>
  <div>test</div>
  <img src="./avatar.jpg" alt="">
</body>
</html>
```
### 添加nginx.conf开始测试
```
新建nginx.conf文件
server {
      listen       10000;
      server_name  localhost;
      index   index.html;
      root  /usr/share/nginx/html;
      location / {
          etag off;
          add_header Last-Modified  '';
          index index.html;
      }
      location ~ \.(gif|jpg|jpeg|png|bmp|ico)$ {
          etag off;
          add_header Last-Modified  '';
      }
}
```
因为nginx 默认开启了etag 和Last-Modified,我们先把他去掉看效果
### nginx on!
```bash
docker run -v /path/to/your/html:/usr/share/nginx/html \
-v /path/to/your/nginx.conf:/etc/nginx/conf.d/mysite.conf \
-p 10000:10000 --name nginx-test nginx
```

新建一个无痕浏览器窗口，打开localhost:10000;多次刷新页面依然之后查看请求详情

![](/blog/images/nginx/nginx-1.png)
![](/blog/images/nginx/nginx-2.png)
并且执行 `docker logs -f nginx-test` 能发现每次服务器都收到了请求日志。

可见没有设置缓存header的情况下，浏览器还真是一点缓存效果都没有呢！

### 接下来我们添加一些强缓存的配置
```
server {
    listen       10000;
    server_name  localhost;
    index   index.html;
    root  /usr/share/nginx/html;
    location / {
        etag off;
        expires 30s;
        add_header Last-Modified  '';
        index index.html;
    }
    location ~ \.(gif|jpg|jpeg|png|bmp|ico|html)$ {
        etag off;
        expires 30s;
        add_header Last-Modified  '';
    }
}
```
执行`docker restart nginx-text`;刷新页面发现：

![](/blog/images/nginx/nginx-3.png)
![](/blog/images/nginx/nginx-4.png)

图片的缓存已经生效，并且有效期为30秒。因为docker没有设置时区，所以我本地的时间是大于expires的，但是缓存还是生效了，所以证明Cache-Control的优先级大于expires。使用浏览器强制刷新能忽略缓存时间，重新拉取资源。

对于文档文件，每次刷新都会带上`Cache-Control: max-age=0`，强制刷新时会带上`Cache-Control: no-cache;Pragma: no-cache`,并且服务器一直都有请求日志。所以对文档设置expires和cache-control无效？（一种猜测）

### 接下来我们再添加一些协商缓存的配置
```
server {
    listen       10000;
    server_name  localhost;
    index   index.html;
    root  /usr/share/nginx/html;
    location / {
        etag off;
        index index.html;
    }
    location ~ \.(gif|jpg|jpeg|png|bmp|ico)$ {
        etag off;
    }
}
```
`docker restart nginx-text`之后刷新几次发现

![](/blog/images/nginx/nginx-5.png)
![](/blog/images/nginx/nginx-6.png)

文档文件协商缓存生效，但是资源文件还是使用强缓存原因是:
>如果Expires，Cache-Control: max-age，或 Cache-Control:s-maxage都没有在响应头中出现，并且设置了Last-Modified时，那么浏览器默认会采用一个启发式的算法，即启发式缓存。通常会取响应头的Date_value - Last-Modified_value值的10%作为缓存时间。

强制刷新时不会带上If-Modified-Since,所以直接从服务端取文件。
修改index.html文件之后request的If-Modified-Since小于服务器中记录的时间，于是返回了新文档，状态码200，并且更新了response的Last-Modified.

ETag流程和Last-Modified的表现几乎一致，就不多赘述了。

### 最后，同时使用强缓存和协商缓存
```
server {
    listen       10000;
    server_name  localhost;
    index   index.html;
    root  /usr/share/nginx/html;
    location / {
        index index.html;
        expired 30s;
    }
    location ~ \.(gif|jpg|jpeg|png|bmp|ico)$ {
        expired 30s;
    }
}
```

刷新时，文档304，资源200 from cache。30秒后强缓存失效，文档仍然304，资源也变为304，之后再变为200.
