import express from 'express';
const router = express.Router();

router.get('/new-race', (req, res) => {
    res.render('new_race', { title: 'New Race' });
});


router.get('/dashboard', (req, res) => {
    res.render('race_dashboard', { title: 'Dashboard' });
});

router.get('/timer', (req, res) => {
    res.render('timer', { title: 'Race Timer' });
});

export default router;
