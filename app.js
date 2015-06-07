var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var pg = require('pg');

var routes = require('./routes/index');
var users = require('./routes/users');



var app = express();
var conString  = 'postgres://gcleutjifmkgrw:D63xp6RFjXmGamLbiLiehyIXQ4@ec2-54-83-25-238.compute-1.amazonaws.com:5432/dcp5bvd5kbc84u';



if (process.env.MODE=='production'){
    app.set('env','production');
    conString  = process.env.DATABASE_URL;
}




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.get('/db', function (request, response) {
    pg.connect(conString , function(err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM test_table', function(err, result) {
            done();
            if (err)
            { console.error(err); response.send("Error " + err); }
            else
            { response.send(result.rows); }
        });
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace


if (app.get('env') === 'development') {
    app.listen(1337, '127.0.0.1');
    console.log('Server running at http://127.0.0.1:1337/');
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });

}else{
    app.set('port', (process.env.PORT || 5000));
    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}



module.exports = app;

