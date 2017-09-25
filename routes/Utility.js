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
    img : String,
    title : String,
    date : Date,
    abstract : String,
    url : String,
    text : String,
    _id : String,
    school: String
});
//模型
var News = mongoose.model('News', newsSchema);

//北京大学详细页
var c1ParseBody = function(url) {
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
        var pageNum = 1;
        for (var i = 1; i <= pageNum; i++) {
            pageUrls.push('http://www.oir.pku.edu.cn/index.php?g=portal&m=list&a=index&id=17&p=' + i);
        }
        pageUrls.forEach(function (pageUrl) {
            superagent.get(pageUrl)
                .end(async function (err, page) {
                    var $ = cheerio.load(page.text);
                    //console.log(page.text);
                    var quoteUrls = $('li.media');
                    for (var i = 0; i < quoteUrls.length; i++) {
                        //console.log(quoteUrls.eq(i).text());
                        var img = "http://www.oir.pku.edu.cn" + quoteUrls.eq(i).children("div").eq(0).children("span").children("img").attr("src");

                        var title = quoteUrls.eq(i).children("div").eq(1).children("h4").children("a").text();
                        var date = quoteUrls.eq(i).children("div").eq(1).children("ul").children("li").eq(0).text();
                        var abstract = quoteUrls.eq(i).children("div").eq(1).children("p").children("script").text();
                        var url = "http://www.oir.pku.edu.cn" + quoteUrls.eq(i).children("div").eq(1).children("h4").children("a").attr("href");

                        var md5 = crypto.createHash('md5');
                        var _id = md5.update(title + url).digest('base64');

                        var text = await c1ParseBody(url);

                        // console.log(img);
                        // console.log(_id);

                        let saveDate = new Date();
                        //console.log(date.substr(0,4)+date.substr(5,2)+date.substr(8,2));
                        saveDate.setFullYear(date.substr(0,4), date.substr(5,2), date.substr(8,2));

                        var news = new News({
                            img: img,
                            title: title,
                            date: saveDate,
                            abstract: abstract,
                            url: url,
                            text: text,
                            _id: _id,
                            school: "北京大学"
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

//清华大学详细页
var c2ParseBody = function(url) {
    return new Promise(function (resolve,reject) {
        superagent.get(url)
            .end(function(err,page){
                var $ = cheerio.load(page.text);
                var newsText = $('article.article');
                resolve(newsText.children('p').text());
            });
    })
};

//清华大学新闻主页
var c2 = async function(){
    try {
        //新闻页面URL及页数
        var pageUrls = [];
        var pageNum = 1;
        for (var i = 1; i <= pageNum; i++) {
            pageUrls.push('http://news.tsinghua.edu.cn/publish/thunews/9662/index'+ (i==1?'':'_'+i) +'.html');
        }
        pageUrls.forEach(function (pageUrl) {
            superagent.get(pageUrl)
                .end(async function (err, page) {
                    var $ = cheerio.load(page.text);
                    //console.log(page.text);
                    var quoteUrls = $('li.clearfix');
                    for (var i = 0; i < quoteUrls.length; i++) {
                        //console.log(quoteUrls.eq(i).text());
                        var img = "";

                        var title = quoteUrls.eq(i).children("div").eq(1).children("h3").children("a").text();
                        var dateScript = quoteUrls.eq(i).children("div").eq(0).children("font").html().toString();
                        var abstractScript = quoteUrls.eq(i).children("div").eq(1).children("p").eq(0).html().toString();
                        var url = "http://news.tsinghua.edu.cn" + quoteUrls.eq(i).children("div").eq(1).children("h3").children("a").attr("href");

                        var md5 = crypto.createHash('md5');
                        var _id = md5.update(title + url).digest('base64');

                        //var text = await c2ParseBody(url);

                        var myRe1 = /YM\("(\d{4})-(\d{2})-(\d{2})","/g;
                        var date = myRe1.exec(dateScript);

                        var myRe2 = /cutSummary\("(.*)",180/g;
                        var scriptRe = myRe2.exec(abstractScript);

                        var text = await c2ParseBody(url);

                        // console.log("title:"+title);
                        // console.log("dateScript:"+dateScript);
                        // console.log("abstractScript:"+abstractScript);
                        // console.log("url:"+url);
                        // console.log("date:"+date);
                        // console.log("scriptRe:"+date);
                        // console.log(scriptRe[1]);

                        let saveDate = new Date();
                        saveDate.setFullYear(date[1], date[2], date[3]);

                        let abstract = scriptRe[1];

                        var news = new News({
                            img: img,
                            title: title,
                            date: saveDate,
                            abstract: abstract,
                            url: url,
                            text: text,
                            _id: _id,
                            school: "清华大学"
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

let getNews =  function(callback){
    News.find(function (err, news) {
        if (err) return console.error(err);
        callback(news);
    })
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
module.exports.c2 = c2;
module.exports.getNews = getNews;