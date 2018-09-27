/**
 * 创建节点
 * @static
 * @param {string|number} element
 */
function LinkedListNode(element) {
  this.element = element;
  this.next = null;
  this.prev = null;
}

/**
 * 链表，元素必须是非对象类型（这个链表的元素是不可以重复的，目前是这样实现的）。
 * 双向链表空间复杂度比单向链表空间复杂度更复杂（理论两倍）
 * 单向链表时间复杂度比双向链表时间复杂度更复杂（理论最大倍数是n-2倍）
 * 单向或者双向链表
 * @class LinkedList
 */
class LinkedList {
  /**
   *Creates an instance of LinkedList.
   * @param {string} type 'one-way'|'bothway' 默认值bothway
   * @param {array} arrayData
   */
  constructor(type = 'bothway', arrayData) {
    if (type === 'one-way') {
      this.oneway = true;
    }
    if (type === 'bothway') {
      this.bothway = true;
    }
    //存放数据
    this.data = {};
    this.length = 0;
    this.head = new LinkedListNode('head');
    this.data['head'] = [this.head];
    this.lastElement = this.head;
    if (Array.isArray(arrayData)) {
      arrayData.forEach(v => {
        this.append(v);
      });
    }
  }
  /**
   * 追加元素
   */
  append(element) {
    const newNode = new LinkedListNode(element);
    const currentNode = this.lastElement;
    newNode.next = currentNode.next;
    currentNode.next = newNode;
    if (this.bothway) {
      newNode.prev = currentNode;
    }
    if (!newNode.next) {
      this.lastElement = newNode;
    }
    this.length++;
    if (this.data[element]) {
      this.data[element].push(newNode);
    } else {
      this.data[element] = [newNode];
    }
  }
  /**
   * 添加元素
   * @param {string | number} element
   * @returns {after,before}
   */
  insert(element) {
    const newNode = new LinkedListNode(element);
    const re = {
      after: afterElement => {
        const currentNode =
          this.data[afterElement] && this.data[afterElement][0];
        if (!currentNode) {
          console.warn('找不到节点插入');
          return;
        }
        newNode.next = currentNode.next;
        currentNode.next = newNode;
        if (this.bothway) {
          newNode.prev = currentNode;
        }
        if (!newNode.next) {
          this.lastElement = newNode;
        }
        this.length++;
        if (this.data[element]) {
          this.data[element].push(newNode);
        } else {
          this.data[element] = [newNode];
        }
      },
    };
    if (this.bothway && element !== 'head') {
      //只有head节点的时候，不可以向前插入。
      re.before = beforeElement => {
        const currentNode =
          this.data[beforeElement] && this.data[beforeElement][0];
        if (!currentNode) {
          console.warn('找不到节点插入');
          return;
        }
        newNode.prev = currentNode.prev;
        currentNode.prev.next = newNode;
        newNode.next = currentNode;
        currentNode.prev = newNode;
        this.length++;
        if (this.data[element]) {
          this.data[element].push(newNode);
        } else {
          this.data[element] = [newNode];
        }
      };
    }
    return re;
  }
  /**
   * 删除链表元素
   */
  remove(element) {
    const removeNode = this.data[element] && this.data[element][0];
    if (!removeNode) {
      console.warn('找不到节点删除');
      return;
    }
    const prevNode = this.findPrev(element);
    const nextNode = removeNode.next;
    prevNode.next = nextNode;
    if (nextNode) {
      //最后一个nextNode=null
      nextNode.prev = prevNode;
    }
    this.data[element].shift();
    if (this.data[element][0] === undefined) {
      delete this.data[element];
    }
    this.length--;
  }
  findPrev(element) {
    if (this.bothway) {
      //双向链表
      //这里的最大时间复杂度是O(1)
      if (this.data[element] && this.data[element][0]) {
        return this.data[element][0].prev;
      }
    } else {
      //单向链表
      //用不了二分法处理，因为是无序的，没法直接确定当前element处于哪个位置
      //这里的最大时间复杂度是O(n)
      let currentNode = this.head;
      while (currentNode.next && currentNode.next.element !== element) {
        currentNode = currentNode.next;
      }
      return currentNode;
    }
  }
  display() {
    var currentNode = this.head;
    while (currentNode.next) {
      console.log(currentNode.next.element);
      currentNode = currentNode.next;
    }
  }
  /**
   * 清空链表元素
   */
  clear() {
    //重置长度
    this.length = 0;
    //重置data
    this.data = {};
    this.head = new LinkedListNode('head');
    this.data['head'] = [this.head];
    this.lastElement = this.head;
  }
  /**
   * 根据索引获取元素，栈应该不怎么用到这个的
   */
  find(element) {
    return this.data[element][0];
  }
}

console.time('初始化数组');
let arr = [];
for (let i = 0; i <= 1000000; i++) {
  arr[i] = i;
}
console.timeEnd('初始化数组');

console.time('初始化链表');
var s = new LinkedList('bothway', arr);
console.timeEnd('初始化链表');

console.time('追加链表元素');
//添加
s.append('d');
console.timeEnd('追加链表元素');

console.time('追加数组元素');
//添加
arr.push('d');
console.timeEnd('追加数组元素');

console.time('删除链表元素');
//删除
s.remove('d');
console.timeEnd('删除链表元素');

console.time('删除数组元素');
//删除
arr.splice(arr.length - 1, 1);
console.timeEnd('删除数组元素');
//经过测试，js的数组在数据庞大的时候性能也挺好，而且数组还可以随机访问，优于链表
//c++、go这些编程语言数组定义需要内存空间，内存不会动态分配，链表某些场景更合适（js不存在这些问题。）
//所以js中能数组解决的，就没必要用链表了。
//这里另外测试出了一个性能问题，js闭包对执行效率影响很大，数据多的时候特别明显（函数return了一个函数，node节点刚开始的时候是这样处理的，后面改了）
//看下面的代码
/*
console.time('初始化数组-非闭包');
var arr = [];
function test2(element){
  this.a = element;
  return;
}
for (let i = 0; i <= 1000000; i++) {
  arr[i] = i;
  test2(1);
}
console.timeEnd('初始化数组-非闭包');
console.time('初始化数组-闭包');
var arr = [];
function test(element){
	function node(){
      this.a = element;
    }
    return new node();
}
for (let i = 0; i <= 1000000; i++) {
  arr[i] = i;
  test(1);
}
console.timeEnd('初始化数组-闭包');
*/
