const {logger,} = require('../src/util/winston');

const express = require('express');
const router = express.Router();
const ServerStatus = require('../src/util/server-status');
const ApiToken = require('./api-token');
const {PARAMSFILES_PATH, PARAMSFILES_PATH_FULL, LICENSEFILES_PATH,} = require('../config');

const ParamsFile = require('./params-file'); //@deprecated
const ParamsFileFull = require('./params-file');
const LicenseFile = require('./license-file');
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
    //@depricated legacy v1
    if (options.licenseKey === undefined) {
        const paramsFile = new ParamsFile(preview_id, params, options);
        paramsFile.write(PARAMSFILES_PATH).then(result => {
            logger.info('Legacy parameterfile for %s (%s) saved in %s.', preview_id, options.locale, PARAMSFILES_PATH);
            res.send({result, preview_id,});
        }).catch(error => res.send({result, preview_id, error: error.message || error,}));
        return;
    }
    const paramsFile = new ParamsFileFull(preview_id, params, options);
    paramsFile.write(PARAMSFILES_PATH_FULL).then(result => {
        logger.info('Parameterfile for %s (%s) saved in %s.', preview_id, options.locale, PARAMSFILES_PATH);
        res.send({result, preview_id,});
    }).catch(error => res.send({result, preview_id, error: error.message || error,}));
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
