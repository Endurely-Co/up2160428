import express from 'express';
const router = express.Router();

const Pages = {
    login : '/login',
    register : '/register'
}


router.get(Pages.login, function(req, res, next) {
    res.render('login', { title: 'Login' });
});

router.get(Pages.register, function(req, res, next) {
    res.render('register', { title: 'Register' });
});

export default router;
