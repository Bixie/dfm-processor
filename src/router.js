const {logger,} = require('../src/util/winston');

const express = require('express');
const router = express.Router();
const ApiToken = require('./api-token');

router.use(ApiToken.middleware);
/**
 * Request processing preview for a parameter set
 * @param string preview_id Unique ID to tag images
 * @param object params Params for MFD calculations
 * @param object options View options for rendering
 */
router.post('/preview/:preview_id', (req, res) => {
    const {preview_id,} = req.params;
    const {params, options,} = req.body;
    //todo validate params?
    logger.info('Incoming request for preview for %s', preview_id);
    let result = false;


    res.send({result, preview_id,});
});

module.exports = router;