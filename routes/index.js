var express = require('express');
var router = express.Router();

var utility = require('./Utility');


/* GET home page. */
router.get('/', function(req, res, next) {
    // utility.getNews(function(result){
    //     res.render('main', { title: '新闻列表', news: result });
    // });
    utility.getNewsWithFilter("","",function(result){
        let page = parseInt(req.query.page);
        if (isNaN(page))
            page = 0;
        if (page < 0)
            page = 0;
        let number = 10;
        var totalPage = Math.ceil(result.length / number);
        if (page > Math.floor(result.length / number))
            page = Math.floor(result.length / number);
        var news = result.slice(page * number, (page + 1) * number);
        res.render('main', { title: '新闻列表', news: news, page: page, totalPage: totalPage});
    });
});

router.get('/refresh', function(req, res, next) {
    utility.c1();
    utility.c2();
    utility.c3();
    utility.c4();
    res.redirect('/')
});

module.exports = router;
