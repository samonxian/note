# 前端学习要点
个人总结，下面列出常用、好用、实用，需要深入掌握的知识知识要点（针对es5以上，包括es6、7部分,不涉及浏览器兼容性问题），非语法类知识。
知识关键词：
## 基础
所谓的基础，不是语法基础，是一些基础概念。
### 对象 && 原型链([prototype chain](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain))  && 继承
#### 对象
JavaScript里一切都是对象。 JavaScript对象归根到底就是Json对象(最终都能以Json格式的对象表现出来,个人见解)。

包括内建对象Date、String、Array等，也可以自己创建对象。 以下是几种自定义创建JavaScript对象的方式(内建对象			date,数组等已存在，不算创建)

- 直接创建 
```jsx
var o = new Object({a:2});
//代替语法
var o = {a:2}
```
- 构造器（普通方法）
```js
function test(){
    this.b = 0;
}
//定义test原型链上的属性和方法
test.prototype = {
    a: function(){
    }
}
```
- Object.create
  这种创建方式会使生成新的对象，传入的对象就成了父级原型链。
```js
var o = Object.create({
    a: 2
});
//o.a不是当前o的属性，是原型链上的属性。
```
- es6 class(特殊的构造器)
  这种方法跟构造函数创建对象差不多，只是语法不一样。如果可以，推荐使用这种方法。
```js
class Test{
  	constructor(height, width) {
        this.height = height;
        this.width = width;
    }
    test(){

    }
}
```
#### 原型链
**原型链**本质就是对象，理论上可以无限指向（就像Java、C++等的类继承了无数）。而JavaScript没有类的概念,这跟当初设计JavaScript的初衷有关（即使 ES6 新增了class 写法，但只是语法而已，JavaScript 仍旧是基于`原型`）。

在 javaScript 中，每个对象都有一个指向它的原型（prototype）对象的内部链接。这个原型对象又有自己的原型，直到某个对象的原型为 null 为止（也就是不再有原型指向），组成这条链的最后一环。这种一级一级的链结构就称为原型链（prototype chain）。

原型继承经常被视作 JavaScript 的一个弱点，但事实上，原型继承模型比经典的继承模型更强大。

原型链上查找属性是相对**耗时**的,例如当原型链**长度**为10(包括自身),而属性**不存在**时,会遍历10次即整个原型链,才会返回undefiend。所以检测属性是否定义当前对象，建议使用hasOwnProperty(不查找原型链上的属性，可以理解为父级属性),如果检测父级属性，那就没更好的办法了。

#### 继承
涉及到继承这一块，Javascript 只有一种结构，那就是：`对象`。继承这里就说下构造器创建对象和es6 Class创建对象的继承。

- 构造器原型继承
  这种继承还分构造器继承（用到apply，下面有讲）和原型链继承
```js
//A类
    //构造器
    function A(params){
       this.props1 = 1; 
       this.props2 = 1; //会覆盖A原型链上的props2属性
    }
    //原型链继承
    A.prototype = {
        props2 : 6,
        a: function(){
            console.log(this.b);
            this.props1++;
        },
        b: 3,
        c: function(){
            console.log(this.props2);
        },
    }
var a = new A();
console.log(a.props1);//结果1
a.a();//结果3
console.log(a.props1);//结果2
a.c();//结果1
//B类
    //构造器
    function B(params){
        A.apply(this,params) //构造器继承
        this.props2 = 4;//覆盖 
    }
    //原型链继承
    B.prototype = A.prototype;//其实就是直接赋值，跟传统的继承是由区别的
    //再定义追加，覆盖属性和方法
    B.prototype.a = function(){
        console.log(this.props1);//继承而来
    }
var b = new B();
console.log(b.props2)//结果4
b.a();//结果1
```
- es6 class 继承 
  这种就很好理解了,不多说。
```js
class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

class Square extends Polygon {
  constructor(sideLength) {
    super(sideLength, sideLength);
  }
  get area() {
    return this.height * this.width;
  }
  set sideLength(newLength) {
    this.height = newLength;
    this.width = newLength;
  }
}
var square = new Square(2);
```
#### 结论
在用原型继承编写复杂代码前理解原型继承模型十分重要。同时，还要清楚代码中原型链的**长度**，并在必要时结束原型链，以避免可能存在的性能问题。此外，除非为了兼容新 JavaScript 特性，否则，永远不要扩展原生的对象原型。es6普及后就不用太担心这些问题了。
### 作用域 && 作用域链
下面的两个文章都说的挺好的。
- [JavaScript Variable Scope and Hoisting Explained](http://javascriptissexy.com/javascript-variable-scope-and-hoisting-explained/)
- [理解 JavaScript 作用域和作用域链](http://www.cnblogs.com/lhb25/archive/2011/09/06/javascript-scope-chain.html)
#### 作用域
任作用域是变量与函数存在的上下文。简单的说，作用域就是变量与函数的可访问的范围。

- 全局作用域(Global Scope)
  在全局作用域设置的全局变量、函数所处的,任何地方都可以访问的到。
- 局部作用域(Local Scope)
  局部作用域又成`函数级作用域`（es6之前是没用块级作用域,大括号的当前作用域就是函数级作用域或全局作用域）,变量或函数定义在函数内所处的上下文就是局部作用域。局部作用域可以保护局部作用域,和全局作用域就形成了下面的`作用域链`。
#### 作用域链
作用域链就是JavaScript查找变量或函数的方式。JavaScript查找变量或函数首先在当前作用域查找，找不到就往上级作用域查找知道找到为止，否则报错。可以以原型链的思想理解作用域链。

所以这里是可以做一定的代码优化的，在当前的作用域找到变量或方法就最佳的。实际上影响不会太大，有意识就行了。
#### 总结
作用域的赋值范围和访问范围是相反的，就是说全局变量可以设置全局变量(是让别的作用域访问的)，但是全局作用域它是直接访问不了局部变量。

### 闭包原理及应用
闭包是JavaScript的一种特性，很多其他传统语言都不具备。闭包其实就是作用域链的一种应用,后面说道的`Thunk`就是闭包的一种封装。
那什么是闭包呢？简单说闭包就是内部函数，最简单内部函数有三级原型链，它可以访问当前作用域，外层作用域，全局作用域。
```js
var k = 1;//全局作用域变量
function A(j){
    var i = 0;//局部作用域变量,级上面说的外层作用域
    return function B(){//局部作用域函数
        return k+i+j;//更深层的局部作用域,即上面说的当前作用域,它的访问范围是最广的
    }
}
var a = A(1);
a();//2
```

推荐一篇文章，解析的很不错！ [understand-javascript-closures-with-ease](http://javascriptissexy.com/understand-javascript-closures-with-ease/)
### this
#### this上下文
首先要了解`上下文`(Context),所有编程语言都有上下文的概念。`上下文`简单理解就是`this`代表的对象（JavaScript都是对象）。以下是可以使用三种this的情况：

- 全局作用域 
  当我们在全局作用域中定义全局函数是直接调用（不适用new关键字），this==window(全局变量默和函数是定义在window对象上，全局变量和函数是可以省略window关键字的)。一般我们都会省略这个的，即使用使用window比较好区别。
```js
var firstName = "Peter",
lastName = "Ally";
function showFullName () {
    console.log (this.firstName + " " + this.lastName);
}
showFullName (); // Peter Ally
//加window关键字跟上面是一样的。
window.showFullName (); // Peter Ally
```
- 使用构造器实例化
  直接实例化this上下文就指向构造器showFullName实例化的对象。
```jsx
var firstName = "Peter",
lastName = "Ally";
function showFullName () {
    console.log (this.firstName + " " + this.lastName);
}
new showFullName (); // undefined undefined
```
```js
function showFullName () {
    this.firstName = "test"
    this.lastName = "test2"
    console.log (this.firstName + " " + this.lastName);
}
showFullName.prototype = {
    a: 2,
    test : function(){
       console.log(this.a) 
    } 
}
var show = new showFullName (); //结果 test test2
show.test();//结果2
```
- 直接定义对象中的`this`
  这种情况无论在全局作用域还是局部作用域，`this`上下文就是当前对象的(针对当前对象作用域，下级作用域不算)。
```javascript
var obj = {
    count: 20,
    test: function(){
        console.log(this.count);//this上下文是obj
    }
}
obj.test();//20
```
#### `this`容易误解的情况
- 当方法是被当成回调函数,`this`上下文的作用域已经改变。
```javascript
var obj = {
    count: 20,
    test: function(){
        console.log(this.count);//this上下文是obj
    }
}
function test(callback){
    callback();
}
test(obj.test);//undefined
```
- 当在使用forEach,map等自带函数时，匿名回调函数(或定义)的作用域也会改变。
```javascript
var obj = {
    count: 20,
    data: [1,2],
    test: function(){
        data.forEach(function(){
            console.log(this.count);//this上下文是obj
        })
    }
}
obj.test();//undefined undefined
```
- 当使用变量重新分配对象函数
```js
//全局作用域data变量 
var data = [
    { name: "Samantha", age: 12 },
    { name: "Alexis", age: 14 }
]
var user = {
        //局部作用域data变量
        data: [
            { name: "T. Woods", age: 37 },
            { name: "P. Mickelson", age: 43 }
        ],
        showData: function(event) {
            var randomNum = ((Math.random() * 2 | 0) + 1) - 1; 
            console.log(this.data[randomNum].name + " " + this.data[randomNum].age);
        }
    }
    // user.showData 绑定到一个变量上,相当于在全局作用域中重新定义了一个方法
var showDataVar = user.showData;
showDataVar(); // Samantha 12 (结果是全局作用域data array)
//相当于
var showData = function(event) {
    var randomNum = ((Math.random() * 2 | 0) + 1) - 1; 
    console.log(this.data[randomNum].name + " " + this.data[randomNum].age);
}
showDataVar(); // Samantha 12 (结果是全局作用域data array)
```
#### `this`上下文解决方案
- 解决办法就是使用apply,call,bind方法改变`this`上下文，下面详解。
- 解决可以使用for循环，for循环不形成新的作用域。
```javascript
var obj = {
    count: 20,
    data: [1,2],
    test: function(){
        for(var i=0,i++,i < data.length){
            console.log(this.count);
        }
    }
}
obj.test();//20 20 
```
- 定义变量`that=this`。
```javascript
var obj = {
    count: 20,
    data: [1,2],
    test: function(){
        var that = this;
        data.forEach(function(){
            console.log(that.count);//this上下文是obj
        })
    }
}
obj.test();//undefined undefined
```
#### 结论 
`this`上下文是跟`this`当前作用域有关的，而闭包则形成了新的作用域，`this`的上下文就会跟着改变！而当`this`在当前作用域找不到代表上下文，最终就会以全局作用域为参考，this==window。
#### 推荐文章
- [Understand JavaScript’s “this” With Clarity, and Master It](http://javascriptissexy.com/understand-javascripts-this-with-clarity-and-master-it/)
### apply && call && bind方法
- [JavaScript’s Apply, Call, and Bind Methods are Essential for JavaScript Professionals](http://javascriptissexy.com/javascript-apply-call-and-bind-methods-are-essential-for-javascript-professionals/)
### es6的块级作用域
### getter && setter
### 并发模型
JavaScript的"并发模型"是基于事件循环的，这个并发模型有别于Java的多线程， javascript的并发是单线程的。
Javascript 中有个重要一块，Event Loop，能把单线程的 JavaScript 使出 多线程的感觉。
简单的说，就是在程序中（不一定是浏览器）中跑两个线程，一个负责程序本身的运行，作为主线程； 另一个负责主线程与其他线程的的通信，被称为“Event Loop 线程" 

### 事件
- [参考文章](http://web.jobbole.com/82419/)
- [原生JavaScript事件详解 ](http://www.cnblogs.com/iyangyuan/p/4190773.html)
- [漫谈js自定义事件、DOM/伪DOM自定义事件](http://www.zhangxinxu.com/wordpress/2012/04/js-dom%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6/)
#### 事件流
#### 事件模型
#### 事件代理/委托
## 提高
### 内存泄露
#### 垃圾回收原理

`引用计数垃圾收集`，这是最简单的垃圾收集算法。此算法把“对象是否不再需要”简化定义为“对象有没有其他对象引用到它”。如果没有引用指向该对象（零引用），对象将被垃圾回收机制回收。

`循环引用`问题，这个简单的算法有一个限制，就是如果一个对象引用另一个（形成了循环引用），他们可能“不再需要”了，但是他们不会被回收。
```javascript
function f(){
  var o = {};
  var o2 = {};
  o.a = o2; // o 引用 o2
    o2.a = o; // o2 引用 o
  return "azerty";
}

f();
// 两个对象被创建，并互相引用，形成了一个循环
// 他们被调用之后不会离开函数作用域
// 所以他们已经没有用了，可以被回收了
// 然而，引用计数算法考虑到他们互相都有至少一次引用，所以他们不会被回收
```
#### 标记-清除算法
这个算法把“对象是否不再需要”简化定义为“对象是否可以获得”。
这个算法假定设置一个叫做根的对象（在Javascript里，根是全局对象）。定期的，垃圾回收器将从根开始，找所有从根开始引用的对象，然后找这些对象引用的对象……从根开始，垃圾回收器将找到所有可以获得的对象和所有不能获得的对象。

这个算法比前一个要好，因为“有零引用的对象”总是不可获得的，但是相反却不一定，参考“循环引用”。
从2012年起，所有现代浏览器都使用了标记-清除垃圾回收算法。所有对JavaScript垃圾回收算法的改进都是基于标记-清除算法的改进，并没有改进标记-清除算法本身和它对“对象是否不再需要”的简化定义。`循环引用`不再是问题了。

在上面的示例中，函数调用返回之后，两个对象从全局对象出发无法获取。因此，他们将会被垃圾回收器回收。
第二个示例同样，一旦 div 和其事件处理无法从根获取到，他们将会被垃圾回收器回收。

`限制`: 那些无法从根对象查询到的对象都将被清除
尽管这是一个限制，但实践中我们很少会碰到类似的情况，所以开发者不太会去关心垃圾回收机制。

参考文章http://web.jobbole.com/88463/

### 函数式编程

`函数式编程`是一种基于过程抽象的编程方式，`函数式编程`是关于如何把一个问题分解为一系列函数的。

无论如何你已经在用`函数式编程`只是没有概念呢。

下面就常用的几种用法说明：

### 纯函数

一个函数如果输入参数确定，如果输出结果是唯一确定的（不一定是返回值，包括操作），并且没有副作用，那么它就是纯函数。

`纯函数`是最好理解的，不依赖外层环境变量，结果是可预算的。

非纯函数：

```js
var a = 2;
function test(pi){
  //a的值可能中途被修改
	return pi + a;
}
```

纯函数：

```js
function test(pi){
  //只要pi确定，返回结果就一定确定。
	return pi + 2;
}
```

#### 匿名函数

不需要命名的就是匿名函数。

```js
// 写匿名函数的标准方式
function() {
 return "hello world"
};
```

#### 递归

递归应该是最著名的函数式编程技术。就是一个函数调用它自己。

```js
var foo = function(n) {
 if (n < 0) {
  // 基准情形
  return 'hello';
 } else {
  // 递归情形
  return foo(n - 1);
 }
}
console.log(foo(5));
```

#### 柯里化

> ① 柯里化（Currying），又称部分求值（Partial Evaluation），是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。

柯里化的作用以下作用:

- 参数复用
- 提前返回
- 延迟计算/运行

```js
// 柯里化之前
function add(x, y) {
  return x + y;
}

add(1, 2) // 3

// 柯里化之后
function addX(y) {
  return function (x) {
    return x + y;
  };
}

addX(2)(1) // 3
```



### Iterator(迭代器)
### 异步编程
#### 异步编程之回调函数
#### 异步编程之Promise
#### 异步编程之Generator(es6)
#### 异步编程之Thunk函数
#### 异步编程之Generator与Promise结合(es6)
#### 异步编程之ES7 Async函数原理(es7)
### 劫持
何为劫持，这样说，假设alert("我爱你")函数本来只有，打印出“我爱你”这个，劫持后test()就可以打印出“我爱你的钱”，或者其他的信息。
```js
var _alert = alert;
window.alert = function(str){
    str = str + "的钱";
    _alert(str)
}
```
ES6中有种用法[Proxy和Reflect](http://es6.ruanyifeng.com/#docs/proxy)，就属于劫持。
### 前端优化

#### HTTP Caching

#### 浏览器DOM渲染

#### 函数节流

#### 性能优化文章推荐

- [如何用 HTTP Caching 优化网站](http://blog.chenlb.com/2009/07/http-caching-optimize-your-site.html)


- [浅谈浏览器http的缓存机制](http://www.cnblogs.com/vajoy/p/5341664.html)
- [浅谈WEB页面提速（前端向）](http://www.cnblogs.com/vajoy/p/4183569.html)
- [【Web缓存机制系列】1 – Web缓存的作用与类型](http://www.alloyteam.com/2012/03/web-cache-1-web-cache-overview/)


- [Optimizing JavaScript code](https://developers.google.com/speed/arhttps://developers.google.com/speed/articles/reflowticles/optimizing-javascript)
- [Dom的性能瓶颈及原因](http://www.cnblogs.com/hyddd/archive/2013/02/07/2908960.html)
- [Minimizing browser reflow](https://developers.google.com/speed/articles/reflow)
- [REFLOWS & REPAINTS](http://www.stubbornella.org/content/2009/03/27/reflows-repaints-css-performance-making-your-javascript-slow/)
### HTTP
#### 跨域

#### 常用状态码

### 前端安全

### HTTP劫持

什么是HTTP劫持呢，大多数情况是运营商HTTP劫持，当我们使用HTTP请求请求一个网站页面的时候，网络运营商会在正常的数据流中插入精心设计的网络数据报文，让客户端（通常是浏览器）展示“错误”的数据，通常是一些弹窗，宣传性广告或者直接显示某网站的内容，大家应该都有遇到过。

### DNS劫持

DNS劫持就是通过劫持了DNS服务器，通过某些手段取得某域名的解析记录控制权，进而修改此域名的解析结果，导致对该域名的访问由原IP地址转入到修改后的指定IP，其结果就是对特定的网址不能访问或访问的是假网址，从而实现窃取资料或者破坏原有正常服务的目的。

DNS 劫持就更过分了，简单说就是我们请求的是` http://www.a.com/index.html `，直接被重定向了 `http://www.b.com/index.html `。

### XSS（Cross-site scripting 跨站脚本）

往Web页面里插入恶意html代码，当用户浏览该页之时，嵌入其中Web里面的html代码会被执行，这就是`XSS`。`HTTP` 劫持 和` XSS` 最终都是恶意代码在客户端，通常也就是用户浏览器端执行。

### CSRF（Cross-site request forgery 跨站请求伪造）

## SVG

### viewBox

### SVG动画

### SVG参考文章

[JavaScript操作SVG的一些知识](http://blog.iderzheng.com/something-about-svg-with-javascript/)

## 其他

### 设计模式
### 基础算法