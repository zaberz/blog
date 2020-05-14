---
layout: post
title: 前端组长这一年
date: 2019-10-06
---

18年底时，前东家项目前端组解散，于是收拾东西回老家，完成找个创业团队的想法。
新团队从前端组独苗到现在终于有5个打手，压力慢慢减轻了不少，终于有空简单总结一下这段时间的经验。

<!-- more -->  
## 项目类型
做的是一个大数据教学平台的项目，目标用户为高校师生，部署在高校服务器中，提供一套包含课程+上课环境+实验环境的解决方案。刚入职时经理画的饼里有将来会上公有云。 

## 技术选择
考虑到Vue文档清晰，新手友好的特点，选择了Vue全家桶（主要我的技术栈一直是Vue，嘻嘻）。不过后来组员陆续增加的过程中，也证明了这个选择还算合理。小城市专业前端不好招，很长一段时间只有我和另外一个应届生在忙项目。要是选react，估计忙完了他还不能上手。
 
最开始时使用的UI框架是element-ui；在设计人员到岗后，一起参照业内的一些设计规范制作了适合自己的UI组件库。
例如：
- [teambition](https://design.teambition.com/)
- [material](https://material.io/)

框架代码依然参照[element-ui](https://element.eleme.cn)；

根据现在大部分高校的主机情况。经理明确要求要兼容到IE9，在和经理和设计沟通之后，确定开发流程为优雅降级，首先保证主流浏览器体验完整，在IE下保证功能通畅。

## 开发环境
- 使用vue-cli3 初始化的工程，webpack配置基本集成好了。新增了多模块打包的构建脚本。chunk出自己的UI组件JS。
- 通过.env 文件控制环境变量
- 在vue.config.js中添加代理规则
- 最开始在script 中添加了dev:mock 指令，在开发时本地起了个mock-server用来模拟后端数据。后来觉得每次在代码里新增接口对应mock数据过于麻烦，于是另外起了一个easy-mock服务；开发时使用.env.mock代理环境。

## 生产环境
- 生产环境使用K8S集群部署。web项目1个service，2个deployment。项目发布时打包对应版本镜像。镜像dockerfile：
```code
FROM imageserver/nginx:1.14.2
ADD  dist /usr/share/nginx/html/dist
ADD lib/nginx.conf /etc/nginx/conf.d/site.conf
EXPOSE 80
```
在nginx.conf中定好代理规则和静态资源缓存策略

## 代码规范
### html
尽量语义化
### css
使用scss，项目结构参照[scss结构](https://www.sasscss.com/sass-guidelines/architecture/)
```code
理想情况下，目录层次如下所示：
sass/
|
|– abstracts/
|   |– _variables.scss    # Sass Variables
|   |– _functions.scss    # Sass Functions
|   |– _mixins.scss       # Sass Mixins
|   |– _placeholders.scss # Sass Placeholders
|
|– base/
|   |– _reset.scss        # Reset/normalize
|   |– _typography.scss   # Typography rules
|   …                     # Etc.
|
|– components/
|   |– _buttons.scss      # Buttons
|   |– _carousel.scss     # Carousel
|   |– _cover.scss        # Cover
|   |– _dropdown.scss     # Dropdown
|   …                     # Etc.
|
|– layout/
|   |– _navigation.scss   # Navigation
|   |– _grid.scss         # Grid system
|   |– _header.scss       # Header
|   |– _footer.scss       # Footer
|   |– _sidebar.scss      # Sidebar
|   |– _forms.scss        # Forms
|   …                     # Etc.
|
|– pages/
|   |– _home.scss         # Home specific styles
|   |– _contact.scss      # Contact specific styles
|   …                     # Etc.
|
|– themes/
|   |– _theme.scss        # Default theme
|   |– _admin.scss        # Admin theme
|   …                     # Etc.
|
|– vendors/
|   |– _bootstrap.scss    # Bootstrap
|   |– _jquery-ui.scss    # jQuery UI
|   …                     # Etc.
|
`– main.scss              # Main Sass file
```
使用BEM方案，学习element-ui封装好BEM的mixins

### javascript
- 代码质量用eslint检测
- 代码格式用prettier修正
两项在vue create app的时候已经手动设置好，没有多余配置项。

### 文档：
- 代码即文档：https://vue-styleguidist.github.io/ (正打算添加到项目，还没有相关实践)

## 开发流程&人员分工

因为是新建的团队，前期磨合上肯定有各种各样的问题，所幸的是项目经理能够及时站出来调整流程，强制执行。
- 首先由产品经理根据客需或者从自身产品考虑初步整理需求，然后产品组细化完成初稿，然后开发简单沟通，从可行性和开发难度上给出建议。需求对应修改，在召集开发组需求评审。
- 接收需求后开发组分配任务，估计迭代周期开始开发。
- 前端组细分：
    * 更新、维护UI组件，接口定制，实现效果质量把关（我）
    * 其他
- 测试，bugfix，交付
 
## 今年的收获
从一个开发者逐渐转为带人开发，真实体会到工作不易。曾今作为一个普通开发，我一直觉得工作一定要分清楚职责，然后每个人都把自己负责的事情做好就没问题。现在换了个角度，然我充分意识到团队能力有差距，个人技术也有长短，只承担自己的责任有时候是行不通的。自闭的我开始强化和上级以及组员的沟通，开始学会站在产品的角度看我们的项目。想起之前面试时有一次面试官问我：“有想过做架构师吗，你知道架构师的职责是什么吗”。当时我的回答是：用一些成熟的技术，保障项目代码结构清晰逻辑顺畅，使用各种工具，保障项目稳定运行。他告诉我：架构师的主要职责是传承。才体会到这句话的意思。

意识到自己的不足：对别人没有要求。比如需求提过来没有自己的想法，只知道接收然后开发。再比如组员开发完成后看着有一点别扭，也只是提了一句没有强制修改，一直等到最后测试提。
