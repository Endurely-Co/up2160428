const express = require('express');
const router = express.Router();

router.get('/login', function(req, res, next) {
    res.send('Logged in!');
});

module.exports = router;
