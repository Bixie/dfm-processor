const {logger,} = require('./util/winston');
const watchlists = require('./util/watchlists');
const {errorResponse,} = require('./util/http-error');

const express = require('express');
const router = express.Router();
const ApiToken = require('./api-token');

router.get('/:user_id', ApiToken.middleware, (req, res, next) => {
    const {user_id,} = req.params;
    watchlists.getWatchlistsForUser(user_id)
        .then(watchlists => {
            res.send({watchlists,});
        })
        .catch(err => {
            logger.error('Error get watchlists for user: %s', err.message);
            next(err);
        })
});

router.post('/:user_id/:id?', ApiToken.middleware, (req, res, next) => {
    const {user_id, id,} = req.params;
    const watchlist = req.body;
    watchlists.saveWatchlistForUser(user_id, Number(id || 0), watchlist)
        .then(watchlist => {
            res.send({watchlist,});
        })
        .catch(err => {
            logger.error('Error storing watchlist for user: %s', err.message);
            next(err);
        })
});

router.delete('/:user_id/:id', ApiToken.middleware, (req, res, next) => {
    const {user_id, id,} = req.params;
    watchlists.removeWatchlistFromUser(user_id, id)
        .then(() => {
            res.status(204).send(null);
        })
        .catch(err => {
            logger.error('Error removing watchlist for user: %s', err.message);
            next(err);
        })
});

module.exports = router;
