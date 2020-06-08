const path = require('path');
const HttpError = require('./http-error');

const {DFM_DB_PATH,} = require('../../config');

const knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.join(DFM_DB_PATH, 'watchlists.sqlite'),
    }
});

function setup() {
    return knex.schema.hasTable('watchlists').then(function(exists) {
        if (!exists) {
            return knex.schema.createTable('watchlists', function(t) {
                t.increments('id').primary();
                t.integer('user_id');
                t.string('label', 128);
                t.text('items');
            });
        }
    });
}

function ensureUserOwnsWatchlist(user_id, id) {
    return knex('watchlists').where({id, user_id,}).count('id', {as: 'count'})
        .then(([{count,},]) => {
            console.log(count);
            if (count !== 1) {
                throw new HttpError('No access to watchlist for this user', 403);
            }
        });
}

function validWatchlistData(user_id, watchlist) {
    const {label, items,} = watchlist;

    try {
        const test = JSON.parse(items);
        test.map(i => !!i);
    } catch (e) {
        throw new HttpError('List is not a valid JSON array', 422);
    }
    return {
        user_id: Number(user_id),
        label: String(label).substr(0, 128),
        items: String(items),
    }
}

function getWatchlistsForUser(userId) {
    return knex.select('id', 'label', 'items')
        .from('watchlists')
        .where('user_id', userId);
}

function saveWatchlistForUser(user_id, id, watchlist) {
    watchlist = validWatchlistData(user_id, watchlist);
    if (id > 0) {
        return ensureUserOwnsWatchlist(user_id, id).then(() => {
            return knex('watchlists').where({id,}).update(watchlist).then(() => ({...watchlist, id,}));
        });
    } else {
        return knex('watchlists').insert(watchlist).then(([id,]) => ({...watchlist, id,}));
    }
}

function removeWatchlistFromUser(user_id, id) {
    return ensureUserOwnsWatchlist(user_id, id).then(() => {
        return knex('watchlists').where({id,}).delete();
    });
}

/**
 * @returns {object}
 */
module.exports = {
    knex,
    setup,
    getWatchlistsForUser,
    saveWatchlistForUser,
    removeWatchlistFromUser,
};
