/**
 * Created by Q on 6/7/2015.
 */
'use strict';

var pg = require('pg');

var client = new pg.Client({
    user:'gcleutjifmkgrw',
    password : 'D63xp6RFjXmGamLbiLiehyIXQ4',
    database : 'dcp5bvd5kbc84u',
    port: 5432,
    host: 'ec2-54-83-25-238.compute-1.amazonaws.com',
    ssl: true
});

module.exports = {
    getConnection : function(){
        return client;
    }
};