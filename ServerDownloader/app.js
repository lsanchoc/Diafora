// Importing variables
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var tree = require('./conectToMongo');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route settings
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Route that builds the taxonomy tree, given a tax and a name.
// Potentially needs a year to be added to the search.
app.post('/search', function(req, res) {
  //res.send('ab?cd');
  let tax = req.query.tax;
  let name = req.query.name;
  if(name !== undefined && tax !== undefined){
  	tree.buildTreeTax(tax,name,res);
   }

});


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

//app.listen(3500);

module.exports = app;
