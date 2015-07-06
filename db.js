/**
 * Created by Q on 6/7/2015.
 */
'use strict';

var pg = require('pg');
var escape = require('pg-escape');
var types = require('pg').types;
var timestampOID = 1114;
types.setTypeParser(1114, function(stringValue) {
    return  new Date(Date.parse(stringValue + "+0000"));
});
config = {};

try {
    require.resolve("./config");
    config = require('./config'); // get our config file
} catch(e) {
    console.error("config is not found");
}

var conString = process.env.DATABASE_URL || config.conString;

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
    },
    pg:pg,

    isAuthorized : function (req){
        var authorized =  true;
        if(req.params.id){
            if(req.params.id!=req.decoded.id){
                authorized = false;
            }
        }return authorized;
    }


};