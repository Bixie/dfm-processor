const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
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

/**
 * Every file under `dir`, paired with the name it should carry in an archive.
 *
 * The name is the plain basename. It used to be lodash `snakeCase()` of it,
 * which was the bridge between the engine's own filenames
 * (`const_Pr.W[ASP]_(M)_nlv.txt`) and the snake_case ones the browser looks up
 * (`const_pr_w_asp_m_nlv.txt`). That bridge is `Api\PreviewZip::normalizeName()`
 * in the WordPress plugin since task 23, because nothing here opens an archive
 * any more.
 *
 * The only caller left is the engine emulator, whose entire job is to produce
 * archives that look like the engine's — and normalising here made its zips
 * *unlike* the real ones, so every test driven by the emulator was blind to the
 * rename it was supposed to exercise. See PROTOCOL.md §4.
 */
async function getFlattenedFiles(dir) {
    const files = await getFiles(dir);
    return files.map(file => {
        const relPath = file.replace(dir, '');
        return {
            name: path.basename(relPath),
            filepath: path.join(dir, relPath),
        }
    });
}

module.exports = {
    getFiles,
    getFlattenedFiles,
};
