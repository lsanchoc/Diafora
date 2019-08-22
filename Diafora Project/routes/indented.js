var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('indented.ejs', { title: 'Indented Visualization' });
});
module.exports = router;
