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
                t.string('name', 128);
                t.integer('item_count');
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
    const {name, items,} = watchlist;
    let item_count = 0;
    try {
        const test = JSON.parse(items);
        test.find(() => true); //simple test for array
        item_count = test.length;
    } catch (e) {
        throw new HttpError('List is not a valid JSON array', 422);
    }
    return {
        user_id: Number(user_id),
        name: String(name).substr(0, 128),
        item_count,
        items: String(items),
    }
}

function getWatchlistsForUser(userId) {
    return knex('watchlists')
        .where('user_id', userId)
        .orderBy('name')
        .select('id', 'name', 'item_count');
}

function getWatchlistForUser(user_id, id) {
    return knex('watchlists')
        .where({id, user_id,})
        .first('id', 'name', 'item_count', 'items');
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
    getWatchlistForUser,
    saveWatchlistForUser,
    removeWatchlistFromUser,
};
