/**
 * For communication with internal server a simple API token is used
 * @type {string}
 */
const {INTERNAL_API_KEY,} = require('../config');

function middleware(req, res, next) {
    const token = req.header('x-dfm-apitoken');
    if (token === INTERNAL_API_KEY) {
        next();
    } else {
        const err = new Error('Not allowed');
        err.status = 403;
        next(err);
    }
}

module.exports = {
    middleware,
};