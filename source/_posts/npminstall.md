---
layout: post
title: npm install迷思
date: 2019-11-01
---

### 起因
看公司UI组件库代码的时候突然看到了一份格式混乱，还带有console.log()的文件，察觉到gitHooks失效了。

### debug
首先项目的gitHooks用的是husky工具集成的。查看.git/hooks/目录，里面的钩子文件都是.simple后缀的。简单粗暴的把node_modules文件夹删除之后重新install一遍。
回来了，一切都回来了，顿感舒心。
好奇心驱使我看看有没有不删node_modules就能修复的办法，于是打开了github:[husky](https://github.com/typicode/husky)。
查看package.json：
```
script: {
    "test": "npm run lint && jest",
    "_install": "node husky install",
    "preuninstall": "node husky uninstall",
    "devinstall": "npm run build && cross-env HUSKY_DEBUG=1 npm run _install -- node_modules/husky && node scripts/dev-fix-path",
    "devuninstall": "npm run build && cross-env HUSKY_DEBUG=1 npm run preuninstall -- node_modules/husky",
    "build": "del-cli lib && tsc",
    "version": "jest -u && git add -A src/installer/__tests__/__snapshots__",
    "postversion": "git push && git push --tags",
    "prepublishOnly": "npm run test && npm run build && pinst --enable && pkg-ok",
    "postpublish": "pinst --disable",
    "lint": "eslint . --ext .js,.ts --ignore-path .gitignore",
    "fix": "npm run lint -- --fix",
    "doc": "markdown-toc -i README.md",
    "_postinstall": "opencollective-postinstall || exit 0"
}
```
补充了一下npm的小知识：

>npm 默认提供下面这些钩子  
prepublish，postpublish  
preinstall，postinstall  
preuninstall，postuninstall  
preversion，postversion  
pretest，posttest  
prestop，poststop  
prestart，poststart  
prerestart，postrestart  

就是可以在安装依赖时执行自己的脚本咯？（隐隐感到好像会出现安全问题。）

安全问题先放一边，在husky的script里面并没有看到preinstall，postinstall 的指令。
```bash
 npm i husky

> husky@3.0.9 install C:\person\test\node_modules\husky
> node husky install

husky > Setting up git hooks
Command failed: git rev-parse --show-toplevel --git-common-dir
fatal: not a git repository (or any of the parent directories): .git
husky > Failed to install

> husky@3.0.9 postinstall C:\person\test\node_modules\husky
> opencollective-postinstall || exit 0

Thank you for using husky!
If you rely on this package, please consider supporting our open collective:
> https://opencollective.com/husky/donate

npm WARN test@1.0.0 No description
npm WARN test@1.0.0 No repository field.

+ husky@3.0.9
added 59 packages from 30 contributors, removed 190 packages and audited 92 packages in 34.009s
found 0 vulnerabilities
```

在安装时又有执行`node husky install`, `opencollective-postinstall || exit 0`两条对应_install 和_postinstall指令。
难道npm新增了_install 钩子？？？搜了一遍npm文档也没有找到。

最终在[这里](https://stackoverflow.com/questions/53193055/how-are-devinstall-and-devuninstall-scripts-being-used)找到了答案。
在发布的时候会把_install 变为install！
```
"prepublishOnly": "npm run test && npm run build && pinst --enable && pkg-ok",
```
注意`pinst --enable`,查npmjs.com：
>pinst lets you have postinstall hook that runs only in development 🍺  
>pinst also supports install alias.

至此，debug算告一段落。但是pinst到底有什么用，适用什么场景？？？难道他要困扰我整个程序员生涯吗。

看了尤大的[yorkie](https://github.com/yyx990803/yorkie)。 
package 里

```

"scripts": {
    "test": "jest",
    "format": "prettier --single-quote --no-semi --write **/*.js",
    "install": "node bin/install.js",
    "uninstall": "node bin/uninstall.js"
},
```
啊~舒服了。
