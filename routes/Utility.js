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
                resolve(newsText.find('p').text());
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
                    var quoteUrls = $('li.media');
                    for (var i = 0; i < quoteUrls.length; i++) {
                        //console.log(quoteUrls.eq(i).text());
                        var img = "http://www.oir.pku.edu.cn" + quoteUrls.eq(i).children("div").eq(0).children("span").children("img").attr("src");

                        var title = quoteUrls.eq(i).children("div").eq(1).children("h4").children("a").text();
                        var date = quoteUrls.eq(i).children("div").eq(1).children("ul").children("li").eq(0).text();
                        var abstract = quoteUrls.eq(i).children("div").eq(1).children("p").text();
                        var url = "http://www.oir.pku.edu.cn" + quoteUrls.eq(i).children("div").eq(1).children("h4").children("a").attr("href");

                        var md5 = crypto.createHash('md5');
                        var _id = md5.update(title + url).digest('base64');

                        var text = await c1ParseBody(url);

                        // console.log(img);
                        // console.log(_id);

                        let saveDate = new Date();
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
                resolve(newsText.find('p').text());
            });
    })
};

//清华大学新闻主页
var c2 = async function(){
    try {
        //新闻页面URL及页数
        var pageUrls = [];
        var pageNum = 3;
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

//浙江大学详细页
var c3ParseBody = function(url) {
    return new Promise(function (resolve,reject) {
        superagent.get(url)
            .end(function(err,page){
                var $ = cheerio.load(page.text);
                var newsText = $('div.wp_articlecontent');
                resolve(newsText.find('p').text());
            });
    })
};

//浙江大学新闻主页
var c3 = async function(){
    try {
        //新闻页面URL及页数
        var pageUrls = [];
        var pageNum = 1;
        for (var i = 1; i <= pageNum; i++) {
            pageUrls.push('http://www.zju.edu.cn/jl/list' + i + '.htm');
        }
        pageUrls.forEach(function (pageUrl) {
            superagent.get(pageUrl)
                .end(async function (err, page) {
                    var $ = cheerio.load(page.text);
                    //console.log(page.text);
                    var quoteUrls = $('ul.news');
                    for (var i = 0; i < quoteUrls.children().length; i++) {
                        let element = quoteUrls.children().eq(i);
                        var img = "";

                        var title = element.children("a").text();
                        var date = element.text();
                        var abstract = "";
                        var url = "http://www.zju.edu.cn" + element.children("a").attr("href");

                        var md5 = crypto.createHash('md5');
                        var _id = md5.update(title + url).digest('base64');

                        let saveDate = new Date();
                        saveDate.setFullYear(date.substr(date.length-11,4), date.substr(date.length-6,2), date.substr(date.length-3,2));

                        // console.log(date.substr(date.length-11,4));
                        // console.log(date.substr(date.length-6,2));
                        // console.log(date.substr(date.length-3,2));
                        //
                        // console.log("title:"+title);
                        // console.log("date:"+date);
                        // console.log("url:"+url);

                        var text = await c3ParseBody(url);

                        var news = new News({
                            img: img,
                            title: title,
                            date: saveDate,
                            abstract: abstract,
                            url: url,
                            text: text,
                            _id: _id,
                            school: "浙江大学"
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

//复旦大学详细页
var c4ParseBody = function(url) {
    return new Promise(function (resolve,reject) {
        superagent.get(url)
            .end(function(err,page){
                var $ = cheerio.load(page.text);
                var newsText = $('div.Article_Content');
                resolve(newsText.find('p').text());
            });
    })
};

//复旦大学新闻主页
var c4 = async function(){
    try {
        //新闻页面URL及页数
        var pageUrls = [];
        var pageNum = 1;
        for (var i = 1; i <= pageNum; i++) {
            pageUrls.push('http://www.fao.fudan.edu.cn/1691/list' + i + '.htm');
        }
        pageUrls.forEach(function (pageUrl) {
            superagent.get(pageUrl)
                .end(async function (err, page) {
                    var $ = cheerio.load(page.text);
                    //console.log(page.text);
                    var quoteUrls = $('#wp_news_w6');
                    for (var i = 0; i < quoteUrls.children("table").children("tbody").children().length; i++) {
                        let element = quoteUrls.children("table").children("tbody").children().eq(i).children("td").children("table").children("tbody").children("tr");
                        var img = "";

                        var title = element.children("td").eq(0).children("a").text();
                        var date = element.children("td").eq(1).text();
                        var abstract = "";
                        var url = "http://www.fao.fudan.edu.cn" + element.children("td").eq(0).children("a").attr("href");

                        var md5 = crypto.createHash('md5');
                        var _id = md5.update(title + url).digest('base64');

                        let saveDate = new Date();
                        saveDate.setFullYear(date.substr(0,4), date.substr(5,2), date.substr(8,2));


                        // console.log("title:"+title);
                        // console.log("date:"+date);
                        // console.log("url:"+url);

                        var text = await c4ParseBody(url);

                        var news = new News({
                            img: img,
                            title: title,
                            date: saveDate,
                            abstract: abstract,
                            url: url,
                            text: text,
                            _id: _id,
                            school: "复旦大学"
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

let getNewsWithFilter = function(keyword, school, callback){
    var filter = {};
    if (school != ""){
        filter.school = school;
    }
    if (keyword != ""){
        var re =new RegExp(keyword,"i");
        filter.text = re;
    }
    console.log(filter);
    News.find(filter, function (err, news) {
        if (err) return console.error(err);
        callback(news);
    }).sort({'date':'desc'});
};

let getNews =  function(callback){
    News.find(function (err, news) {
        if (err) return console.error(err);
        callback(news);
    }).sort({'date':'desc'});
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

//每日更新
let schedule = require("node-schedule");
var rule1 = new schedule.RecurrenceRule();
rule1.hour = 1;
var r1 = schedule.scheduleJob(rule1, function(){
    c1();
    c2();
    c3();
    c4();
    console.log("update");
});


module.exports.f1 = f1;
module.exports.c1 = c1;
module.exports.c2 = c2;
module.exports.c3 = c3;
module.exports.c4 = c4;
module.exports.getNews = getNews;
module.exports.getNewsWithFilter = getNewsWithFilter;