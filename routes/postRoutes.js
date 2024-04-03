const path = require('node:path')
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
    res.locals.currentRoute = "/posts";
    let { pageNumber = 1, perPage = 10 } = req.query;
    const postListView = path.join('pages', 'post_list_view');
    const data = {};
    data.title = "Home";
    data.description = "Blog website built with Nodejs";
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
    res.render(postListView, data);
});

router.get('/search', async (req, res, next) => {
    res.locals.currentRoute = "/search";
    const { searchTerm } = req.query;
    let { perPage = 10, pageNumber = 1 } = req.params;
    const postSearchView = path.join('pages', 'post_search_view');
    const data = {};
    data.title = "Search results";
    data.description = "Search results for posts";
    data.posts = [];
    data.currentPageNumber = 0;
    data.nextPageNumber = null;
    data.hasNextPage = false;
    let numberOfPosts = data.posts.length;
    try {
        if (searchTerm) {
            data.posts = await prisma.post.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm } },
                        { excerpt: { contains: searchTerm } },
                        { body: { contains: searchTerm } }
                    ]
                },
                skip: perPage * pageNumber - perPage,
                take: perPage,
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            data.posts = await prisma.post.findMany({
                skip: perPage * pageNumber - perPage,
                take: perPage,
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
        numberOfPosts = await prisma.post.count({});
        data.currentPageNumber = pageNumber;
        data.nextPageNumber = parseInt(pageNumber) + 1;
        data.hasNextPage = data.nextPageNumber <= Math.ceil(numberOfPosts / perPage);
        data.nextPageNumber = data.hasNextPage ? data.nextPageNumber : null;
    } catch (error) {
        res.locals.errorMessage = error.message;
    }
    res.render(postSearchView, data);
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    res.locals.currentRoute = "/posts/";
    const postDetailsView = path.join('pages', 'post_details_view');
    const data = {};
    data.title = "Post details";
    data.description = "Details of a single post"
    data.post = {};
    try {
        data.post = await prisma.post.findFirstOrThrow({
            where: { id: parseInt(id) }
        });
    } catch (error) {
        console.log(error.message);
        res.locals.errorMessage = error.message;
    }
    res.render(postDetailsView, data);
});

module.exports = router;