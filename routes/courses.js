/**
 * Created by Q on 6/14/2015.
 */
'use strict';

var express = require('express');
var db = require("../db");
var router = express.Router();

/* GET cource listing. */
router.get('/', function(req, res, next) {
    if(Object.keys(req.query).length>=1){
        var where_clause = [];
        var values = [];
        var index = 1;
        for(var key in req.query){
            where_clause.push(key+'=$'+index);
            values.push(req.query[key]);
            index+=1;
        }
        where_clause = where_clause.join(" and ");
        db.query('SELECT * FROM course WHERE '+where_clause,values, function(err, result) {
            if (err) {
                console.error(err);
                res.status(400);
                res.send(err);
            } else {
                res.send(result.rows);
            }
        });
    }else{
        db.query('SELECT * FROM course ',null, function(err, result) {
            if (err) {
                console.error(err);
                res.status(400);
                res.send(err);
            } else {
                res.send(result.rows);
            }
        });
    }
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
