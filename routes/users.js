var express = require('express');
var db = require("../db");
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var client = db.getConnection();
    client.connect();
    client.query('SELECT * FROM student', function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result.rows);
        }
    });
});

router.post('/', function(req, res, next) {
    var client = db.getConnection();
    client.connect();
    client.query('INSERT INTO student(name, email,username,school,program),' +
        'values($1,$2,$3,$4,$5),',
        ['teemo','teemo@gmail.com','Captain','WLU','BBA'], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result);
        }
    });
});


router.get('/:id', function(req, res, next) {
    var client = db.getConnection();
    client.connect();
    client.query('SELECT * FROM student WHERE id=($!)',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result);
        }
    });
});

router.put('/:id', function(req, res, next) {
    res.send('Updating user '+req.params.id);
});


router.delete('/:id', function(req, res, next) {
    res.send('Deleting user '+req.params.id);
});

router.get('/:id/tasks', function(req, res, next) {
    res.send('Here are user '+req.params.id+' tasks');
});

router.post('/:id/tasks', function(req, res, next) {
    res.send('Adding a task to user '+req.params.id+' tasks');
});

router.get('/:id/tasks/:taskId', function(req, res, next) {
    res.send('Here is user '+req.params.id+' task: '+req.params.taskId);
});

router.put('/:id/tasks/:taskId', function(req, res, next) {
    res.send('Updating user '+req.params.id+' task: '+req.params.taskId);
});

router.delete('/:id/tasks/:taskId', function(req, res, next) {
    res.send('Deleting user '+req.params.id+' task: '+req.params.taskId);
});

module.exports = router;
