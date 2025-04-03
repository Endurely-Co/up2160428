const express = require('express');
const router = express.Router();

router.get('/new-race', (req, res) => {
    res.render('new_race', { title: 'New Race' });
});

module.exports = router;
