/**
 * Created by Q on 6/14/2015.
 */
'use strict';


var express = require('express');
var db = require("../db");
var router = express.Router();

/* GET school listing. */
router.get('/', function(req, res, next) {
    db.query("SELECT * FROM school;",null,function(err, result){
        if (err) {
            console.error(err);
            res.send("Error " + err);
        } else {

            res.send(result.rows);
        }
    });
});

/* POST a new course. */
router.post('/', function(req, res, next) {
    var school = req.body;
    db.query('INSERT INTO school (name, short_form )' +
        'VALUES($1,$2) RETURNING id',
        [school.name, school.short_form], function(err, result) {
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send({id:result.rows[0].id});
            }
        });
});

module.exports = router;
