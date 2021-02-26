const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
const {snakeCase,} = require('lodash');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

async function getFlattenedFiles(dir) {
    const files = await getFiles(dir);
    return files.map(file => {
        const relPath = file.replace(dir, '');
        return {
            name: getNormalizedFileName(relPath),
            filepath: path.join(dir, relPath),
        }
    });
}

function getNormalizedFileName (relPath) {
    const {basename, extension,} = getFileParts(relPath);
    return snakeCase(basename.replace(`.${extension}`, '')) + `.${extension}`;
}

function getFileParts (filepath) {
    const basename = path.basename(filepath);
    const parts = basename.split('.');
    const extension = parts.pop();
    const filename = parts.join('.');
    return {
        basename,
        extension,
        filename,
    };
}

module.exports = {
    getFiles,
    getFileParts,
    getFlattenedFiles,
    getNormalizedFileName,
};
