
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const {IMAGEFILES_SENT_PATH,} = require('../config');

/**
 * https://gist.github.com/inadarei/4465153
 * @param filepath
 * @returns {ReadStream}
 */
function getZipStream(filepath) {
    return fs.createReadStream(filepath);
}

function moveZip(filepath) {
    return new Promise((resolve, reject) => {
        const basename = path.basename(filepath);
        fs.rename(filepath, `${IMAGEFILES_SENT_PATH}/${basename}`, err => {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    });
}

module.exports = {
    getZipStream,
    moveZip,
};