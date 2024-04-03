const path = require('node:path');
const dotenv = require('dotenv');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const verifyIsAuthenticated = require('./middlewares/verifyIsAuthenticated');
const setCurrentUser = require('./middlewares/setCurrentUser');

const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1';
const mainLayoutView = path.join('layouts', 'main_layout_view');
const publicDirectory = path.join(__dirname, 'public');

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicDirectory));
app.use(expressLayouts);
app.set('layout', mainLayoutView);
app.set('view engine', 'ejs');
app.use('/posts', setCurrentUser, postRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', verifyIsAuthenticated, dashboardRoutes);

app.get('/', setCurrentUser, (req, res, next) => {
    res.redirect('/posts');
});

app.listen(PORT, () => {
    console.log(`Application running: ${SERVER_URL}:${PORT}`);
});