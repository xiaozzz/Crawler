var http = require('http'),
    superagent = require('superagent'),
    cheerio = require('cheerio'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    mongourl = 'mongodb://root:philip@zzzkky.cn:27017/crawler';

mongoose.connect(mongourl);
var Schema = mongoose.Schema;
//骨架模版
var newsSchema = new Schema({
    title : String,
    date : String,
    abstract : String,
    url : String,
    text : String,
    _id : String
});
//模型
var News = mongoose.model('News', newsSchema);

//北京大学详细页
var parseBody = function(url) {
    return new Promise(function (resolve,reject) {
        superagent.get(url)
            .end(function(err,page){
                var $ = cheerio.load(page.text);
                var newsText = $('div.nr-news-text');
                resolve(newsText.children('p').text());
            });
    })
};

//北京大学新闻主页
var c1 = async function(){
    try {
        //新闻页面URL及页数
        var pageUrls = [];
        var pageNum = 2;
        for (var i = 1; i <= pageNum; i++) {
            pageUrls.push('http://www.oir.pku.edu.cn/index.php?g=portal&m=list&a=index&id=17&p=' + i);
        }
        pageUrls.forEach(function (pageUrl) {
            superagent.get(pageUrl)
                .end(async function (err, page) {
                    var $ = cheerio.load(page.text);
                    //console.log(page.text);
                    var quoteUrls = $('div.media-body');
                    for (var i = 0; i < quoteUrls.length; i++) {
                        //console.log(quoteUrls.eq(i).text());
                        var title = quoteUrls.eq(i).children("h4").children("a").text();
                        var date = quoteUrls.eq(i).children("ul").children("li").eq(0).text();
                        var abstract = quoteUrls.eq(i).children("p").text();
                        var url = "http://www.oir.pku.edu.cn" + quoteUrls.eq(i).children("h4").children("a").attr("href");

                        var md5 = crypto.createHash('md5');
                        var _id = md5.update(title + date + abstract + url).digest('base64');

                        var text = await parseBody(url);

                        // console.log(text);
                        // console.log(quoteUrls.eq(i).children("h4").children("a").text());
                        // console.log(quoteUrls.eq(i).children("ul").children("li").eq(0).text());
                        // console.log(quoteUrls.eq(i).children("p").text());
                        // console.log("http://www.oir.pku.edu.cn" + quoteUrls.eq(i).children("h4").children("a").attr("href"));
                        // console.log(_id);

                        var news = new News({
                            title: title,
                            date: date,
                            abstract: abstract,
                            url: url,
                            text: text,
                            _id: _id
                        });
                        news.save(function (err) {
                            if (err) {
                                console.log('保存失败');
                                return;
                            }
                            console.log('保存成功');
                        })
                    }
                })
        })
    } catch (err){
        console.log(err);
    }
};


var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

var f1 = async function(){
    try{
        for (var i = 1; i <= 10; i++) {
            console.log('123');
            await sleep(1000);
        }
    }
    catch (err){
        console.log(err);
    }
};


module.exports.f1 = f1;
module.exports.c1 = c1;