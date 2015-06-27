var express = require('express');
var db = require("../db");
var crypto = require('crypto')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    db.query('SELECT * FROM student', function(err, result) {
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
    var pwd_and_salt = {};

    db.pg.connect(db.conString, function(err, client, done){
        var query = client.query('SELECT password, salt, id FROM student WHERE email=$1',[email]);
        query.on('row', function(row, res) {
            pwd_and_salt = row;
        });
        query.on('end', function(result) {
            if(result.rowCount!=1){
                res.sendStatus(401);
                res.send("User does not exist");
            }else{
                var hashed_password = crypto.createHash('sha256').update(pwd_and_salt.salt+password).digest('base64');
                if(hashed_password==pwd_and_salt.password){
                    var session_id = crypto.randomBytes(20).toString('base64');
                    client.query('INSERT into session(user_id,session_id) values($1,$2)',[pwd_and_salt.id, session_id]);
                    res.send({id: pwd_and_salt.id, session:session_id});
                }else{
                    res.sendStatus(401);
                    res.send("Passwords did not match");
                }
            }
        });
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
    db.query('SELECT * FROM task WHERE id_user=$1',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result.rows);
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
