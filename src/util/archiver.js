
const JSZip = require('jszip');
const fs = require('fs');

function createZip(files) {
    const zip = new JSZip();
    files.forEach(({name, filepath, contents,}) => {
        zip.file(name, contents || fs.createReadStream(filepath));
    });
    return zip;
}

function createZipBuffer(files) {
    return createZip(files).generateAsync({type: 'nodebuffer',});
}

function createZipFile(files, filepath) {
    return new Promise((resolve, reject) => {
        createZip(files)
            .generateNodeStream({type:'nodebuffer', streamFiles: true,})
            .pipe(fs.createWriteStream(filepath))
            .on('error', e => {
                reject(e);
            })
            .on('finish', () => {
                resolve(filepath);
            });
    });
}

function readZip(zipfile) {
    return new Promise((resolve, reject) => {
        fs.readFile(zipfile, async (err, data) => {
            if (err) {
                return reject(err);
            }
            const zip = await JSZip.loadAsync(data);
            const files = [];
            const entries = Array.from(Object.entries(zip.files));
            for (let i = 0; i < entries.length; i++) {
                const [name, file,] = entries[i];
                const contents = await file.async('string');
                files.push({name, contents,});
            }
            resolve(files);
        });
    });
}

module.exports = {
    createZipBuffer,
    createZipFile,
    readZip,
};
