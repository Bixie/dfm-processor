/**
 * For communication with internal server a simple API token is used
 * @type {string}
 */
const {logger,} = require('../src/util/winston');
const {INTERNAL_API_KEY,} = require('../config');

function middleware(req, res, next) {
    const token = req.header('x-dfm-apitoken');
    if (token === INTERNAL_API_KEY) {
        next();
    } else {
        const err = new Error('Not allowed');
        err.status = 403;
        logger.warn('Access denied to token %s.', token);
        next(err);
    }
}

module.exports = {
    middleware,
};