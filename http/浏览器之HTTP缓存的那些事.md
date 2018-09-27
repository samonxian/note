# 浏览器之HTTP缓存的那些事

缓存是提升用户访问速度，节省带宽，减轻服务器压力的必经之道。

> 下面都是针对的Http 1.0来说明，HTTP缓存都是针对浏览器客户端，其他第三方客户端不考虑。

## 什么事浏览器缓存

简单来说，浏览器缓存就是把一个已经请求过的Web资源（如html，图片，js）拷贝一份副本储存在浏览器中。缓存会根据进来的请求保存输出内容的副本。当下一个请求来到的时候，如果是**相同的URL**，缓存会根据缓存机制决定是直接使用副本响应访问请求，还是向源服务器再次发送请求（当然还有304的情况）。

**缓存是根据url来处理的，只要url不一样就是新的资源。**

## 浏览器HTTP执行机制

浏览器对于请求资源, 拥有一系列成熟的缓存策略。

> 浏览器客户端都会对资源缓存一份，除非服务端返回不缓存的相关响应头或者浏览器客户端发送相关不缓存请求头。

### 缓存模式

浏览器缓存可以分为两种模式，`强缓存`和`协商缓存`。

- 强缓存（无HTTP请求，无需协商）

  直接读取本地缓存，无需跟服务端发送请求确认，http返回状态码是200（from memory cache或者from disk cache ，不同浏览器返回的信息不一致的）。

  对应的`Http header`有:

  - Cache-Control
  - Expires

- 协商缓存（有HTTP请求，需协商）

  浏览器虽然发现了本地有该资源的缓存，但是不确定是否是最新的，于是想服务器询问，若服务器认为浏览器的缓存版本还可用，那么便会返回304（Not Modified） http状态码。

  对应的`Http header`有:

  - Last-Modified
  - ETag

### 流程图

流程图只考虑了200和304的状态码，其他异常状态码不考虑。

![浏览器缓存流程](https://dog-days.github.io/demo/static/browser-cache-flow.svg)

## 缓存相关的Http Header

`Http Header`包括请求头和响应头，http1.1会向前兼用的，会兼容http1.0的`Http header`，浏览器还有web服务一般都会考虑进去。

| Http Header   | 描述                                          |
| ------------- | --------------------------------------------- |
| Cache-Control | 指定缓存机制，优先级最高                      |
| Pragma        | http1.0字段，已废弃，为了兼容一般使用no-cache |
| Expires       | http1.0字段,指定缓存的过期时间（为了兼容）    |
| Last-Modified | http1.0字段，资源最后一次的修改时间           |
| ETag          | 唯一标识请求资源的字符串，会覆盖Last-Modified |

### **Cache-Control**

浏览器缓存里, Cache-Control是金字塔顶尖的规则, 它藐视一切其他设置, 只要其他设置与其抵触, 一律覆盖之.

不仅如此, 它还是一个复合规则, 包含多种值，同时在请求头和响应头都可设置（基本都可以）。

下面列举了常用的`Cache-Control`用法。

| **Cache-Control** | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| **no-store**      | 请求和响应都不缓存                                           |
| **no-cache**      | 相当于`max-age:0`，即资源被缓存, <br />但是缓存立刻过期, 同时下次访问时强制验证资源有效性 |
| **max-age**       | 缓存资源, 但是在指定时间(单位为秒)后缓存过期                 |

### Expires

`http1.0`中存在的字段，该字段所定义的缓存时间是相对服务器上的时间而言的，如果客户端上的时间跟服务器上的时间不一致（特别是用户修改了自己电脑的系统时间），那缓存时间可能就没啥意义了。在HTTP 1.1版开始，使用`Cache-Control: max-age=秒`替代，这样就不存在不一致问题了。

### Last-Modified

`Last-Modified`和`If-Modified-Since`是一对的。

当浏览器第一次请求一个url时，服务器端的返回状态码为200，同时`HTTP响应头`会有一个Last-Modified标记着文件在服务器端最后被修改的时间。

浏览器第二次请求上次请求过的url时，浏览器会在`HTTP请求头`添加一个If-Modified-Since的标记，用来询问服务器该时间之后文件是否被修改过。

但是`Last-Modified`是http1.0的产物，有两个缺点：

- 只能精确到秒级别
- 内容完全没改变的资源文件，无法识别出来（只要修改时间变了，就算变动）。

所有就有了`ETag`。

### ETag

`ETag`解决了`Last-Modified`的缺点，http1.1的字段，优先级高于`Last-Modified`。

理论上是ETag优先于Last-Modified，但是Nginx一会把这两个一起开启一起验证，而且Nginx ETag的计算方式把最后修改时间也算进去了（所有这个算是弱ETag）。

> Nginx ETag计算方式：计算页面文件的最后修改时间，将文件最后修改时间的秒级Unix时间戳转为16进制作为etag的第一部分 计算页面文件的大小，将大小字节数转为16进制作为etag的第二部分。

ETag有两种类型：

- 强ETag

  强ETag值，不论实体发生多么细微的变化都会改变其值。

  强ETag表示形式：`"22FAA065-2664-4197-9C5E-C92EA03D0A16"`。

- 弱ETag

  弱 ETag 值只用于提示资源是否相同。只有资源发生了根本改变产 生差异时才会改变 ETag 。这时，会在字段值最开始处附加 `W/`。

  弱ETag表现形式：`W/"22FAA065-2664-4197-9C5E-C92EA03D0A16"`。

ETag和If-None-Match是一对:

当浏览器第一次请求一个url时，服务器端的返回状态码为200，同时HTTP响应头会有一个Etag，存放着服务器端生成的一个序列值。

浏览器第二次请求上次请求过的url时，浏览器会在HTTP请求头添加一个If-None-Match的标记，用来询问服务器该文件有没有被修改。

一般网站都会把`Last-Modified`和`ETag`一起用，同时对对比，两个条件都满足了才会返回304。

## Nginx实例

用实例来说明，Nginx的安装和使用请自行网上学习，例子的环境是在Mac系统运行的，然后在**谷歌浏览器**上访问（不同浏览器的表现会有点不一样的，而且浏览器还有快捷键直接刷新跳过缓存的）。

**注意：**nginx在没有设置`Cache-Control：max-age=xxx`和`expires`时，谷歌访问后，后面会变成200(from memory cache)，然后就造成了文件修改后无法更新的问题（不知道什么时候过期）。这个也很好解决，只要设置过期时间为0，这样就一定不是强缓存，就不存在这些问题。

下面的例子`Http Header`只需要关注上面提到的相关字段。

### ETag和Last-Modified例子

Nginx默认开启`ETag`和`Last-Modified`。

由于Nginx ETag可知，`ETag`比`Last-Modified`多了文件大小比较，理论上有ETag就可以不用`Last-Modified`，但是为了兼容http1.0，很多web服务器都会带上`Last-Modified`。

`Etag`关闭如下:

```nginx
etag off;
```

`Last-Modified`关闭如下（没有找到具体关闭方式，只好在响应头中直接赋值为空）：

```nginx
add_header 'Last-Modified' '' always;
```

这些配置，可以随便设置在不同层级，http、server、location都可以。

默认的Nginx是同时开启的，所以不用处理什么。

```nginx
server {
  listen       80;
  server_name  localhost;
  location / {
    #定义自己的web服务根目录
    root   /Users/Sam/www;
    #默认访问文件夹时，访问index.html或者index.htm文件
    index  index.html index.htm;
    location ~* \.(jpg|jpeg|gif|bmp|png|js|css){
      #nginx在没有设置Cache-Control：max-age=xxx和expires时，
      #谷歌访问后，后面会变成200(from memory cache)，
      #然后就造成了文件修改后无法更新的问题。
      #这个很好解决，只要设置过期时间为0，这样就一定不是强缓存，就不存在这些问题
    	expires 0s;
    }
  }
}
```

然后在根目录`index.html`中引入`./test.js`文件，然后访问`index.html`。

首次访问，返回200，然后再次访问才会返回304。然后无论如何修改，只要文件被保存（即使内容不变），再次访问浏览器返回200，然后再次访问返回304（内容没修改）。

**首次访问 Http Header**(先清理缓存，才算首次访问)

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 200 OK
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=0
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/javascript
Date: Thu, 27 Sep 2018 03:21:00 GMT
ETag: W/"5bab7b36-15"
Expires: Thu, 27 Sep 2018 03:21:00 GMT
Last-Modified: Wed, 26 Sep 2018 12:27:34 GMT
Server: nginx/1.10.1
Transfer-Encoding: chunked

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第二次访问 Http Header**（无修改）

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 304 Not Modified
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=0
Connection: keep-alive
Date: Thu, 27 Sep 2018 03:23:22 GMT
ETag: "5bab7b36-15"
Expires: Thu, 27 Sep 2018 03:23:22 GMT
Last-Modified: Wed, 26 Sep 2018 12:27:34 GMT
Server: nginx/1.10.1

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
If-Modified-Since: Wed, 26 Sep 2018 12:27:34 GMT
If-None-Match: W/"5bab7b36-15"
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第三次访问 Http Header**（有修改）

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 200 OK
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=0
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/javascript
Date: Thu, 27 Sep 2018 03:25:14 GMT
ETag: W/"5bac4d98-15"
Expires: Thu, 27 Sep 2018 03:25:14 GMT
Last-Modified: Thu, 27 Sep 2018 03:25:12 GMT
Server: nginx/1.10.1
Transfer-Encoding: chunked

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
If-Modified-Since: Wed, 26 Sep 2018 12:27:34 GMT
If-None-Match: W/"5bab7b36-15"
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第四次访问 Http Header**（无修改）

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 304 Not Modified
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=0
Connection: keep-alive
Date: Thu, 27 Sep 2018 03:26:46 GMT
ETag: "5bac4d98-15"
Expires: Thu, 27 Sep 2018 03:26:46 GMT
Last-Modified: Thu, 27 Sep 2018 03:25:12 GMT
Server: nginx/1.10.1

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
If-Modified-Since: Thu, 27 Sep 2018 03:25:12 GMT
If-None-Match: W/"5bac4d98-15"
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

### Cache-Control 和 Expires

```nginx
server {
  listen       80;
  server_name  localhost;
  location / {
    #定义自己的web服务根目录
    root   /Users/Sam/www;
    #默认访问文件夹时，访问index.html或者index.htm文件
    index  index.html index.htm;
    location ~* \.(jpg|jpeg|gif|bmp|png|js|css){
      #设置30秒缓存有效期
    	expires 30s;
    }
  }
}
```

然后在根目录`index.html`中引入`./test.js`文件，然后访问`index.html`。

首次访问，浏览器会返回200，然后再次访问才会返回200（from memory cache），然后30秒后过期访问，如果文件没修过过，会返回304，否则返回200，继续访问如果没过期期，返回200（from memory cache）。

具体请看上面的浏览器缓存流程图。

**首次访问 Http Header**（先清理缓存，才算首次）

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 200 OK
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=30
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/javascript
Date: Thu, 27 Sep 2018 03:28:03 GMT
ETag: W/"5bac4d98-15"
Expires: Thu, 27 Sep 2018 03:28:33 GMT
Last-Modified: Thu, 27 Sep 2018 03:25:12 GMT
Server: nginx/1.10.1
Transfer-Encoding: chunked

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第二次访问 Http Header**（不能过期，上面设置的是30秒，要在上次访问的30秒内再次访问）

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 200 OK (from memory cache)
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=30
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/javascript
Date: Thu, 27 Sep 2018 03:28:03 GMT
ETag: W/"5bac4d98-15"
Expires: Thu, 27 Sep 2018 03:28:33 GMT
Last-Modified: Thu, 27 Sep 2018 03:25:12 GMT
Server: nginx/1.10.1
Transfer-Encoding: chunked

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第三次访问 Http Header**（需要过期，上面设置的是30秒，上一次访问等待30秒后访问）

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 304 Not Modified
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=30
Connection: keep-alive
Date: Thu, 27 Sep 2018 03:32:44 GMT
ETag: "5bac4d98-15"
Expires: Thu, 27 Sep 2018 03:33:14 GMT
Last-Modified: Thu, 27 Sep 2018 03:25:12 GMT
Server: nginx/1.10.1

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
If-Modified-Since: Thu, 27 Sep 2018 03:25:12 GMT
If-None-Match: W/"5bac4d98-15"
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第四次访问 Http Header**（不能过期，上面设置的是30秒，要在上次访问的30秒内再次访问修改后的文件）

访问获取的还是旧文件，文件虽然修改了，但是浏览器直接缓存中获取，没发出请求，无法获取最新的内容。

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 200 OK (from memory cache)
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=30
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/javascript
Date: Thu, 27 Sep 2018 03:28:03 GMT
ETag: W/"5bac4d98-15"
Expires: Thu, 27 Sep 2018 03:28:33 GMT
Last-Modified: Thu, 27 Sep 2018 03:25:12 GMT
Server: nginx/1.10.1

#请求头
Transfer-Encoding: chunked
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

**第五次访问 Http Header**（需过期，在第四次访问后等待30秒访问修改后的文件）

访问后获取到了最新文件。

```sh
#通用的header
Request URL: http://localhost/test.js
Request Method: GET
Status Code: 200 OK
Remote Address: 127.0.0.1:80
Referrer Policy: no-referrer-when-downgrade

#响应头
Cache-Control: max-age=30
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/javascript
Date: Thu, 27 Sep 2018 03:36:51 GMT
ETag: W/"5bac4fcc-15"
Expires: Thu, 27 Sep 2018 03:37:21 GMT
Last-Modified: Thu, 27 Sep 2018 03:34:36 GMT
Server: nginx/1.10.1
Transfer-Encoding: chunked

#请求头
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Host: localhost
If-Modified-Since: Thu, 27 Sep 2018 03:25:12 GMT
If-None-Match: W/"5bac4d98-15"
Referer: http://localhost/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36
```

## 不需要缓存的场景

缓存是会提升访问速度、节省带宽、减轻服务器压力，但是也不能滥用，否则会出现一些意想不到的问题。图片、css、js等资源文件一般都是需要缓存的，但是像接口数据等数据会变动的http请求都是不需要缓存的，否则会造成无法访问到新数据的情况。

### 场景

- html文件不需要`强缓存`，`协商缓存`就行了。

  这些都是特殊情况，html文件可以返回304状态，但是不要返回200（from memory cache）。html文件最好设置过期时间为0，强制跟服务器做文件修改对比（当然具体场景具体分析）。

  因为js文件和css文件是可以使用版本做控制或者随机数。

- js代码版本迭代更新

  这个场景不是不需要缓存，而是更新了js代码版本，但是如果用户还在缓存期内，就会导致页面出错。

  这种情况就需要进行js类库版本控制，如：

  ```html
  <script src="../js/jquery.js?version=1.8.9"></script>
  ```

  升级到到2.0.0时，我们需要把代码改成

  ```html
  <script src="../js/jquery.js?version=2.0.0"></script>
  ```

  这样就不会访问到缓存的jquery.js。**缓存是根据url来处理的，只要url不一样就是新的资源。**

- 前后端使用ajax请求接口数据

### 解决方式

- Url添加随机数

  这种情况，是前端做处理。

- 请求头添加`Cache-Control: no-cache`

  为了兼容http1.0，而外添加`Pragma: no-cache`，Cache-Control的选项有很多，具体如何选择，看场景。

  前端或者服务端都可以处理。

## 一些说明

做一些补充说明。

### memory cache 和 disk cache

这个两个说明是谷歌浏览器的状态吗附加提示语，内存缓存和磁盘缓存。这两个其实完全可以理解为缓存，其实就是这个很简单理解，只要页面在网页上打开访问，然后不关闭，刷新的一定是`from memory cache`，而页面关闭在打开一定是`from disk cache`。这是浏览器自身的缓存手段，磁盘缓存一定会有一份备份的，同时如果页面访问的时候会在内存中缓存一份，这样刷新当前页面就不会读取硬盘，而是直接内存中获取（减少访问磁盘的次数）。

### 不同浏览器的一些表现差异

不同浏览器的缓存手段是一致的，但是文案展现形式，和刷新页面的方式会有差异（如火狐浏览器点击刷新按钮和回车刷新是不一样的）。

下面是针对已经**强缓存**，同时访问文件无修改的情况下，不同刷新方式返回的**状态码总结**（mac系统）：

| 浏览器 | 点击地址栏刷新按钮       | 回车刷新                 | cmd + r刷新              |
| ------ | ------------------------ | ------------------------ | ------------------------ |
| 谷歌   | 200（from memory cache） | 200（from memory cache） | 200（from memory cache） |
| 火狐   | 304                      | 200，其他地方说明已缓存  | 304                      |
| safari | 200，其他地方说明已缓存  | 200，其他地方说明已缓存  | 200，其他地方说明已缓存  |

这里只说明下可能会遇到的疑惑。浏览器软件自身的处理方式，跟http缓存挂不上钩，我们也无法处理。

## 参考文章

- [304和浏览器http缓存](https://www.cnblogs.com/ziqian9206/p/7123634.html)
- [浏览器缓存机制剖析](http://louiszhai.github.io/2017/04/07/http-cache/)