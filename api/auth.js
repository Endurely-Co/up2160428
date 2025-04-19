import express from 'express';
const router = express.Router();
import db from '../data/queries.js';
import cache from "../data/cache.js";
import database from "../data/model.js";

// router.get('/login', function(req, res, next) {
//     res.send('Logged in!');
// });

router.get('/users', async (req, res) => {
    return res.status(200).json(await db.getAllUsers())
});

router.post('/login', async (req, res) => {
    try{
        let { email, name} = req.body; // remove name from login
        const result = await db.changeUserStatus(email);
        result['redirectUrl'] = '/';
        cache.setUserType(result.user_type)
        return res.status(200).send(result);
    }catch (error){
        console.log(error)
        return res.status(500).send({ error: "Internal Server Error"  });
    }
});

router.post('/create_user', async (req, res) => {
    let { email, name, user_type } = req.body;
    try{
        const signUp = await db.createNewUser(email, name, user_type);
        signUp['redirect_url'] = '/login';
        res.status(201).json(signUp)
    }catch(err){
        return {
            error: err.message,
        };
    }
});

router.get('/check-login', async (req, res) => {
    res.status(200).json(await db.checkLoggedIn());
});

router.get('user-type', async (req, res) => {
    return res.status(200).json(await db.userType());
})

router.get('/logout', async (req, res) => {
    const signOut = await db.invalidateUser();
    signOut['redirect_url'] = '/login'
    res.status(200).json(signOut)
});


export default router;
