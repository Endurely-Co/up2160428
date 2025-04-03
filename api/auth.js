const express = require('express');
const router = express.Router();
const db = require('../data/queries');

// router.get('/login', function(req, res, next) {
//     res.send('Logged in!');
// });

router.post('/login', async (req, res) => {
    try{
        let { email, name} = req.body;
        const result = await db.loginUser(email, name);
        result['redirectUrl'] = '/';
        res.status(200).send(result);
    }catch (error){
        console.log(error)
        res.status(500).send({ error: "Internal Server Error"  });
    }
});

router.post('/create_user', async (req, res) => {
    let { email, name, user_type } = req.body;
    res.status(201).json(db.createNewUser(email, name, user_type))
});

router.post('/check-login', async (req, res) => {
    res.status(200).json(db.checkLoggedIn());
})


module.exports = router;
