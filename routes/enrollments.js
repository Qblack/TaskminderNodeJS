/**
 * Created by Q on 7/5/2015.
 */
'use strict';

var express = require('express');
var db = require("../db");
var router = express.Router();

/* GET enrollment listing. */
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
        db.query('SELECT * FROM enrollment WHERE '+where_clause,values, function(err, result) {
            if (err) {
                console.error(err);
                res.status(400);
                res.send({success:false, message: err});
            } else {
                res.send(result.rows);
            }
        });
    }else{
        db.query('SELECT * FROM enrollment ',null, function(err, result) {
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

router.post('/', function(req, res, next) {
    var enrollment = req.body;
    db.query('INSERT INTO enrollment (id_user, id_course )' +
        'VALUES($1,$2) RETURNING id',
        [enrollment.id_user, enrollment.id_course], function(err, result) {
            if (err) {
                console.error(err);
                res.status(400);
                res.send({success:false, message: err});
            } else {
                res.send({success:true, message: result.rows[0].id});
            }
        });
});

module.exports = router;
