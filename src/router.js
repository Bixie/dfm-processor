const {logger,} = require('../src/util/winston');

const express = require('express');
const router = express.Router();
const ServerStatus = require('../src/util/server-status');
const ApiToken = require('./api-token');
const {PARAMSFILES_PATH,} = require('../config');

const ParamsFile = require('./params-file');
const {getWatcher, getGroupQueues,} = require('./file-watcher');

const stats = new ServerStatus();

function getWatchedPaths() {
    //flatten the arrays of paths to single string
    return Object.values(getWatcher().getWatched())
        .map(paths => paths.join(', '))
        .filter(paths => paths !== '')
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
 * Request processing preview for a parameter set
 * @param string preview_id Unique ID to tag images
 * @param object params Params for MFD calculations
 * @param object options View options for rendering
 */
router.post('/preview/:preview_id', ApiToken.middleware,(req, res) => {
    const {preview_id,} = req.params;
    const {params, options,} = req.body;
    logger.verbose('Incoming request for preview for %s', preview_id);
    let result = false;
    const paramsFile = new ParamsFile(preview_id, params, options);
    paramsFile.write(PARAMSFILES_PATH).then(result => {
        logger.info('Parameterfile %s/%s.txt saved.', PARAMSFILES_PATH, preview_id);
        res.send({result, preview_id,});
    }).catch(error => res.send({result, preview_id, error,}));
});

module.exports = router;