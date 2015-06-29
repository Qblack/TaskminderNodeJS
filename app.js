var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var http = require('http');
var crypto = require('crypto');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
//var config = require('./config'); // get our config file

var Routes = require('./routes/index');
var Users = require('./routes/users');
var Courses = require('./routes/courses');
var Schools = require('./routes/schools');
var db = require('./db');

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


var port = process.env.PORT || 1337; // used to create, sign, and verify tokens
var ip = process.env.IP || '192.168.0.18';

app.set('superSecret', process.env.secret); // secret variable
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));




var apiRoutes = express.Router();

function makeOptionHeaders() {
    var headers = {};
    // IE8 does not allow domains to be specified, just the *
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization";
    return headers;
}


apiRoutes.options('/authenticate',function(req, res){
    var headers = makeOptionHeaders();
    res.writeHead(200, headers);
    res.end();
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var user = {};
    db.pg.connect(db.conString, function(err, client, done){
        var query = client.query('SELECT * FROM student WHERE email=$1',[email]);
        query.on('row', function(row, res){
            user = row;
        });
        query.on('end', function(result){
            if(result.rowCount!=1){
                res.status(401);
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            }else {
                var hashed_password = crypto.createHash('sha256').update(user.salt + password).digest('base64');
                if (hashed_password == user.password) {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user, app.get('superSecret'), {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });
                    // return the information including token as JSON
                    client.query('INSERT into session(user_id,token) values($1,$2)', [user.id, token]);
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token,
                        id: user.id,
                        username : user.username
                    });
                } else {
                    res.status(401);
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                }
            }
        });
    });
});

apiRoutes.delete('/authenticate', function(req, res, next) {
    var session = req.query.token;
    var user_id = req.query.user_id;
    db.query("DELETE FROM session WHERE user_id=$1 AND token=$2",[user_id,session],function(err,result){
        console.log(result);
        res.send('success');
    });

});

//route middleware to verify a token
apiRoutes.use(function(req, res, next) {
    if(req.method=='OPTIONS'){
        var headers = makeOptionHeaders();
        res.writeHead(200, headers);
        res.end();
    }else{
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.body.session || req.query.session || req.headers['x-access-token'];
        if( req.headers['authorization']){
            //Parse out Bearer, because standards
            token =  req.headers['authorization'].split(' ')[1];
        }
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes

                    req.decoded = decoded;
                    next();
                }
            });
        } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    }
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);
app.use('/api/users', Users);
app.use('/api/courses',Courses);
app.use('/api/schools',Schools);

// error handlers

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
//if(app('dev')){
//    app.use(function(err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: {}
//        });
//    });
//}

app.listen(1337, ip);
console.log('Server running at http://'+ip+':'+port+'/api');


module.exports = app;


