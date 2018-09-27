# React组件性能优化

### 前言

<div style="display:none;">

React组件 React性能 React优化 React 性能 组件 immutable-js 虚拟DOM shouldComponentUpdate

</div>

众所周知，浏览器的`重绘和重排版(reflows & repaints)`（DOM操作都会引起）才是导致网页性能问题的关键。而React`虚拟DOM`的目的就是为了减少浏览器的`重绘和重排版`。

说到React优化问题，就必须提下`虚拟DOM`。`虚拟DOM`是React核心，通过高新的比较算法，实现了对界面上真正变化的部分进行实际的DOM操作（只是说在大部分场景下这种方式更加效率，而不是一定就是最效率的）。虽然`虚拟DOM`很牛逼（实际开发中我们根本无需关系其是如何运行的），但是也有缺点。如当React组件如下：

```
<Components>
  <Components-1 />
  <Components-2 />
  <Components-3 />
</Components>
```

数据变化从`Components->Components-1`传递下来，React不会只重渲染`Components-1`和其父组件，React会以变化（props和state的变化）的最上层的组件为准生成对比的`虚拟DOM`，就导致了组件没必要的重渲染（即组件render方法的运行）。下面的3张图是借用网上的，是对上面组件更新的图表说明。

- 更新绿色点组件（从根组件传递下来应用在绿色组件上的数据发生改变）

![react 组件渲染 更新子组件](http://7tszky.com1.z0.glb.clouddn.com/Fu_CLUzDTVEB0qJHZO86a1XzNMBx)

- 理想状态我们想只更新绿色点的组件

![react 组件渲染 理想渲染](http://7tszky.com1.z0.glb.clouddn.com/FihwSfzmuS40OcCChFQH93sdMpff)

- 实际图中的组件都会重渲染（黄色的点是不必要的渲染，优化的方向）

![react 组件渲染 实际渲染](http://7tszky.com1.z0.glb.clouddn.com/FstdKvSRRIbrFY2PqQRG59awgemj)

React开发团队也考虑到这个问题，为我们提供了一个组件函数处理数据量大的性能问题，`shouldComponentUpdate`，这个方法是我们的性能优化切入点。

### 虚拟DOM

`虚拟DOM`其实就是一个 JavaScript 对象。 React 使用`虚拟DOM`来渲染 UI，当组件状态有更改的时候，React 会自动调用组件的 `render` 方法重新渲染整个组件的 UI。

当然如果真的这样大面积的操作 DOM，性能会是一个很大的问题，所以 React 实现了一个*虚拟 DOM*，组件 DOM 结构就是映射到这个虚拟 DOM 上，React 在这个虚拟 DOM 上实现了一个 diff 算法，当要更新组件的时候，会通过 diff 寻找到要变更的 DOM 节点，再把这个修改更新到浏览器实际的 DOM 节点上，所以实际上不是真的渲染整个 DOM 树。这个虚拟 DOM 是一个纯粹的 JS 数据结构，所以性能会比原生 DOM 快很多。

### 组件渲染方式

组件渲染方式有两种`初始渲染`和`更新渲染`，而我们需要优化的地方就是更新渲染。

### 优化关键`shouldComponentUpdate`

组件更新生命周期中必调用`shouldComponentUpdate`，字面意思是**组件是否应该更新**。`shouldComponentUpdate`默认返回`true`，必更新。所有当我们判断出组件没必要更新是，`shouldComponentUpdate`可以返回`false`，就达到优化效果。那如何编写判断代码呢？看下以下几种方式。

#### 官方PureRenderMixin

React 官方提供了 PureRenderMixin 插件，其使用方法如下：

[官方说明](https://facebook.github.io/react/docs/pure-render-mixin.html)

```jsx
//官方例子
import PureRenderMixin from 'react-addons-pure-render-mixin';
class FooComponent extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return <div className={this.props.className}>foo</div>;
  }
}
```

在 React 的最新版本里面，提供了 React.PureComponent 的基础类，而不需要使用这个插件。

这个插件其实就是重写了 shouldComponentUpdate 方法，但是这都是最上层对象浅显的比较，没有进行对象深度比较，场景有所限制。那就需要我们自己重写新的PureRenderMixin。

#### 自定义PureRenderMixin

以下重写方式是采用ES6，和[React高阶组件写法](https://segmentfault.com/a/1190000006727526)，使用了`lodash`进行深度比较。可以看我在CodePen的例子[React组件优化之lodash深度对比](http://codepen.io/nange/pen/PGYBBw/)

```jsx
import _ from 'lodash';

function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  const bHasOwnProperty = hasOwnProperty.bind(objB);
  for (let i = 0; i < keysA.length; i++) {
    const keyA = keysA[i];

    if (objA[keyA] === objB[keyA]) {
      continue;
    }

    // special diff with Array or Object
    if (_.isArray(objA[keyA])) {
      if (!_.isArray(objB[keyA]) || objA[keyA].length !== objB[keyA].length) {
        return false;
      } else if (!_.isEqual(objA[keyA], objB[keyA])) {
        return false;
      }
    } else if (_.isPlainObject(objA[keyA])) {
      if (!_.isPlainObject(objB[keyA]) || !_.isEqual(objA[keyA], objB[keyA])) {
        return false;
      }
    } else if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}
```

  function shallowCompare(instance, nextProps, nextState) {
    return !shallowEqual(instance.props, nextProps) || !shallowEqual(instance.state, nextState);
  }

  function shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
  /* eslint-disable no-param-reassign */
  function pureRenderDecorator(component) {
    //覆盖了component中的shouldComponentUpdate方法
    component.prototype.shouldComponentUpdate = shouldComponentUpdate;
    return component;//Decorator不用返回,直接使用高阶组件需要return
  }
  /*****
  *使用ES6 class 语法糖如下，decorator的没试过，decorator请使用上面的，不要return
  *let pureRenderDecorator = component => class {
*    constructor(props) {
*    super(props);
     *    component.prototype.shouldComponentUpdate = shouldComponentUpdate;
     *    }
     *    render(){
          *var Component = component;//自定义组件使用时要大写
     *    return (
          *	<Component {...this.props}/>
             *)
     *    }
          *}
          ******/
          export { shallowEqual };
          export default pureRenderDecorator;
     ```

     这种方式可以确保props和state数无变化的情况下，不重新渲染组件。但是进行了对象深度比较，是比较不划算的。这点Facebook也是有考虑的，所以就有了`immutable-js`。

     #### immutable-js

     `immutable-js`这里就不详说，这里贴一下React组件优化代码，重写`shouldComponentUpdate`

     ​```jsx
     import { is } from 'immutable'
     ...//省略代码
     shouldComponentUpdate(nextProps = {}, nextState = {}){
       const thisProps = this.props || {},
       thisState = this.state || {};

       if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
         Object.keys(thisState).length !== Object.keys(nextState).length) {
         return true;
       }

       for (const key in nextProps) {
         if (thisProps[key] !== nextProps[key] || !is(thisProps[key], nextProps[key])) {
           //console.debug(thisProps[key],nextProps[key])
           return true;
         }
       }

       for (const key in nextState) {
         if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
           return true;
         }
       }
       return false;
     }
     ...//省略代码
     ```

     这里面的处理前提是要使用immutable-js对象，上面的代码不是100%适合所有场景（如果全部的props和states都是immutable对象，这个是没问题的），当props中有函数对象（原生的）时，这个就会失效，需要做些而外处理。

     对于 `Mutable` 的对象（原生的js对象就是Mutable的）的低效率操作主要体现在 **复制 **和 **比较 **上，而 `Immutable `对象就是解决了这两大低效的痛点。

     `immutable-js`的比较是比`lodash`深度对象比较是更有效率的。

     ### 总结

     `immutable-js`的思想其实是跟React的`虚拟DOM`是一致的，都是为了减少不必要的消耗，提高性能。`虚拟DOM`内部处理比较复杂，而且可能还会带有一些开发人员的副作用（render中运行了一些耗时的程序）,算法比较完后会相对耗时。而 `immutable-js`和`lodash`只是纯净的比较数据，效率是相对比较高的，是目前比较适合使用的`PureRender`方式。建议采用`immutable-js`，也可以根据项目性质决定。（ps：持续更新欢迎指正）

     ### 参考文章

     - [react组件性能优化探索实践](http://imweb.io/topic/577512fe732b4107576230b9)
     - [React虚拟DOM浅析](http://www.alloyteam.com/2015/10/react-virtual-analysis-of-the-dom/)
     - [Immutable 在 JavaScript 中的应用](http://ju.outofmemory.cn/entry/255112)
     - [REFLOWS & REPAINTS:](http://www.stubbornella.org/content/2009/03/27/reflows-repaints-css-performance-making-your-javascript-slow/)