import express from 'express';
const router = express.Router();
import db from '../data/queries.js';
import cache from "../data/cache.js";

// router.get('/login', function(req, res, next) {
//     res.send('Logged in!');
// });

router.get('/users', async (req, res) => {
    return res.status(200).json(await db.getAllUsers())
});

router.post('/login', async (req, res) => {
    try{
        let { email} = req.body; // remove name from login
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

router.get('/check-login', async function checkLogin(req, res) {
    try{
        const email = req.query.email;
        const checkLogin = await db.checkLoggedIn(email);
        res.status(200).json(checkLogin);
    }catch (e) {
        res.status(500).send({ error: "Internal Server Error"  });
    }
});

// Deprecated todo: to be removed
// router.get('user-type', async (req, res) => {
//     const email = req.query.email;
//     console.log('userType', email);
//     const userType = await db.getUserType(email);
//     return res.status(200).json({
//         user_type: userType,
//     });
// });

router.get('/logout', async (req, res) => {
    const email = req.query.email;
    const signOut = await db.invalidateUser(email);
    signOut['redirect_url'] = '/login'
    res.status(200).json(signOut)
});


export default router;
