class Stack {
  constructor(arrayData) {
    //存放数据
    this.data = {};
    //栈索引，从0算起
    this.index = 0;
    if (Array.isArray(arrayData)) {
      arrayData &&
        arrayData.forEach(v => {
          this.push(v);
        });
    } else {
      console.warn('Stack实例化参数不是数组，不做处理！');
    }
  }
  /**
   * 栈长度
   * @readonly
   */
  get length() {
    return this.index;
  }
  /**
   * 尾部追加元素
   */
  push(element) {
    this.data[this.index] = element;
    this.index++;
  }
  /**
   * 出栈，会删除元素
   */
  pop() {
    this.index--;
    if (this.index < 0) {
      return;
    }
    const element = this.data[this.index];
    delete this.data[this.index];
    return element;
  }
  /**
   * 获取栈顶元素，不会删除元素
   */
  top() {
    return this.data[this.index - 1];
  }
  /**
   * 清空栈元素
   */
  clear() {
    //重置index
    this.index = 0;
    //重置data
    this.data = {};
  }
  /**
   * 根据索引获取元素，栈应该不怎么用到这个的
   */
  get(index) {
    return this.data[index];
  }
}
