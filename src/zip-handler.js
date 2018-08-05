
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const {IMAGEFILES_SENT_PATH,} = require('../config');

/**
 * https://gist.github.com/inadarei/4465153
 * @param filepath
 * @returns {string}
 */
function prepareZip(filepath) {
    // read binary data
    const bin = fs.readFileSync(filepath);
    // convert binary data to base64 encoded string
    return new Buffer(bin).toString('base64');
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

/**
 * Get filedata and move file
 * @param filepath
 * @returns Promise
 */
module.exports = function (filepath) {
    return new Promise((resolve, reject) => {
        const preview_id = path.basename(filepath, '.zip');
        const zipData = prepareZip(filepath);
        moveZip(filepath)
            .then(() => resolve({preview_id, zipData,}))
            .catch(err => reject(err));
    });
};