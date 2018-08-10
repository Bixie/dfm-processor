/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');

const scriptArgs = process.argv.slice(2);

const quickRespond = scriptArgs[0] === '-qr';

const {PARAMSFILES_PATH, IMAGEFILES_OUTPUT_PATH,} = require('../config');
const fileWatcher = require('../src/file-watcher');
const archiver = require('../src/util/archiver');

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
    return toss * (2 * 60 * 1000);
}

//setup filewatcher
fileWatcher.watch(PARAMSFILES_PATH, filepath => {
    const preview_id = path.basename(filepath, '.txt');
    const timeoutTime = quickRespond ? 5 : getTimoutTime();
    console.log(`Creating ${preview_id}.zip in ${Math.round(timeoutTime/1000)} seconds`);
    setTimeout(() => {
        const filename = `${IMAGEFILES_OUTPUT_PATH}/${preview_id}.zip`;
        const sourcePath = 'C:/Projects/DFM/dfm-processor/scripts/test-images';
        const files = [
            {name: 'sample_1.png', filepath: `${sourcePath}/sample_1.png`,},
            {name: 'sample_2.png', filepath: `${sourcePath}/sample_2.png`,},
            {name: 'sample_3.png', filepath: `${sourcePath}/sample_3.png`,},
        ];
        archiver.create(filename, files)
            .then(size => {
                console.log(`Archiver wrote ${size} bytes for ${preview_id}.zip`);
                //remove param file
                fs.unlink(filepath, () => console.log('Param file removed'));
            })
            .catch(err => console.log('ERROR: ', err.message));

    }, timeoutTime);
});
console.log('Watching files...');