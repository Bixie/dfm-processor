/* eslint-disable no-console */

const fs = require('fs');

const {IMAGEFILES_SENT_PATH, IMAGEFILES_OUTPUT_PATH,} = require('../config');

//check needed folders
try {
    fs.statSync(IMAGEFILES_SENT_PATH);
} catch (e) {
    if (e.code === 'ENOENT') {
        fs.mkdirSync(IMAGEFILES_SENT_PATH, 755);
        console.log('Created sent images path ' + IMAGEFILES_SENT_PATH);
    }
}

try {
    fs.statSync(IMAGEFILES_OUTPUT_PATH);
} catch (e) {
    if (e.code === 'ENOENT') {
        fs.mkdirSync(IMAGEFILES_OUTPUT_PATH, 755);
        console.log('Created listener images path ' + IMAGEFILES_OUTPUT_PATH);
    }
}

