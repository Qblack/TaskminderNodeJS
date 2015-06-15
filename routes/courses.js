/**
 * Created by Q on 6/14/2015.
 */
'use strict';

var express = require('express');
var db = require("../db");
var router = express.Router();

/* GET cource listing. */
router.get('/', function(req, res, next) {
    db.query('SELECT * FROM Course',null, function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result.rows);
        }
    });
});

router.get('/:id', function(req, res, next) {
    db.query('SELECT * FROM Course WHERE id=$1',[req.params.id], function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result.rows[0]);
        }
    });
});

router.delete('/:id', function(req, res, next) {
    db.query('DELETE Course WHERE id=$1',[req.params.id],function(err, result) {
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {
            res.send(result);
        }
    });
});

/* POST a new course. */
router.post('/', function(req, res, next) {
    var course = req.body;
    console.log(course);
    db.query('INSERT INTO course (code, name, term,' +
        'website, professor, section, description )' +
        'VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [course.code, course.name, course.term,
            course.website, course.professor,course.section,
            course.description], function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send({id:result.rows[0].id});
            }
        });
});

module.exports = router;
