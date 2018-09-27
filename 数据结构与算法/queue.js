/**
 * js实现列队会相对简单点，如果在其他语言需要配合链表来处理会更好点。
 */
class Queue {
  constructor(arrayData = []) {
    //存放数据
    this.data = [];
    if (Array.isArray(arrayData)) {
      arrayData &&
        arrayData.forEach(v => {
          this.enqueue(v);
        });
    } else {
      console.warn('Queue实例化参数不是数组，不做处理！');
    }
  }
  //入队
  enqueue(element) {
    this.data.push(element);
  }
  //出队
  dequeue() {
    return this.data.shift();
  }
  //列队最前面的元素
  front() {
    return this.data[0];
  }
  //列队最后面的元素
  back() {
    return this.data[this.data.length - 1];
  }
  //列队展示
  toString() {
    var retStr = '';
    this.data.forEach(v => {
      retStr += v + '\n';
    });
    return retStr;
  }
  //是否是空队列
  isEmpty() {
    if (this.data.length === 0) {
      return true;
    } else {
      return false;
    }
  }
}

var q = new Queue();
q.enqueue('Meredith');
q.enqueue('Cynthia');
q.enqueue('Jennifer');
console.log(q.toString());
q.dequeue();
console.log(q.toString());
console.log('Front of queue: ' + q.front());
console.log('Back of queue: ' + q.back());
