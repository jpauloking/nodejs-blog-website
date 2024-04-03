const path = require('node:path');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const verifyIsAuthenticated = require('./../middlewares/verifyIsAuthenticated');

const prisma = new PrismaClient();
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

router.get('/login', (req, res, next) => {
    res.locals.currentRoute = "/auth/login";
    res.locals.title = "Login";
    res.locals.description = "Login to your Nodejs Blog Website account";
    const authLoginView = path.join('pages', 'auth', 'login');
    const data = {};
    res.render(authLoginView, data);
});

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    const authLoginView = path.join('pages', 'auth', 'login');
    const adminPageRoute = '/dashboard';
    const data = {};
    res.locals.currentRoute = "/auth/login";
    res.locals.title = "Login";
    res.locals.description = "Login to your Nodejs Blog Website account";
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: { username }
        });
        if (user) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (isValidPassword) {
                const token = jwt.sign(user.id, jwtSecret, {});
                res.cookie('auth_token', token, { expires: new Date(Date.now() + 900000), httpOnly: true });
                res.redirect(adminPageRoute);
            }
        } else {
            data.username = username;
            data.password = password;
            locals.errorMessage = "Invalid credntials";
            res.render(authLoginView, data);
        }
    } catch (error) {
        data.username = username;
        data.password = password;
        res.locals.errorMessage = error.message;
        res.render(authLoginView, data);
    }
});

router.get('/register', (req, res, next) => {
    res.locals.currentRoute = "/auth/register";
    res.locals.title = "Register";
    res.locals.description = "Register your Nodejs Blog Website account";
    const authRegisterView = path.join('pages', 'auth', 'register');
    const data = {};
    data.username = "";
    data.password = "";
    data.confirmPassword = "";
    res.render(authRegisterView, data);
});

router.post('/register', async (req, res, next) => {
    const { username, password, confirmPassword } = req.body;
    const authRegisterView = path.join('pages', 'auth', 'register');
    const loginPageRoute = "/auth/login";
    const data = {};
    res.locals.currentRoute = "/auth/register";
    res.locals.title = "Register";
    res.locals.description = "Register your Nodejs Blog Website account";
    try {
        if (password !== confirmPassword) {
            throw new Error("Password and Confirm password fields do not match");
        } else {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    isAdmin: false
                }
            });
            res.locals.message = `User ${user.username} created successfully`;
            res.redirect(loginPageRoute);
        }
    } catch (error) {
        console.log(error.message);
        data.username = username;
        data.password = password;
        data.confirmPassword = confirmPassword;
        res.locals.errorMessage = error.message;
        res.render(authRegisterView, data);
    }
});

router.get('/logout', verifyIsAuthenticated, (req, res, next) => {
    res.locals.currentRoute = "/auth/logout";
    res.locals.title = "Logout";
    res.locals.description = "Logout of your Nodejs Blog Website account";
    const authLoginView = path.join('pages', 'auth', 'logout');
    const data = {};
    res.render(authLoginView, data);
});

router.post('/logout', verifyIsAuthenticated, async (req, res, next) => {
    const { username } = req.body;
    const authLogoutView = path.join('pages', 'auth', 'logout');
    const loginPageRoute = '/auth/login';
    const data = {};
    res.locals.currentRoute = "/auth/logout";
    res.locals.title = "Logout";
    res.locals.description = "Logout of your Nodejs Blog Website account";
    try {
        // res.cookie('auth_token', null, { maxAge: -1, httpOnly: true });
        res.clearCookie('auth_token');
        res.redirect(loginPageRoute);
    } catch (error) {
        data.username = username;
        res.locals.errorMessage = error.message;
        res.render(authLogoutView, data);
    }
});

module.exports = router;