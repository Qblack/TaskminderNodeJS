var express = require('express');
var db = require("../db");
var crypto = require('crypto');
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



router.get('/:id', function(req, res, next) {
    db.query('SELECT * FROM student WHERE id=$1',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            user = result.rows[0];
            delete user['salt'];
            delete user['password'];
            res.send(user);
        }
    });
});



router.put('/:id', function(req, res, next) {
    if(db.isAuthorized(req)) {
        db.query('UPDATE student(name, email,username,school,program),' +
            'values($1,$2,$3,$4,$5) WHERE id=$6',
            [user.name, user.email, user.username, user.school, user.program, req.params.id], function (err, result) {
                if (err) {
                    console.error(err);
                    res.send("Error " + err);
                } else {
                    res.send({id: result.rows[0].id});
                }
            });
    }else{
        res.send(403);
    }
});


router.delete('/:id', function(req, res, next) {
    if(db.isAuthorized(req)) {
        db.query('DELETE student WHERE id=$1', [req.params.id], function (err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send(result);
            }
        });
    }else{
        res.send(403);
    }
});



router.get('/:id/tasks', function(req, res, next) {
    if(db.isAuthorized(req)){
        db.query('SELECT * FROM task WHERE id_user=$1',[req.params.id], function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                if(result.rowCount==0){
                    res.send([]);
                }else{
                    console.log(result.rows);
                    res.send(result.rows);
                }
            }
        });
    }else{
        res.send(403);
    }
});

router.get('/:id/enrollments', function(req, res, next) {
    if(db.isAuthorized(req)){
        db.query('SELECT course.* FROM course LEFT JOIN enrollment ON course.id=enrollment.id_course WHERE enrollment.id_user=$1',[req.params.id], function(err, result) {
            if (err) {
                console.error(err);
                res.send(500);
                res.send(err);
            } else {
                if(result.rowCount==0){
                    res.send([]);
                }else{
                    res.send(result.rows);
                }
            }
        });
    }else{
        res.send(403);
    }
});


router.post('/:id/tasks', function(req, res, next) {
    if(db.isAuthorized(req)) {
        var task = req.body;
        var userId = req.params.id;
        if(isNaN(task.weight)){
            res.status(400);
            res.send({success:false, message:"Weight needs to be a float."});
        }else{
            console.log(task.weight);
            if(task.weight==''){task.weight=0;}

            db.query('INSERT INTO task (' +
                'type, weight, description,' +
                'url, complete, pages, ' +
                'id_user, id_course, due_date, ' +
                'due_time, in_class, location, title )' +
                'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id',
                [task.type, task.weight, task.description,
                    task.url, task.complete, task.pages,
                    userId, task.course_id, task.due_date,
                    task.due_time, task.in_class, task.location, task.title], function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.send({success:false, message:err});
                    } else {
                        res.send({id: result.rows[0].id});
                    }
                });
        }
    }else{
        res.send(403);
    }
});

router.get('/:id/tasks/:taskId', function(req, res, next) {
    if(db.isAuthorized(req)) {
        db.query('SELECT * FROM task WHERE id_user=$1 AND id=$2', [req.params.id, req.params.taskId],
            function (err, result) {
                if (err) {
                    console.error(err);
                    res.send("Error " + err);
                } else {
                    res.send(result.rows);
                }
            });
    }else{
        res.send(403);
    }
});

router.put('/:id/tasks/:taskId', function(req, res, next) {
    if(db.isAuthorized(req)) {
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
            req.params.id];
        db.query("UPDATE task SET type=$1, weight=$2, description=$3, url=$4, complete=$5, pages=$6," +
            "id_course=$7, due_date=$8, due_time=$9, in_class=$10, location=$11, title=$12" +
            " WHERE id=$13 and id_user=$14;",
            values, function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.send({error: "Error " + err});
                } else {
                    res.send(result);
                }
            });
    }else{
        res.send(403);
    }
});

router.delete('/:id/tasks/:taskId', function(req, res, next) {
    if(db.isAuthorized(req)) {
        db.query('DELETE task WHERE id_user=$1 AND id=$2', [req.params.id, req.params.taskId],
            function (err, result) {
                if (err) {
                    console.error(err);
                    res.send("Error " + err);
                } else {
                    res.send(result.rows);
                }
            });
    }else{
        res.send(403)
    }
});

module.exports = router;
