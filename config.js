exports.APP_PORT = process.env.DFM_APP_PORT || '3000';
exports.DFM_APP_PATH = process.env.DFM_APP_PATH || '/var/www/html/dfm-processor';
exports.DFM_DB_PATH = process.env.DFM_DB_PATH || '/var/www/html/db';
exports.DFM_INPUT_HOST = process.env.DFM_INPUT_HOST || 'http://0.0.0.0';
exports.DFM_INPUT_PORT_CSI = process.env.DFM_INPUT_PORT_CSI || 3035;
exports.DFM_INPUT_PORT_YAHOO = process.env.DFM_INPUT_PORT_YAHOO || 3036;
exports.DFM_INPUT_PATH_CSI = process.env.DFM_INPUT_PATH_CSI || '/csi';
exports.DFM_INPUT_PATH_YAHOO = process.env.DFM_INPUT_PATH_YAHOO || '/yahoo';
exports.PARAMSFILES_PATH = process.env.DFM_PARAMSFILES_PATH || '/var/www/html/params-in';
exports.LICENSEFILES_PATH = process.env.DFM_LICENSEFILES_PATH || '/var/www/html/license-in';
exports.PARAMSFILES_ARCHIVE_PATH = process.env.DFM_PARAMSFILES_ARCHIVE_PATH || '/var/www/html/params-archive';
exports.OUTPUT_FILENAME_PREFIX = process.env.DFM_OUTPUT_FILENAME_PREFIX || 'dfm_preview';
exports.OUTPUT_FILENAME_SUFFIX = process.env.DFM_OUTPUT_FILENAME_SUFFIX || '_%d_%d';
exports.IMAGEFILES_OUTPUT_PATH = process.env.DFM_IMAGEFILES_OUTPUT_PATH || '/var/www/html/image-out';
exports.ZIPFILES_OUTPUT_PATH = process.env.ZIPFILES_OUTPUT_PATH || '/var/www/html/zip-out';
exports.IMAGEFILES_SENT_PATH = process.env.DFM_IMAGEFILES_SENT_PATH || '/var/www/html/image-sent';
exports.WEBSERVER_LOCAL_PATH = process.env.DFM_WEBSERVER_LOCAL_PATH !== 'false' ? process.env.DFM_WEBSERVER_LOCAL_PATH : false;

// WordPress REST base. putToApi('preview/<id>') therefore PUTs to
// https://dfm-wordpress.ddev.site/wp-json/dfm/v1/preview/<id>, handled by
// dfm-core's Api\Receiver. The Joomla equivalent was /dfm-api/index.php.
exports.INTERNAL_API_HOST = process.env.DFM_INTERNAL_API_HOST || 'https://dfm-wordpress.ddev.site/wp-json/dfm/v1';
exports.INTERNAL_API_KEY = process.env.DFM_INTERNAL_API_KEY || 'gh*sgSHDsdg#$^34W^sVS(#$SG*$4g9gGR&3';