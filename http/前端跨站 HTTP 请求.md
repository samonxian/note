# 前端跨站 HTTP 请求
本文总结于此文章[HTTP访问控制](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin)。主要总结下跨站XMLHttpRequest使用（基于fetch,不考虑兼容性i,fetch在IE下是不兼容跨域的,IE跨域不是基于XMLHttpRequest的），还有服务端[nginx配置](http://blog.csdn.net/oyzl68/article/details/18741057)。
## 定义
跨站 HTTP 请求(Cross-site HTTP request)是指发起请求的资源所在域不同于该请求所指向资源所在的域的 HTTP 请求
## 分类
总结为两种

- 静态资源
  包括CSS、图片、JavaScript 脚本以及其它类资源
- 跨源资源共享
  后面主要讲下。
## 跨源资源共享
正如大家所知，出于安全考虑，浏览器会限制脚本中发起的跨站请求。为了能开发出更强大、更丰富、更安全的Web应用程序，开发人员渴望着在不丢失安全的前提下，Web 应用技术能越来越强大、越来越丰富。

所以就有了Web 应用工作组( Web Applications Working Group )推荐了一种新的机制，即跨源资源共享（Cross-Origin Resource Sharing (CORS)）。

> 跨域并非浏览器限制了发起跨站请求，而是跨站请求可以正常发起，但是返回结果被浏览器拦截了。最好的例子是CSRF跨站攻击原理，请求是发送到了后端服务器无论是否跨域！注意：有些浏览器不允许从HTTPS的域跨域访问HTTP，比如Chrome和Firefox，这些浏览器在请求还未发出的时候就会拦截请求，这是一个特例。

接下来就讲诉前端`跨源共享`是怎么实现的。跨站XMLHttpRequest本人总结为以下两种情况

### 不传cookie
其实就是简单请求，

- 只使用 GET, HEAD 或者 POST 请求方法。如果使用 POST 向服务器端传送数据，则数据类型(Content-Type)只能是 application/x-www-form-urlencoded, multipart/form-data 或 text/plain中的一种。
- 不会使用自定义请求头（类似于 X-Modified 这种）。

#### 服务器端
不传cookie服务端的请求头需要设置如下信息

- Access-Control-Allow-Origin
  必须设置项，语法如下
```http
Access-Control-Allow-Origin: <origin> | *
```
origin参数指定一个允许向该服务器提交请求的URI.对于一个不带有credentials（即cookie）的请求,可以指定为'*',表示允许来自所有域的请求.如果想要更安全点，当然也可以指定URI，不过没多大必要。

- Access-Control-Allow-Methods 
  语法如下
```http
Access-Control-Allow-Methods: <method>[, <method>]*
```
指明资源可以被请求的方式有哪些(一个或者多个). 这个响应头信息在客户端发出预检请求的时候会被返。
这就看需要了。设置为*时，没有囊括全部方式，例如patch,所有还是设置为全部方式更保险。

- Access-Control-Allow-Credentials
  默认为false，在此种跨域情况下不做设置，也不可以设置为true,语法如下
```http
Access-Control-Allow-Credentials: true | false
```
- Access-Control-Allow-Headers
```http
Access-Control-Allow-Headers: X-PINGOTHER
```
需要设置好要允许的请求头类型，要不会报错。不可以设置为*。
**nginx设置实例**
```nginx
//最好加上always,保证返回*,应为反向代理在低版本的nginx会有些问题
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PATCH, DELETE, PUT' always;//设置为全部方式更保险
add_header 'Access-Control-Allow-Credentials' "false";//可以不设置，默认为false
add_header 'Access-Control-Allow-Headers' 'Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type' always;
```
#### 前端
**前端Fetch实例**
这里举个简单的例子，还有其他情况就不详说了。
```js
fetch('/users', {
    method: 'POST',
    //headers要跟服务端返回的一致
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Hubot',
        login: 'hubot',
    })
})
```
上传文件,不用设置header,header为空就行，fetch会自动处理好的。
```js
var input = document.querySelector('input[type="file"]')
var data = new FormData()
data.append('file', input.files[0])
data.append('user', 'hubot')
fetch('/avatars', {
    method: 'POST',
    body: data
})
```
其他方HTTP响应请求头都是可选的，不做介绍。
### 传cookie
但是当我们想要保持登陆状态的时候就要传输验证信息，cookie就必不可少了。这就涉及到安全性问题了。
而这种跨域方式，需要先`预请求`,才决定是否接受跨站请求。所有在浏览器网络中可以看到两条相同链接的请求，一个是预请求，一个是允许后的正常请求。
![](https://leanote.com/api/file/getImage?fileId=57480b54ab644141b101ed1a)
#### 预请求
不同于上面讨论的简单请求，“预请求”要求必须先发送一个 OPTIONS 请求给目的站点，来查明这个跨站请求对于目的站点是不是安全可接受的。这样做，是因为跨站请求可能会对目的站点的数据造成破坏。 当请求具备以下条件，就会被当成预请求处理：

- 请求以 GET, HEAD 或者 POST 以外的方法发起请求。或者，使用 POST，但请求数据为 application/x-www-form-urlencoded, multipart/form-data 或者 text/plain 以外的数据类型。比如说，用 POST 发送数据类型为 application/xml 或者 text/xml 的 XML 数据的请求。
- 使用自定义请求头（比如添加诸如 X-PINGOTHER）
#### 服务端
- Access-Control-Allow-Origin
  这里设置Origin不能设置为`*`,需要指定Origin,虽然Origin只能指定一个，而各种服务端的配置会有办法处理，可以动态设置Origin。
- Access-Control-Allow-Methods 
  跟之不传cookie的一样
- Access-Control-Allow-Credentials
  必须设置为true。
- Access-Control-Max-Age
  这个头告诉我们这次预请求的结果的有效期是多久,如下:
```http
Access-Control-Max-Age: <delta-seconds>//秒级
```
通过这个设置，预请求就会被缓存起来，第二期请求就不会有预请求了。这个设置当然挺有用了。
**nginx设置实例**
```nginx
if ( $http_origin ~* "http://(.*)" ) {//正则匹配，看着办
    add_header 'Access-Control-Allow-Origin' "$http_origin" always;//这句关键
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Max-Age' 86400 always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PATCH, DELETE, PUT' always;
    add_header 'Access-Control-Allow-Headers' 'Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type' always;
}
```
#### 前端
```js
fetch('https://example.com:1234/users', {
    credentials: 'include'
})
```
前端就要设置好credentials,其他的设置看情况，需要结合服务端设置。








