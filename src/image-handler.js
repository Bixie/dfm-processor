
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const {IMAGEFILES_SENT_PATH,} = require('../config');

/**
 * https://gist.github.com/inadarei/4465153
 * @param filepath
 * @returns {string}
 */
function prepareImage(filepath) {
    // read binary data
    const bitmap = fs.readFileSync(filepath);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function moveImage(filepath) {
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
        const preview_id = path.basename(filepath, '.png');
        const imageData = prepareImage(filepath);
        moveImage(filepath)
            .then(() => resolve({preview_id, imageData,}))
            .catch(err => reject(err));
    });
};