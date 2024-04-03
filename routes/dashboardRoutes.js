const path = require('node:path');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
    let { pageNumber = 1, perPage = 10 } = req.query;
    const dashboardView = path.join('pages', 'dashboard');
    res.locals.currentRoute = "/dashboard";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    const data = {};
    data.posts = [];
    data.currentPageNumber = 0;
    data.nextPageNumber = null;
    data.hasNextPage = false;
    let numberOfPosts = data.posts.length;
    try {
        data.posts = await prisma.post.findMany({
            skip: perPage * pageNumber - perPage,
            take: perPage,
            orderBy: {
                createdAt: 'desc'
            }
        });
        numberOfPosts = await prisma.post.count({});
        data.currentPageNumber = pageNumber;
        data.nextPageNumber = parseInt(pageNumber) + 1;
        data.hasNextPage = data.nextPageNumber <= Math.ceil(numberOfPosts / perPage);
        data.nextPageNumber = data.hasNextPage ? data.nextPageNumber : null;
    } catch (error) {
        res.locals.errorMessage = error.message;
    }
    res.render(dashboardView, data);
});

router.get('/create-post', (req, res, next) => {
    const postCreateView = path.join('pages', 'dashboard', 'post_create_view');
    const data = {};
    data.post = { title: "", excerpt: "", body: "" };
    res.locals.currentRoute = "/dashboard/create-post";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    res.render(postCreateView, data);
});

router.post('/create-post', async (req, res, next) => {
    const { title, excerpt, body } = req.body;
    const postCreateView = path.join('pages', 'dashboard', 'post_create_view');
    const dashboardPageRoute = '/dashboard';
    const data = {};
    data.post = { title, excerpt, body };
    res.locals.currentRoute = "/dashboard/create-post";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    try {
        const post = await prisma.post.create({
            data: {
                title,
                excerpt,
                body
            }
        });
        res.locals.message = "Post created successfully";
        res.redirect(dashboardPageRoute);
    } catch (error) {
        res.locals.errorMessage = error.message;
        res.render(postCreateView, data);
    }
    res.render(postCreateView, data);
});

router.get('/update-post/:id', async (req, res, next) => {
    const { id } = req.params;
    const postUpdateView = path.join('pages', 'dashboard', 'post_update_view');
    const postCreatePageRoute = '/dashboard/create-post';
    const data = {};
    res.locals.currentRoute = "/dashboard/update-post/";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    try {
        const post = await prisma.post.findFirstOrThrow({
            where: { id: parseInt(id) }
        });
        data.post = { id: post.id, title: post.title, excerpt: post.excerpt, body: post.body };
        res.render(postUpdateView, data);
    } catch (error) {
        res.locals.errorMessage = error.message;
        res.redirect(postCreatePageRoute);
    }
});

router.post('/update-post', async (req, res, next) => {
    const { id, title, excerpt, body } = req.body;
    const postUpdateView = path.join('pages', 'dashboard', 'post_update_view');
    const dashboardPageRoute = '/dashboard';
    const data = {};
    data.post = { id, title, excerpt, body };
    res.locals.currentRoute = "/dashboard/update-post";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    try {
        const post = await prisma.post.update({
            data: {
                title,
                excerpt,
                body
            },
            where: { id: parseInt(id) }
        });
        res.locals.message = "Post created successfully";
        res.redirect(dashboardPageRoute);
    } catch (error) {
        res.locals.errorMessage = error.message;
    }
    res.render(postUpdateView, data);
});

router.get('/delete-post/:id', async (req, res, next) => {
    const { id } = req.params;
    const postDeleteView = path.join('pages', 'dashboard', 'post_delete_view');
    const dashboardPageRoute = '/dashboard';
    const data = {};
    res.locals.currentRoute = "/dashboard/delete-post";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    try {
        const post = await prisma.post.findFirstOrThrow({
            where: { id: parseInt(id) }
        });
        data.post = { id: post.id, title: post.title, excerpt: post.excerpt, body: post.body };
        res.render(postDeleteView, data);
    } catch (error) {
        res.locals.errorMessage = error.message;
        res.redirect(dashboardPageRoute);
    }
});

router.post('/delete-post', async (req, res, next) => {
    const { id, title, excerpt, body } = req.body;
    const postDeleteView = path.join('pages', 'dashboard', 'post_delete_view');
    const dashboardPageRoute = '/dashboard';
    const data = {};
    data.post = { id, title, excerpt, body };
    res.locals.currentRoute = "/dashboard/delete-post";
    res.locals.title = "Dashboard";
    res.locals.description = "Dashboard for managing your Nodejs Blog Website";
    try {
        const post = await prisma.post.delete({
            where: { id: parseInt(id) }
        });
        res.locals.message = "Post deleted successfully";
        res.redirect(dashboardPageRoute);
    } catch (error) {
        res.locals.errorMessage = error.message;
    }
    res.render(postDeleteView, data);
});

module.exports = router;