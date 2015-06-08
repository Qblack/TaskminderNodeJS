/**
 * Created by Q on 6/7/2015.
 */
'use strict';

var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client) {
    client.query("CREATE TABLE  student ( id SERIAL PRIMARY KEY NOT NULL , name  VARCHAR(60) NOT NULL,    email  VARCHAR(255) UNIQUE NOT NULL,    username  VARCHAR(60) NOT NULL,    school  VARCHAR(255) NOT NULL,    program  VARCHAR(255) NOT NULL );");
    client.query("CREATE TABLE  task  (    id  SERIAL NOT NULL,    type  CHAR(15) NOT NULL,    weight  DECIMAL NULL DEFAULT NULL,    description  TEXT NULL DEFAULT NULL,    url  VARCHAR(255) NULL DEFAULT NULL,    complete boolean NOT NULL DEFAULT FALSE,    pages  VARCHAR(20) NULL DEFAULT NULL,    id_User  INTEGER NULL DEFAULT NULL,    id_Course  INTEGER NULL DEFAULT NULL,    due_date  DATE NULL DEFAULT NULL,    due_time  TIME NULL DEFAULT NULL,   PRIMARY KEY ( id ) );");
    client.query("CREATE TABLE  Course  (    id  SERIAL NOT NULL, code  VARCHAR(10) NOT NULL, name VARCHAR(255) NULL DEFAULT NULL, term  VARCHAR NULL DEFAULT NULL, professor VARCHAR(40) NULL DEFAULT NULL, section  VARCHAR(5) NULL DEFAULT NULL, description TEXT NULL DEFAULT NULL, PRIMARY KEY ( id ) );");
    client.query("CREATE TABLE  Enrolment  (    id  SERIAL NOT NULL, id_User INTEGER NULL DEFAULT NULL, id_Course  INTEGER NULL DEFAULT NULL, PRIMARY KEY ( id ) );");
    client.query("ALTER TABLE  Task  ADD FOREIGN KEY (id_User) REFERENCES  Student  ( id );");
    client.query("ALTER TABLE  Task  ADD FOREIGN KEY (id_Course) REFERENCES  Course  ( id );");
    client.query("ALTER TABLE  Enrolment  ADD FOREIGN KEY (id_User) REFERENCES  Student  ( id );");
    client.query("ALTER TABLE  Enrolment  ADD FOREIGN KEY (id_Course) REFERENCES  Course  ( id );");



});