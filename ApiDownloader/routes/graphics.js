var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('graphics.ejs', { title: 'Graphics' });
});
module.exports = router;
