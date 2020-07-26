
const JSZip = require('jszip');
const fs = require('fs');

/**
 * Create a zip buffer
 * @param {Array} files
 * @return {Promise} buffer of zip
 */
function createZipBuffer(files) {
    const zip = new JSZip();
    files.forEach(({name, filepath, contents,}) => {
        //legacy
        name = name.replace('.png.png', '.png');
        zip.file(name, contents || fs.createReadStream(filepath));
    });
    return zip.generateAsync({type: 'nodebuffer',});
}

module.exports = {
    createZipBuffer,
};
