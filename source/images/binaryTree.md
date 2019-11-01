---
layout: post
title: 最近公司业务做的有点多
date: 2019-10-17
---

最近公司业务做的有点多，快忘了解题的乐趣了。想起去年面试的时候被问到一个二叉树的问题没答上来，补一下。

```js
class Node{
  constructor(val) {
    this.val = val
    this.leftNode = null
    this.rightNode = null
  }
}

class AVLBinaryTree{
  constructor() {
    this.root = null
  }
  inOrderTraverse(node = this.root) {
    this.inOrderTraverse(node.left)
    console.log(node.val)
    this.inOrderTraverse(node.right)
  }
  preOrderTraverse(node = this.root) {
    if (node !== null) {
        console.log(node.val)
        this.preOrderTraverse(node.left)
        this.preOrderTraverse(node.right)
    }
  }
  postOrderTraverse(node = this.root) {
    if (node !== null) {
      this.postOrderTraverse(node.left)
      this.postOrderTraverse(node.right)
      console.log(node.val)
    }
  }
  insert(val) {
    const newNode = new Node(val)
    if(this.root === null) {
      this.root = newNode
    } else {
      this._insertNode(this.root, newNode)
    }
  }
  _insertNode (node, newNode) {
    if (newNode.val <= node.val) {
      if (node.left === null) {
        node.left = newNode
      }else {
      this._insertNode(node.left, newNode)
      }
    }else {
      if (node.right === null) {
        node.right = newNode
      }else {
        this._insertNode(node.right, newNode)
      }
    }
  } 
  remove() {}
  search() {
  }
  getMin() {}
  getMax() {}
}



```

