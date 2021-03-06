require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const express = require('express');
const sessionSecret = process.env.SESSION_SECRET;
const connectionString = process.env.MONGODB_STRING;
const sessionRouter = express.Router();

/* User sessions. */
sessionRouter.use(session({
    store: MongoStore.create({
        mongoUrl: connectionString,
        collection: 'sessions'
    }),
    secret: sessionSecret, // https://www.npmjs.com/package/express-session#secret
    resave: false, // https://www.npmjs.com/package/express-session#resave
    saveUninitialized: false, //https://www.npmjs.com/package/express-session#saveuninitialized
    rolling: true, // 
    cookie: {
        maxAge: 1000 * 60 * 60, // 1h
    },
}))

module.exports = sessionRouter;
