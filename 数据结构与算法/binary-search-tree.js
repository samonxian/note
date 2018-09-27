class BSTNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
  }
}

/**
 * 二分查找树 Binary Search Tree
 */
class BST {
  constructor(initArrayData) {
    this.root = null;
    if (Array.isArray(initArrayData)) {
      initArrayData.forEach(v => {
        this.insert(v);
      });
    }
  }

  insert(key) {
    //向二叉树插入一个新的键
    var newNode = new BSTNode(key);

    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  insertNode(node, newNode) {
    if (newNode.key < node.key) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  getRoot() {
    //获取根节点
    return this.root;
  }

  search(key) {
    //在二叉树查找一个键，如果节点存在，则返回node；如果不存在，则返回false。
    return this.searchNode(this.root, key);
  }

  searchNode(node, key) {
    if (node === null) {
      return false;
    }

    if (key < node.key) {
      return this.searchNode(node.left, key);
    } else if (key > node.key) {
      return this.searchNode(node.right, key);
    } else {
      return node;
    }
  }

  inOrderTraverse(callback) {
    //通过中序遍历方式遍历所有节点
    this.inOrderTraverseNode(this.root, callback);
  }

  inOrderTraverseNode(node, callback) {
    //遍历左子树–>访问根–>遍历右子树
    if (node !== null) {
      //左
      this.inOrderTraverseNode(node.left, callback);
      //根
      callback(node.key);
      //右
      this.inOrderTraverseNode(node.right, callback);
    }
  }

  preOrderTraverse(callback) {
    //通过先序遍历方式遍历所有节点。
    this.preOrderTraverseNode(this.root, callback);
  }

  preOrderTraverseNode(node, callback) {
    //访问根–>遍历左子树–>遍历右子树
    if (node !== null) {
      //根
      callback(node.key);
      //左
      this.preOrderTraverseNode(node.left, callback);
      //右
      this.preOrderTraverseNode(node.right, callback);
    }
  }

  postOrderTraverse(callback) {
    //通过后序遍历方式遍历所有节点。
    this.postOrderTraverseNode(this.root, callback);
  }

  postOrderTraverseNode(node, callback) {
    // 遍历左子树–>遍历右子树–>访问根
    if (node !== null) {
      //左
      this.postOrderTraverseNode(node.left, callback);
      //右
      this.postOrderTraverseNode(node.right, callback);
      //根
      callback(node.key);
    }
  }

  min() {
    //返回二叉树中最小的键值
    return this.minNode(this.root);
  }

  minNode(node) {
    if (node) {
      while (node && node.left !== null) {
        node = node.left;
      }
      return node.key;
    }
    return null;
  }

  max() {
    //返回二叉树中最大的键值
    return this.maxNode(this.root);
  }

  maxNode(node) {
    if (node) {
      while (node && node.right !== null) {
        node = node.right;
      }

      return node.key;
    }
    return null;
  }

  remove(element) {
    //从书中移除某个键
    this.root = this.removeNode(this.root, element);
  }

  findMinNode(node) {
    while (node && node.left !== null) {
      node = node.left;
    }

    return node;
  }

  removeNode(node, element) {
    if (node === null) {
      return null;
    }

    if (element < node.key) {
      node.left = this.removeNode(node.left, element);
      return node;
    } else if (element > node.key) {
      node.right = this.removeNode(node.right, element);
      return node;
    } else {
      if (node.left === null && node.right === null) {
        node = null;
        return node;
      }

      if (node.left === null) {
        node = node.right;
        return node;
      } else if (node.right === null) {
        node = node.left;
        return node;
      }

      var aux = this.findMinNode(node.right);
      node.key = aux.key;
      node.right = this.removeNode(node.right, aux.key);
      return node;
    }
  }
}
