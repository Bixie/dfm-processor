
const JSZip = require('jszip');
const fs = require('fs');

function createZip(files) {
    const zip = new JSZip();
    files.forEach(({name, filepath, contents,}) => {
        zip.file(name, contents || fs.createReadStream(filepath));
    });
    return zip;
}

/**
 * Used by one caller: the failure report in src/dfm-response/. Delivered
 * archives are the engine's own bytes and are never repacked — see PROTOCOL.md §5.
 */
function createZipBuffer(files) {
    return createZip(files).generateAsync({type: 'nodebuffer',});
}

/**
 * Used by the engine emulator only. The engine writes its own zips.
 *
 * DEFLATE because the engine's zips are deflated — the samples in docs/ are 34 KB
 * for 112 KB of text — and JSZip's default is STORE. It matters now that the
 * archive is relayed byte for byte: an emulator that STOREs would put 1.2 MB on
 * the wire and quietly reproduce the size problem the pass-through removed.
 */
function createZipFile(files, filepath) {
    return new Promise((resolve, reject) => {
        createZip(files)
            .generateNodeStream({type:'nodebuffer', streamFiles: true, compression: 'DEFLATE',})
            .pipe(fs.createWriteStream(filepath))
            .on('error', e => {
                reject(e);
            })
            .on('finish', () => {
                resolve(filepath);
            });
    });
}

module.exports = {
    createZipBuffer,
    createZipFile,
};
