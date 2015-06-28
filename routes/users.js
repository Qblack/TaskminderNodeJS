var express = require('express');
var db = require("../db");
var crypto = require('crypto');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var router = express.Router();

/* GET Users listing. */
router.get('/', function(req, res, next) {
    db.query('SELECT * FROM student', null, function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result.rows);
        }
    });
});

router.post('/', function(req, res, next) {
    var user = req.body;
    console.log(user);
    var password = user.password;
    var salt = crypto.randomBytes(128).toString('base64');
    var hashed_password = crypto.createHash('sha256').update(salt+password).digest('base64');
    db.query('INSERT INTO student(name, email,username,school,program, password, salt) ' +
        'values($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [user.name, user.login, user.username, user.school, user.program, hashed_password, salt], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            console.log(result);
            res.send({id:result.rows[0].id});
        }
    });
});


router.get('/:id', function(req, res, next) {
    db.query('SELECT * FROM student WHERE id=$1',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result);
        }
    });
});

router.post('/login', function(req, res, next){
    var user = req.body;
    var email = user.email;
    var password = user.password;
    var user_result = {};

    db.pg.connect(db.conString, function(err, client, done){
        var query = client.query('SELECT password, salt, id, username FROM student WHERE email=$1',[email]);
        query.on('row', function(row, res) {
            user_result = row;
        });
        query.on('end', function(result) {
            if(result.rowCount!=1){
                res.status(401);
                res.send("User does not exist");
            }else{
                var hashed_password = crypto.createHash('sha256').update(user_result.salt+password).digest('base64');
                if(hashed_password==user_result.password){
                    var session_id = crypto.randomBytes(20).toString('base64');
                    client.query('INSERT into session(user_id,session_id) values($1,$2)',[user_result.id, session_id]);
                    res.send({id: user_result.id, session:session_id,username:user_result.username});
                }else{
                    res.status(401);
                    res.send("Passwords did not match");
                }
            }
        });
    });
});

router.delete('/login', function(req, res, next) {
    var session = req.query.session;
    var user_id = req.query.user_id;
    console.log(session);
    db.query("DELETE FROM session WHERE user_id=$1 AND session_id=$2",[user_id,session],function(err,result){
        console.log(result);
        res.send('success');
    });

});


router.put('/:id', function(req, res, next) {
    db.query('UPDATE student(name, email,username,school,program),' +
        'values($1,$2,$3,$4,$5) WHERE id=$6',
        [user.name, user.email, user.username, user.school, user.program,req.params.id], function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send({id:result.rows[0].id});
            }
        });
});


router.delete('/:id', function(req, res, next) {
    db.query('DELETE student WHERE id=$1',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result);
        }
    });
});

router.get('/:id/tasks', function(req, res, next) {
    console.log(req.params);

    db.query('SELECT * FROM task WHERE id_user=$1',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            if(result.rowCount==0){
                res.send([]);
            }else{
                res.send(result.rows);
            }
        }
    });

});

router.post('/:id/tasks', function(req, res, next) {
    var task = req.body;
    var userId = req.params.id;
    db.query('INSERT INTO task (' +
        'type, weight, description,' +
        'url, complete, pages, ' +
        'id_user, id_course, due_date, ' +
        'due_time, in_class, location, title )' +
        'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id',
        [task.type, task.weight, task.description,
            task.url, task.complete, task.pages,
            userId, task.course_id, task.due_date,
            task.due_time, task.in_class, task.location, task.title], function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send({id:result.rows[0].id});
            }
        });
});

router.get('/:id/tasks/:taskId', function(req, res, next) {
    db.query('SELECT * FROM task WHERE id_user=$1 AND id=$2',[req.params.id,req.params.taskId],
        function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send(result.rows);
            }
    });});

router.put('/:id/tasks/:taskId', function(req, res, next) {
    var task = req.body;
    var values = [db.trimIfNotNull(task.type),
        task.weight,
        db.trimIfNotNull(task.description),
        db.trimIfNotNull(task.url),
        task.complete,
        db.trimIfNotNull(task.pages),
        task.id_course,
        task.due_date,
        task.due_time,
        task.in_class,
        db.trimIfNotNull(task.location),
        db.trimIfNotNull(task.title),
        req.params.taskId,
        req.params.id ];
    console.log(values);

    db.query("UPDATE task SET type=$1, weight=$2, description=$3, url=$4, complete=$5, pages=$6," +
        "id_course=$7, due_date=$8, due_time=$9, in_class=$10, location=$11, title=$12" +
        " WHERE id=$13 and id_user=$14;",
        values, function(err, result) {
            if (err) {
                console.error(err);
                res.status(500);
                res.send({error:"Error " + err});
            } else {
                res.send(result);
            }
        });
});

router.delete('/:id/tasks/:taskId', function(req, res, next) {
    db.query('DELETE task WHERE id_user=$1 AND id=$2',[req.params.id,req.params.taskId],
        function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send(result.rows);
            }
        });
});

module.exports = router;
