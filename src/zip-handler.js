
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');


function moveZip(filepath, destinationpath) {
    return new Promise((resolve, reject) => {
        const basename = path.basename(filepath);
        fs.rename(filepath, `${destinationpath}/${basename}`, err => {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    });
}

module.exports = {
    moveZip,
};