
const JSZip = require('jszip');
const fs = require('fs');

/**
 * Create a zip buffer
 * @param {Array} files
 * @return {Promise} buffer of zip
 */
function createZipBuffer(files) {
    const zip = new JSZip();
    files.forEach(({name, filepath,}) => {
        zip.file(name, fs.createReadStream(filepath));
    });
    return zip.generateAsync({type: 'nodebuffer',});
}

module.exports = {
    createZipBuffer,
};