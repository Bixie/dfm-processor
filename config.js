
exports.APP_PORT = process.env.DFM_APP_PORT || '3000';
exports.DFM_APP_PATH = process.env.DFM_APP_PATH || 'C:/Projects/DFM/dfm-processor';
exports.DFM_DB_PATH = process.env.DFM_DB_PATH || 'C:/Projects/DFM/db';
exports.DFM_INPUT_PORT_CSI = process.env.DFM_INPUT_PORT_CSI || 3035;
exports.DFM_INPUT_PORT_YAHOO = process.env.DFM_INPUT_PORT_YAHOO || 3036;
exports.DFM_INPUT_PATH_CSI = process.env.DFM_INPUT_PATH_CSI || '/csi';
exports.DFM_INPUT_PATH_YAHOO = process.env.DFM_INPUT_PATH_YAHOO || '/yahoo';
exports.PARAMSFILES_PATH = process.env.DFM_PARAMSFILES_PATH || 'C:/Projects/DFM/params-in';
exports.LICENSEFILES_PATH = process.env.DFM_LICENSEFILES_PATH || 'C:/Projects/DFM/license-in';
exports.PARAMSFILES_ARCHIVE_PATH = process.env.DFM_PARAMSFILES_ARCHIVE_PATH || 'C:\\Projects\\DFM\\params-archive';
exports.OUTPUT_FILENAME_PREFIX = process.env.DFM_OUTPUT_FILENAME_PREFIX || 'dfm_preview';
exports.OUTPUT_FILENAME_SUFFIX = process.env.DFM_OUTPUT_FILENAME_SUFFIX || '_%d_%d';
exports.IMAGEFILES_OUTPUT_PATH = process.env.DFM_IMAGEFILES_OUTPUT_PATH || 'C:/Projects/DFM/image-out';
exports.ZIPFILES_OUTPUT_PATH = process.env.ZIPFILES_OUTPUT_PATH || 'C:/Projects/DFM/zip-out';
exports.IMAGEFILES_SENT_PATH = process.env.DFM_IMAGEFILES_SENT_PATH || 'C:/Projects/DFM/image-sent';
exports.WEBSERVER_LOCAL_PATH = process.env.DFM_WEBSERVER_LOCAL_PATH !== 'false' ? process.env.DFM_WEBSERVER_LOCAL_PATH : false;

exports.INTERNAL_API_HOST = process.env.DFM_INTERNAL_API_HOST || 'http://www.enterergodics-test.com/dfm-api/index.php';
exports.INTERNAL_API_KEY = process.env.DFM_INTERNAL_API_KEY || 'gh*sgSHDsdg#$^34W^sVS(#$SG*$4g9gGR&3';
