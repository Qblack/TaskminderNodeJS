/**
 * Created by Q on 6/7/2015.
 */
'use strict';

var pg = require('pg');
var escape = require('pg-escape');
var config = require('./config');
var conString = config.conString;

module.exports = {
    query: function(text, values, cb) {
        pg.connect(conString, function(err, client, done) {
            client.query(text, values, function(err, result) {
                done();
                cb(err, result);
            });
        });
    },
    conString : conString,
    trimIfNotNull : function(string){
        if(string!=null){
            string = string.trim();
            string = escape.string(string);
        }return string;
    }


};