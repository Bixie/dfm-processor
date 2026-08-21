exports.APP_PORT = process.env.DFM_APP_PORT || '3000';
exports.DFM_APP_PATH = process.env.DFM_APP_PATH || '/var/www/html/dfm-processor';
exports.DFM_DB_PATH = process.env.DFM_DB_PATH || '/var/www/html/db';
exports.DFM_INPUT_HOST = process.env.DFM_INPUT_HOST || 'http://0.0.0.0';

/*
 * Where a calculation is sent. One entry per engine machine, keyed by the name
 * the plugin puts in the request body as `engine`.
 *
 * This used to be two entries keyed by data provider, `CSI` and `Yahoo`, because
 * Nico's interface listens on one port per dataset (6246=Yahoo, 6247=CSI in his
 * spec). Yahoo has been abandoned for years — `DataProvider` offers only CSI in
 * the form — and what the next entry here selects is a *machine*, not a dataset:
 * task 53 splits the engine into a main and a sub processor. So the key names a
 * target and the path stays whatever Nico's interface serves it on.
 */
exports.ENGINE_TARGETS = {
    main: {
        port: process.env.DFM_ENGINE_PORT_MAIN || 3035,
        path: process.env.DFM_ENGINE_PATH_MAIN || '/csi',
    },
};

// naming conventions from engine perspective - zip-put is the output of the engine
exports.LICENSEFILES_PATH = process.env.DFM_LICENSEFILES_PATH || '/var/www/html/license-in';
exports.OUTPUT_FILENAME_PREFIX = process.env.DFM_OUTPUT_FILENAME_PREFIX || 'dfm_preview';
exports.ZIPFILES_OUTPUT_PATH = process.env.ZIPFILES_OUTPUT_PATH || '/var/www/html/zip-out';
exports.RESPONSES_SENT_PATH = process.env.DFM_RESPONSES_SENT_PATH || '/var/www/html/responses-sent';

// WordPress REST base. putToApi('preview/<id>') therefore PUTs to
// https://dfm-wordpress.ddev.site/wp-json/dfm/v1/preview/<id>, handled by
// dfm-core's Api\Receiver. The Joomla equivalent was /dfm-api/index.php.
exports.INTERNAL_API_HOST = process.env.DFM_INTERNAL_API_HOST || 'https://dfm-wordpress.ddev.site/wp-json/dfm/v1';
exports.INTERNAL_API_KEY = process.env.DFM_INTERNAL_API_KEY || 'gh*sgSHDsdg#$^34W^sVS(#$SG*$4g9gGR&3';
