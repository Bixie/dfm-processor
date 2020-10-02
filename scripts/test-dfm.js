/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');

const scriptArgs = process.argv.slice(2);

const quickRespond = scriptArgs.includes('-qr');

const {PARAMSFILES_PATH, IMAGEFILES_OUTPUT_PATH, PARAMSFILES_ARCHIVE_PATH,} = require('../config');
const fileWatcher = require('../src/file-watcher');

const watchV1 = scriptArgs.includes('-v1');

function getTimoutTime() {
    let toss = Math.random();
    //try to get some granular RNG, tending to shorter times
    if (toss < 0.2) {
        toss = toss * 0.2;
    } else if (toss < 0.5) {
        toss = toss * 0.25;
    } else if (toss < 0.7) {
        toss = toss * 0.5;
    }
    return Math.round(toss * (2 * 60 * 1000));
}

function writeFiles(files, fileBase) {
    files.forEach(({name, filepath,}, index) => {
        const fileIndex = index + 1;
        const [base, extension,] = name.split('.');
        const filename = `${fileBase}_${fileIndex}_${files.length}_${base}.${extension}`;
        const fileTimeoutTime = Math.round(Math.random() * 500);
        setTimeout(() => {
            fs.copyFile(filepath, `${IMAGEFILES_OUTPUT_PATH}/${filename}`, err => {
                if (err) {
                    console.log('ERROR: ', err.message);
                    return;
                }
                console.log(`File ${filename} added with ${fileTimeoutTime}ms delay for ${fileBase}`);
            });
        }, fileTimeoutTime);
    });
}

//@deprecated legacy v1
if (watchV1) {
    fileWatcher.watchSingle(PARAMSFILES_PATH, filepath => {
        const sourcePath = path.join(__dirname, 'test-data');
        const fileBase = path.basename(filepath, '.txt');
        const timeoutTime = quickRespond ? 5 : getTimoutTime();
        console.log(`Creating files for ${fileBase} in ${Math.round(timeoutTime / 1000)} seconds`);
        setTimeout(() => {
            writeFiles([
                {name: 'sample_1.png', filepath: `${sourcePath}/sample_1.png`},
                {name: 'sample_2.png', filepath: `${sourcePath}/sample_2.png`},
                {name: 'sample_3.png', filepath: `${sourcePath}/sample_3.png`},
            ], fileBase);
        }, timeoutTime);
        fs.rename(filepath, path.join(PARAMSFILES_ARCHIVE_PATH, path.basename(filepath)), err => {
            if (err) {
                console.log('ERROR: ', err.message);
                return;
            }
            console.log(`Paramfile ${fileBase}.txt moved to archive`);
        })
    });
}
//log that we're ready
console.log('Watching files V1...');
