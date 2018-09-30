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
