var express = require('express');
var router = express.Router();

var utility = require('./Utility');


/* GET home page. */
router.get('/', function(req, res, next) {
    utility.getNews(function(result){
        res.render('main', { title: '新闻列表', news: result });
    });
});

router.get('/refresh', function(req, res, next) {
    // utility.c1();
    utility.c2();
    res.render('index', { title: 'Express' });
});

module.exports = router;
