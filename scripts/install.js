/* eslint-disable no-console */

const fs = require('fs');

const { ZIPFILES_OUTPUT_PATH } = require('../config');

//check needed folders
try {
    fs.statSync(ZIPFILES_OUTPUT_PATH);
} catch (e) {
    if (e.code === 'ENOENT') {
        fs.mkdirSync(ZIPFILES_OUTPUT_PATH, 755);
        console.log('Created ZIPFILES_OUTPUT_PATH ' + ZIPFILES_OUTPUT_PATH);
    }
}
