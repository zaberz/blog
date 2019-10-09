---
layout: post
title: 快速搭建舒服的开发环境
date: 2019-10-07
---
给新手的入门指南，涉及到的技术栈有。
* 前端：vue,vue-router,vuex
* 后端：eggjs
* 数据库：mysql
* 工具：docker,docker-compose,travis-ci
<!-- more -->  

用全栈的方式写个todolist[前端-示例代码](https://github.com/zaberz/todolist-web)[后端-示例代码](https://github.com/zaberz/todolist-server)

## 从前端开始

### 初始化一个前端工程
```
npm i vue-cli -g
vue create todolist-web
# 我一般选手动配置，添加vue-router，vuex，eslint，prettier 配置单独放文件
cd todolist-web && npm run serve
```

### 设计路由
设想我们的todolist程序有3个功能页
* 登录页
* 任务展示页
* 任务添加页

```
const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: import('../views/Home.vue')
    },
    {
      path: "/add",
      name: "add",
      component: () => import("../views/Add.vue")
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue")
    }
  ]
});
```
 
按自己的需求编写好各页面的逻辑

## 添加数据库
数据库选用mysql
```
docker pull mysql:5.6
docker run -d -p 23306:3306 --name=mysql-server --env="MYSQL_ROOT_PASSWORD=123456" mysql:5.6
```
使用docker可以快速在本地跑一个mysql服务。

![](/blog/images/data-model.png)
我用navicat for mysql连上之后新建了todolist数据库，设计2张表，一个user用于储存用户账号密码，一个task用于储存用户任务列表

## 设计后端server
后端使用[eggjs](https://eggjs.org/)。主要解决几个问题
* 连接数据库
```js
// 在eggjs的config.default.js中
config = {
    mysql: {
        client: {
            host: '127,0,0,1',
            port: '23306',
            user: 'root',
            password: '123456',
            database: 'todolist',
        },
        app: true,
        agent: false
    },
}
```
* 设计路由
路由包含一个restful风格的task接口，登录接口和注册接口。
```js
router.post('/login', controller.user.login)
router.post('/registry', controller.user.registry)
router.resources('task', '/tasks', controller.tasks)
```
* 用户状态维护
常用方案有session和jwt，但是session依赖cookie，为了保持连接无状态，选jwt。使用egg-jwt插件。

## 再回到前端
完成后端逻辑代码编写之后，任务又回到前端对接接口了。开发期间，使用vue dev-server里的proxy提供的代理功能，将对/api的请求全都代理到我们的egg服务上。
```js
// vue.config.js
let apiUrl = process.env.VUE_APP_API_DOMAIN;
let apiBasePath = process.env.VUE_APP_API_BASE_PATH;

let proxyObj = {};
let proxyPath = apiBasePath;

proxyObj[proxyPath] = {
  target: apiUrl,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    [`^${proxyPath}`]: "/"
  }
};
module.exports = {
  devServer: {
    open: true,
    disableHostCheck: true,
    proxy: proxyObj,
  },
};


// request 基类
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_PATH,
  timeout: 30000,
  withCredentials: true,
});

// .env 文件
VUE_APP_API_DOMAIN = 'http://127.0.0.1:7002'
VUE_APP_API_BASE_PATH = '/api'
```
至此，前后端交互都已经完成。剩下的就是业务代码编写。

## mock服务
现在每次迭代基本是前后端并行开发的，在前端开发过程中后端不会提供一个稳定的接口环境，这时候就需要一个mock服务器，我们选用easy-mock。
首先添加使用mock时的指令
```
// package.json
{
  script: {
    'dev:mock': 'vue-cli-service serve --mode=mock'
  }
}
```
添加mock时的环境变量配置
```
// .env.mock
VUE_APP_API_DOMAIN = 'http://127.0.0.1:7300/mock/5d8c539c1e82930021daf94b'
VUE_APP_API_BASE_PATH = '/api'
```

到分配的mock服务器中启动easy-mock，先新建docker-composer.yml文件，然后执行docker-compose up
```
// docker-compose.yml
version: "3"
services:
  mongodb:
    image: mongo:3.4
#    volumes:
    networks:
      - easy-mock
    restart: always

  redis:
    image: redis:4.0.6
    command: redis-server --appendonly yes
#    volumes:
    networks:
      - easy-mock
    restart: always

  web:
    image: easymock/easymock:1.6.0
    command: /bin/bash -c "npm start"
    ports:
      - 7300:7300
#    volumes:
    networks:
      - easy-mock
    restart: always
networks:
  easy-mock:
```
开发时，就可以用dev-server的代理，代理请求到mock服务上，无缝完成开发。

## 部署测试

* 前端镜像制作
    ```
    // build/Dockerfile
    FROM nginx
    ADD  ./dist /usr/share/nginx/html/dist
    ADD ./build/nginx.conf /etc/nginx/nginx.conf
    EXPOSE 80
    
    
    // nginx.conf 关键配置
    root  /usr/share/nginx/html/dist;
    location / {
        try_files $uri $uri/ @router;
        index index.html;
    }
    location @router {
        rewrite ^.*$ /index.html last;
    }
    location /api/ {
        proxy_read_timeout 600s;
        proxy_ignore_client_abort  on;
        # proxy_pass http://192.168.1.70:7001/;
        proxy_pass http://server:8080/;
    }
    ```
    首先是支持vue-router 的history模式，然后是把所有的/api请求代理到egg服务上,然后到根目录执行以下命令制作一个名为todolist-web的镜像，
    ```
    docker build -t todolist-web -f .\build\Dockerfile .
    ```
    如果镜像制作很慢可以添加.dockerignore文件忽略node_module模块

* egg服务镜像制作
    ```
    // Dockerfile
    FROM node:8.11.3-alpine
    
    ENV TIME_ZONE=Asia/Shanghai
    
    RUN \
      mkdir -p /usr/src/app \
      && apk add --no-cache tzdata \
      && echo "${TIME_ZONE}" > /etc/timezone \
      && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime
    
    WORKDIR /usr/src/app
    
    COPY package.json /usr/src/app/
    
    #RUN npm i
    
    RUN npm i --registry=https://registry.npm.taobao.org
    
    COPY . /usr/src/app
    
    EXPOSE 7001
    
    CMD npm run start
    ```
    ```
    docker build -t todolist-server -f .\Dockerfile .
    ```
至此，前端和服务端镜像都已经准备好了。我们用docker-compose启动服务
```
version: "3"
services:
  webapp:
    image: todolist-web
    depends_on:
      - server
    ports:
      - "9000:9000"
  server:
    image: todolist-server
    ports:
      - "7001:7001"
    depends_on:
      - db
  db:
    image: mysql:5.6
    volumes:
#      - mysql_data:/var/lib/mysql
      - /var/lib/mysql
    ports:
      - "3306:3306"
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: todolist
      MYSQL_USER: root
      MYSQL_PASSWORD: 123456
```
浏览器打开localhost:9000,就能看到完整的todolist应用了。每个服务都对应了外部的映射端口，在正式环境可以去掉，只暴露todolist-web的，供外部访问。

## 自动构建
注意到web应用是添加dist文件到容器中，需要预先构建前端代码，可以使用jenkins或者travis-ci，在代码提交后构建代码，制作镜像并推送到镜像服务器。
