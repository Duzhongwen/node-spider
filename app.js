
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var artical = require('./model/artical');

var app = express();

app.use("/static", express.static('public')); // 设置目录
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));// 设置存放模板文件的目录
app.set('view engine', 'ejs');// 设置模板引擎为 ejs

// 主页
app.get('/', function (req, res, next) {
  // 是否收索文章 
  if (req.query.ajax === '1') {
    var wechatUrl = req.query.wechatUrl;
    artical.getContent(wechatUrl, req, res, next);
  } else {
    var data = {
      title: "",
      summary: "",
      author: "",
      article: []
    };
    res.render('index.ejs', {data: data});
  }
});


// 保存controller
app.post('/submit', function(req, res){

  // 生成JSON文件
  var bodyData = req.body;
  artical.writeFile(bodyData, req, res);
});

// 创建服务，监听3000端口
app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
