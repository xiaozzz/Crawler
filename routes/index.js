var express = require('express');
var router = express.Router();

var utility = require('./Utility');


/* GET home page. */
router.get('/', function(req, res, next) {
    utility.c1();
    res.render('index', { title: 'Express' });
});

module.exports = router;
