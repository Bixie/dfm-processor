const {logger,} = require('./util/winston');

const express = require('express');
const router = express.Router();
const ServerStatus = require('./util/server-status');
const ApiToken = require('./api-token');
const {
    LICENSEFILES_PATH,
    DFM_INPUT_HOST,
    DFM_INPUT_PORT_CSI,
    DFM_INPUT_PORT_YAHOO,
    DFM_INPUT_PATH_CSI,
    DFM_INPUT_PATH_YAHOO,
} = require('../config');
const request = require('request');

const LicenseFile = require('./license/license-file');
const {getWatcher, getGroupQueues,} = require('./file-watcher');

const stats = new ServerStatus();

function getWatchedPaths() {
    //flatten the arrays of paths to single string
    return Object.values(getWatcher())
        .map(watcher => Object.keys(watcher.getWatched()).pop())
        .join(', ');
}

router.get('/status', (req, res) => {
    logger.verbose('Status request.');
    const groupQueue = getGroupQueues();
    const watchedPaths = getWatchedPaths();
    const status = stats.getStatus();
    res.send({status, watchedPaths, groupQueue,});
});

/**
 * Relay a calculation request to the DFM engine.
 *
 * The mapping from the form's field names to the engine's four-letter keys used
 * to live here, in src/params/. It lives in the WordPress plugin now
 * (Api\EngineQuery — see PROTOCOL.md §3 and the port plan's task 49), which is
 * where the fields, their option lists and the whitelist that filters them
 * already were. What arrives is the finished query string plus the *name* of the
 * data provider; this resolves the name against DFM_INPUT_* and passes the query
 * through untouched.
 *
 * The provider stays a name on purpose. A URL out of a request body would make
 * this fetch whatever it is told, and the alternative — the plugin building the
 * whole URL — would mean the engine's LAN address in a wp-config on a machine
 * that cannot reach it.
 *
 * @param string preview_id Unique ID to tag images
 * @param string query      Query string for the engine, already mapped
 * @param string provider   CSI or Yahoo: which front end to send it to
 */
router.post('/preview/:preview_id', ApiToken.middleware, async (req, res) => {
    const {preview_id,} = req.params;
    const {query, provider,} = req.body;
    logger.verbose('Incoming request for preview for %s', preview_id);

    const errorResponse = (message, status = 500) => {
        logger.error(`Error sending params to DFM: ${message}`);
        res.status(status);
        res.send({result: false, preview_id, error: message,});
    }

    //Everything the mapping can emit is a digit, a dot, a minus or an ordinal,
    //so this is not a filter on legitimate input: it is a guard on appending a
    //request body to a URL. A newline or a `#` in here would be somebody else's
    //idea, not the plugin's.
    if (typeof query !== 'string' || !/^[A-Za-z0-9;.\-_=&]+$/.test(query)) {
        return errorResponse('Missing or malformed query', 422);
    }

    const providerPort = {'CSI': DFM_INPUT_PORT_CSI, 'Yahoo': DFM_INPUT_PORT_YAHOO,}[provider];
    const providerPath = {'CSI': DFM_INPUT_PATH_CSI, 'Yahoo': DFM_INPUT_PATH_YAHOO,}[provider];
    if (providerPort === undefined || providerPath === undefined) {
        return errorResponse(`Invalid dataprovider`, 422);
    }
    const url = `${DFM_INPUT_HOST}:${providerPort}${providerPath}`;

    request.get({url: `${url}?${query}`,}, (err, response) => {
        if (err) {
            return errorResponse(err.message);
        }
        const {statusCode, body,} = response;
        if (statusCode === 200) {
            //The query is not logged. It carries the customer's licence key, and
            //this line used to write it to disk on every calculation.
            logger.info('Params for %s were sent to %s.', preview_id, url);
            res.send({result: true, preview_id,});
        } else {
            return errorResponse(body, statusCode);
        }
    });
});

/**
 * Send license data to License Application
 * @param object data Data from Digital River
 * @param string key Generated key
 */
router.post('/license', ApiToken.middleware, (req, res) => {
    const {data, key, userId,} = req.body;
    logger.verbose('Incoming registration for license %s', key);
    let result = false;
    const licenseFile = new LicenseFile(key, data, userId);
    licenseFile.write(LICENSEFILES_PATH).then(result => {
        logger.info('Licensefile for %s saved in %s.', key, LICENSEFILES_PATH);
        res.send({result,});
    }).catch(error => res.send({result, error,}));
});

module.exports = router;