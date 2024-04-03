const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    const token = req.cookies.auth_token;
    if (token) {
        try {
            const id = jwt.verify(token, jwtSecret);
            req.user = await prisma.user.findFirstOrThrow({
                where: { id: parseInt(id) }
            });
            res.locals.user = req.user;
        } catch (error) {
            req.user = null;
            res.locals.user = req.user;
            res.locals.errorMessage = "Error authenticating user. Please try to login again";
        }
    } else {
        res.user = null;
        res.locals.user = req.user;
    }
    next();
}