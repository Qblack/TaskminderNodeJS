var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Here all all the users');
});

router.post('/', function(req, res, next) {
    res.send('Creating a user');
});


router.get('/:id', function(req, res, next) {
  res.send('Here is user '+req.params.id);
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
