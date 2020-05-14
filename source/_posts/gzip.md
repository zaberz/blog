---
layout: post
title: 前端项目chunk-vendors体积优化
date: 2020-05-14
---


## 为什么要优化
 
一次打包一个用了vuetify的项目，打包结果如下
![](/blog/images/gzip/gzip1.png)
一看这chunk-vendors足足1000K+；要是放到小水管上果断扛不住。

## 开始优化

* 首先把chunk-vendors单文件体积降下来

思路：1 使用公用cdn 2 拆分vendors里node_modules的依赖文件

使用cdn配置如下
```js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (isProduction) {
      config.externals = {
        vue: "Vue",
        "vue-router": "VueRouter",
        moment: "moment"
      };
    }
  }
};
```
```html
<!-- public/index.html -->
<!-- CND -->
<script src="https://cdn.bootcss.com/vue/2.5.17-beta.0/vue.runtime.min.js"></script>
<script src="https://cdn.bootcss.com/vue-router/3.0.1/vue-router.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
```

拆分文件配置：
具体配置文档[optimization](https://webpack.js.org/configuration/optimization/),
[split-chunks-plugin](https://webpack.js.org/plugins/split-chunks-plugin/)
```js
module.exports = {
  configureWebpack: config => {
    if (isProduction) {
      config.optimization = {
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace("@", "")}`;
              }
            }
          }
        }
      };
    }
  }
};
```
至此，打包结果如下（未使用CDN的情况）
![](/blog/images/gzip/gzip2.png)

* 启用gzip

nginx有两种gzip方案，gzip和gzip_static，推荐使用后者，gzip是针对于请求实时进行压缩，cpu开销大。gzip_static 可以在编译后使用压缩工具搞出来。
配置如下
```js
module.exports={
  configureWebpack: config => {
    if (isProduction) {    
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: "gzip",
          test: new RegExp("\\.(css|js)$"),
          threshold: 10240,
          minRatio: 0.8
        })
      );
    }
  }
}
```
打包结果如下
![](/blog/images/gzip/gzip3.png)

nginx开启gzip_static 配置
```
server {
    # 省略
    gzip off;
    gzip_static on; #静态压缩
    gzip_min_length 10k;
    gzip_buffers 4 16k;
    gzip_comp_level 6;
    gzip_types *;
    gzip_disable "MSIE [1-6]\.";
    gzip_vary on;

    # 省略
}
```

```dockerfile
FROM nginx
ADD dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## 最终结果
* 本地docker启动后结果：

优化后：

![](/blog/images/gzip/gzip4.png)

![](/blog/images/gzip/gzip5.png)

![](/blog/images/gzip/gzip6.png)

对比未优化前：

![](/blog/images/gzip/gzip9.png)

![](/blog/images/gzip/gzip7.png)

![](/blog/images/gzip/gzip8.png)

* 加上100K的限速，模拟环境试试：

```
# nginx config
limit_rate 100k; #限制速度50K

```
未优化：

![](/blog/images/gzip/gzip10.png)

![](/blog/images/gzip/gzip11.png)

优化后

![](/blog/images/gzip/gzip12.png)

![](/blog/images/gzip/gzip13.png)

用技术文章的标题来说就是：网站打开速度提升了90%！

### 后记

拆分的js文件有点多，会影响加载速度，后期可以根据实际需求合并一些node_modules里的依赖文件，
比如 vue&vue-router&vuex可以合并为一份vue-all 的commonChunk文件，具体做法在[split-chunks-plugin](https://webpack.js.org/plugins/split-chunks-plugin/)
文档
