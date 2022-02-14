require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const express = require('express');
const sessionSecret = process.env.SESSION_SECRET;
const connectionString = process.env.MONGODB_STRING;

const sessionRouter = express.Router();

sessionRouter.use(session({
    store: MongoStore.create({
        mongoUrl: connectionString,
        collection: 'sessions'
    }),
    secret: sessionSecret, // https://www.npmjs.com/package/express-session#secret
    resave: true, // https://www.npmjs.com/package/express-session#resave
    saveUninitialized: true, //https://www.npmjs.com/package/express-session#saveuninitialized
    rolling: true, // Max age resets with events
    cookie : {
        maxAge: 1000 * 60 * 60 // 1d
    },
}))

module.exports = sessionRouter;