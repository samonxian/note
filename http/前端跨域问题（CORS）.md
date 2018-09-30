# 前端跨域问题（CORS）
主要是总结浏览器`CORS`跨域，其他的本人认为是`伪跨域`，如`iframe`、`window.name`、`window.postMessage`。

## 跨域定义

> 跨站 HTTP 请求(Cross-site HTTP request)是指发起请求的资源所在域不同于该请求所指向资源所在的域的 HTTP 请求。

跨站 HTTP正常请求，但是结果被浏览器拦截了，就是`跨域问题`。

`跨域问题`只有在浏览器才会出现，javascript等脚本的主动http请求才会出现`跨域问题`。后端获取http数据不会存在跨域问题。`跨域问题`可以说是浏览器独有的（或者说http客户端独有的，这个其实看制定者是否遵循协议）。

**注意：有些浏览器不允许从HTTPS的域跨域访问HTTP，比如Chrome和Firefox，这些浏览器在请求还未发出的时候就会拦截请求，这是一个特例。**

## 怎么才算跨域？

那我我们要先理解何为`同源`（同域）。

> 如果两个页面的协议，端口（如果有指定）和域名都相同，则两个页面具有相同的**源**。

不同**源**就是跨域。

下表给出了相对`http://store.company.com/dir/page.html`**跨域**检测的示例:

| 链接                                              | 跨域与否 | 原因                     |
| ------------------------------------------------- | -------- | ------------------------ |
| `http://store.company.com/dir2/other.html`        | 否       |                          |
| `http://store.company.com/dir/inner/another.html` | 否       |                          |
| `https://store.company.com/secure.html`           | 是       | 不同协议 ( https和http ) |
| `http://store.company.com:81/dir/etc.html`        | 是       | 不同端口 ( 81和80)       |
| `http://news.company.com/dir/other.html`          | 是       | 不同域名 ( news和store ) |

跨域情况总结如下：

- 不同协议 ( https和http )
- 不同端口 ( 81和80)
- 不同域名 ( news和store )

**IE会有点不一样，更加宽松，但是前端兼容是`短柄`，所以不用理会IE。**

## 为什么要有跨域限制？

> 同源策略限制了从同一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的重要安全机制。

还是安全问题，如果不限制，那么`CSRF`（Cross-site request forgery，中文名称：跨站请求伪造）攻击就很容易实现了。

举个例子，假设没有跨域限制：

假设你是`a.com`网站的管理员，你在`a.com`网站有一个权限是删除用户，比如说这个过程只需用你的身份登陆并且POST数据到`http://a.com/deleteUser`，就可以实现删除操作。
然后假设有个`b.com`网站被攻击了，别人种下了恶意代码，你点开的时候就会模拟跨域请求（你同时在浏览器中不同标签打开了`a.com`和`b.com`网站，并且你已经登录了`a.com`），那么`b.com`的恶意代码就可以模拟对`a.com`的跨域请求，模拟一个用户删除操作是很简单的（当然是攻击者有意针对，而且知道了删除接口）。

通过例子可知道，这是多危险的事情，所以浏览器都会做跨域限制。 

## 什么是预请求？

`预请求`就是使用[`OPTIONS`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS)方法。跨域请求首先需要发送`预请求`，即使用 [`OPTIONS`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS)   方法发起一个`预请求`到服务器，以获知服务器是否允许该实际请求。`预请求`的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。

**跨域才会有预请求，但是不是所有跨域请求都会发送预请求的。** `预请求`服务器正常返回，浏览器还要判断是否合法，才会继续正常请求的。所以web服务程序需要针对options做处理，要不然`OPTIONS`的请求也会运行后端代码。一般`预请求`最好返回`204`(NO-Content)。

在谷歌开发者工具上查看网络请求时，如果`预请求`是不在`XHR`这个分类中，可以在`Other`分类或者`ALL`中查看。

### 什么时候会有预请求？

一般服务器默认允许`GET、POST、HEAD`请求（前提跨域），所以这些请求，只要前端脚本不追加请求头，是不会有预请求发出的。这些请求叫`简单请求`。

可以简单总结为**只有GET、POST、HEAD才可能没有预请求**。

大多数浏览器不支持针对于`预请求`的`重定向`。如果一个`预请求`发生了`重定向`，浏览器将报告错误：

```http
The request was redirected to 'https://example.com/foo', which is disallowed for cross-origin requests that require preflight
```

简单举个javascript代码例子：

有**预请求**：

```js
fetch('http://localhost:3000/demo-01', {
  method: 'get',
  headers: {
    //这里定义了请求头就一定会有预请求。
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  },
})
```

无**预请求**：

```js
fetch('http://localhost:3000/demo-01', {
  method: 'get'
})
```

## 跨域流程图

![浏览器跨域请求流程图](https://dog-days.github.io/demo/static/cors-flow.png)

流程图不会把代理服务器考虑进去，而且不考虑异常状态码。

## 一些名称说明

- `跨域请求`也是`跨站请求`，叫法不一样。
- `HTTP请求头`也是`HTTP请求首部`
- `HTTP响应头`也是`HTTP响应首部`

## 跨域解决方案

正如大家所知，出于安全考虑，浏览器会限制脚本中发起的跨站请求。但是为了能开发出更强大、更丰富、更安全的Web应用程序，开发人员渴望着在不丢失安全的前提下，Web 应用技术能越来越强大、越来越丰富。

Web 应用工作组( Web Applications Working Group )推荐了一种的机制，即跨源资源共享（Cross-Origin Resource Sharing (CORS)）。

**跨域资源共享标准新增了一组 HTTP 首部字段，允许服务器声明哪些源站有权限访问哪些资源。**

### 跨域需要设置的HTTP首部字段

实现前后端跨域请求，需要设置下面相关的`HTTP响应头`:

| 字段名                           | 必须设置与否 |
| -------------------------------- | ------------ |
| Access-Control-Allow-Origin      | 是           |
| Access-Control-Allow-Credentials | 否           |
| Access-Control-Allow-Methods     | 否           |
| Access-Control-Max-Age           | 否           |

一般只要设置好` Access-Control-Allow-Origin`就可以跨域了，其他的字段都是配合使用的（其他字段有默认值）。

#### Access-Control-Allow-Origin

跨域允许就是这个字段设置的，默认不设置时不允许跨域。

```http
Access-Control-Allow-Origin: <origin> | *
```

origin参数指定一个允许向该服务器提交请求的URI.对于一个不带有credentials（即cookie）的请求,可以指定为'*',表示允许来自所有域的请求。如果想要更安全点，当然也可以指定URI。

**例子**

```http
Access-Control-Allow-Origin: *
```

```http
Access-Control-Allow-Origin: http://foo.example
```

#### Access-Control-Allow-Credentials

此字段是用来设置是否允许传cookie，默认为false。

```http
Access-Control-Allow-Credentials: true | false
```

#### Access-Control-Allow-Methods 

默认值一般为`GET、HEAD、POST`，所以请delete等方法的时候，默认会被限制。

```http
Access-Control-Allow-Methods: <method>[, <method>]*
```

指明资源可以被请求的方式有哪些(一个或者多个)。这个响应头信息在客户端发出预检请求的时候会被返。这就看需要了。设置为`*`时，没有囊括全部方式，例如patch,所有还是设置为全部方式更保险。

例子：

```http
Access-Control-Allow-Methods: POST, GET, OPTIONS
```

```http
Access-Control-Allow-Methods: *
```

```http
Access-Control-Allow-Methods: GET
```

#### Access-Control-Allow-Headers

浏览器自身附带的**请求头**默认是被允许的，但是前端代码**追加的请求头**，在跨域的时候是要被允许才可访问。

而且浏览器本身默认自带`请求头`是不可修改的，如`User-Agent`、`Origin`等。

```http
Access-Control-Allow-Headers: <field-name>[, <field-name>]*
```

例子：

```http
Access-Control-Allow-Headers: Pragma,Cache-Control
```

```http
Access-Control-Allow-Headers: *
```

```http
Access-Control-Allow-Methods: Pragma
```

#### Access-Control-Max-Age

```http
Access-Control-Max-Age: <delta-seconds>
```

这个`响应头`告诉我们这次`预请求`的结果的有效期是多久，有效期期间内的请求都不用使用`预请求`。

## 跨域实践

请在谷歌访问和运行前端代码，IE域名相同端口不同是不存在跨域问题的。

### node express服务实例

```js
const express = require('express');
const app = express();

//begin----禁止客户端缓存的影响
app.disable('etag');
app.use(function(req, res, next) {
  //浏览器客户端和代理服务器都不可以缓存
  res.header('Cache-Control', 'no-store');
  //兼容http1.0
  res.header('Pragma', 'no-cache');
  next();
});
//end----禁止客户端缓存的影响

//all，默认不做请求类型限制，但是响应头可以限制。
app.all('/demo-normal', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.send('Hello World!');
});

app.all('/demo-allow-method', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  //追加允许delete请求方式，默认的get等还是允许的
  res.header('Access-Control-Allow-Methods', 'DELETE');
  res.send('Hello World!');
});

app.all('/demo-credentials-cannot-work', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  //这样设置是无效的，因为Access-Control-Allow-Origin为*时，设置允许使用
  //允许请求附带cookie，必须指定域名
  //同时前端默认跨域请求是不传cookie的，需要允许附带cookie请求头
  res.header('Access-Control-Allow-Credentials', 'true');
  res.send('Hello World!');
});
app.all('/demo-credentials-can-work', function(req, res) {
  //获取访问的域名，但是实际上不可以用这种通用的形式，需要指定授权域名。
  //允许请求附带cookie，必须指定域名
  //同时前端默认跨域请求是不传cookie的，需要允许附带cookie请求头
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.send('Hello World!');
});

app.all('/demo-max-age', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  //预请求有效期30秒
  res.header('Access-Control-Max-Age', 30);
  //delete请求会有预请求
  res.header('Access-Control-Allow-Methods', 'DELETE');
  if (req.method === 'OPTIONS') {
    //预请求不要运行代码，只是给浏览器返回响应响应头信息。
    //预请求应该返回204，NO-Content（无内容）
    res.status(204).send('');
    return;
  }
  res.send('Hello World!');
});

app.listen(3000, () => console.log('Demo listening on port 3000!'));
```
### 前端实例

首先要启动上面的node服务，运行下面的命令：

```sh
mkdir cors-node-server
cd cors-node-server
npm init #初始化npm项目
npm i express #安装express
touch index.js #新建文件，需要把上面的node express服务代码复制到index.js
node ./index.js
#然后服务就启动了
```

然后下面的代码可以直接复制到浏览器Console中运行，然后查看网络请求。不过涉及到cookie的，需要直访问html文件，才可以附带cookie。

**不要在当前的express中运行，否则当然不会有跨域问题。**

#### 请求一

```js
fetch('http://localhost:3000/demo-normal', {
  method: 'GET',
})
```
method为`GET、POST、HEAD`都访问正常，但是使用`DELETE、PUT、PATCH`等就会访问失败。而且`GET、POST、HEAD`是没有**预请求**的，但是`DELETE、PUT、PATCH`就是`预请求失败`，谷歌console返回下面这类信息：

```http
Failed to load http://localhost:3000/demo-normal: Method PUT is not allowed by Access-Control-Allow-Methods in preflight response.
```

#### 请求二

```js
fetch('http://localhost:3000/demo-allow-method', {
  method: 'DELETE'
})
```

访问method为`delete`是会有预请求，然后请求正常返回。其他的跟**请求一**的例子响应一致。

#### 请求三（附带cookie）

```js
fetch('http://localhost:3000/demo-credentials-cannot-work', {
  method: 'GET',
  credentials: 'include'
})
```

访问失败，返回错误如下：

```http
Failed to load http://localhost:3000/demo-credentials-cannot-work: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. Origin 'https://developer.mozilla.org' is therefore not allowed access.
```

意思就是`Access-Control-Allow-Credentials`设置为true时，`Access-Control-Allow-Origin`不能为`*`，需要指定具体访问的域名来源。

#### 请求四（附带cookie）

首先我们要在`localhost`当前域名下添加cookie。

```js
fetch('http://localhost:3000/demo-credentials-can-work', {
  method: 'GET',
  credentials: 'include'
})
```

正常访问，然后在请求头上，可以看到`Cookie`字段，当然前提是`localhost`这个域名有cookie。

```http
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Cookie: test=123
Host: localhost:3000
Origin: https://developer.mozilla.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

#### 请求五（预请求有效期）

```js
fetch('http://localhost:3000/demo-max-age', {
  method: 'DELETE'
})
```

首先第一次请求会有`预请求`，然后30秒有效期内再次请求`无预请求`。然后这个有效期会不断循环。

## 参考文章

- [浏览器的同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)
- [HTTP访问控制](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin)




