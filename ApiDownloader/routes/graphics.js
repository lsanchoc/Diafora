var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('graphics2.ejs', { title: 'Graphics' });
});
module.exports = router;
