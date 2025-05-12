import express from 'express';
const router = express.Router();

router.get('/new-race', (req, res) => {
    res.render('new_race', { title: 'New Race' });
});


router.get('/dashboard', (req, res) => {
    res.render('race_dashboard', { title: 'Dashboard' });
});

router.get('/timer', (req, res) => {
    res.render('timer', { title: 'Race time' });
});

router.get('/race-board', (req, res) => {
    res.render('race_board', { title: 'Race Board' });
});

router.get('/record-race', (req, res) => {
    res.render('race_recorder', { title: 'Race Board' });
});

router.get('/race-records', (req, res) => {
    res.render('race_records', { title: 'Race Records' });
});

export default router;
