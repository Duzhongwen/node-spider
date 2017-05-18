var cheerio = require('cheerio');
var superagent = require('superagent');
var request = require('request');
var fs = require('fs');

function Artical() {

}
    
Artical.prototype.getContent = function(wechatUrl, req, res, next){
    
  request(wechatUrl, 
    function (err, response, sres) {
        if (err) {
            return next(err);
        }

        var $ = cheerio.load(sres);

        var main = $('#js_article');

        var imgPathArr = main.find('img');

        var back_arr = [];
        // 提取页面中的图片并对图片url进行处理
        imgPathArr.each(function () {
            var imgPath = $(this).attr('data-src');
            imgtype = $(this).attr('data-type');
            if (imgPath && imgtype) {
                var back_img1 = imgPath.split('?');
                var back_img2 = back_img1[0].toString().split('/');
                var len2 = back_img2.length;
                back_img2[len2-1] = '640';
                var back_img3 = back_img2.join('/') + '?' + back_img1[1].toString().split('=').join('.') + '&tp=webp&wxfrom=5&wx_lazy=1';
                back_arr.push(back_img3);
            }
        });

        var title = $('#activity-name').text().replace(/\s+/g, "");
        var author = $('#post-user').text();

        var article = [];
        var count = 0;
        var isort = 0; //用来表示back_arr 的索引
        var index = 0; // 图片index的索引
        var summary = [];
        var my_span_arr = [];
        // 解析文章获取详细内容
        $('#img-content').find('p').each(function () {
            var my_span = $(this);
            if((my_span.text() && my_span.text().length > 0)&&(my_span.text() !== " ")){
                summary.push(my_span.text().replace(/\s+/g, ""));
            }
            // 匹配文章中的图片
            if (my_span.children('img').length) {

                my_span_arr.push({
                    'data':back_arr[isort],
                    'type':0,
                    'index':index
                });

                //保存获取到的图片与原始说明
                my_span_arr.push({
                    'data':summary[index],
                    'type':1,
                    'index':index+1
                });
    
                
                // 前端需要展示的图片与说明
                var obj = {
                    'description':summary[index] || "",
                    'src':back_arr[isort],
                    'index':index
                };
                article.push(obj);
                isort++;
                index +=2;
            }
            count++;
        });

        summary.splice(0,1);        //删除第一行标题

        var myArticle = {
            title: title,
            summary: summary[1],
            author: author,
            article: my_span_arr
        };
        // 将获取到的原始数据存储到全局变量
        global.articleData = myArticle;

        var data = {
            title: title,
            summary: summary[1],
            author: author,
            article: article
        }
        // 渲染前端页面
        res.render('content.ejs', {
            data: data
        });
    })
}

// 写入json文件到files目录
Artical.prototype.writeFile = function(newArtical,req, res){
    var date = new Date();
    Date.prototype.Format = function (fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    var dataStr = date.Format('yyyy-MM-dd-hh-mm-ss');
    
    new Promise(function(res, rej) {
        // 创建json文件（修改过后的数据）
        return fs.writeFile('./files/new' + dataStr + '.json', JSON.stringify(newArtical), function (err) {
            if (err) {
                console.log(err);
                throw new Error('悲剧了，写入json1失败');
            }
            return res('success');
        });
    })
    .then(function(result) {
        var article = global.articleData;
         // 创建json文件（原始数据）
        return fs.writeFile('./files/' + dataStr + '.json', JSON.stringify(article), function (err) {
            if (err) {
                console.log(err);
                throw new Error('悲剧了，写入json2失败');
            }
            return res.send({
                code: 200,
                msg: "生成json成功",
            })
        });
    })
    .catch(function(err){
        console.log('dshgafjshafjkdsah');
        res.status({
            code: 500,
            msg: "生成json出错"
        })
    })
   
    
}
module.exports = new Artical();