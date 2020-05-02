const path = require('path');
const Promise = require('bluebird');
const fs = require('fs');
const {logger,} = require('../src/util/winston');

const chokidar = require('chokidar');
const {OUTPUT_FILENAME_PREFIX, OUTPUT_FILENAME_SUFFIX,} = require('../config');

//prepare regex
const replacedSuffix = OUTPUT_FILENAME_SUFFIX.replace(/%d/g, '(\\d{1,2})');
const filenameRegex = new RegExp(`^${OUTPUT_FILENAME_PREFIX}(.*)_(?:EN|NL)${replacedSuffix}$`);

//the filewatcher instance
let watcher;

//place where files can wait to be sent out as group
//todo do we want to invalidate groups that are waitting too long to get complete?
const groupQueues = {};

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

function getOutputFileInfo (filepath) {
    const {basename, extension, filename,} = getFileParts(filepath);
    let fileIndex = -1;
    const group = {
        preview_id: '',
        total: 0,
        files: [],
    };
    //get id and group-counts from filename
    let m = filenameRegex.exec(filename);
    if (m) {
        group.preview_id = `${OUTPUT_FILENAME_PREFIX}${m[1]}`; //preview_id is prefix + unique string
        fileIndex = Number(m[2]);
        group.total = Number(m[3]);
    }
    return {
        filepath,
        basename,
        extension,
        filename,
        fileIndex,
        group,
    };
}

function groupedCallback (filepath, onAddCallback) {
    const {basename, group, fileIndex, extension,} = getOutputFileInfo(filepath);
    if (group.preview_id) {
        //add group if needed
        if (groupQueues[group.preview_id] === undefined) {
            //prevent groups with empty count
            groupQueues[group.preview_id] = group;
        }
        //add file to group
        groupQueues[group.preview_id].files.push({name: `output_${fileIndex}.${extension}`, filepath,});
        logger.verbose('File index %d, %s added to group %s', fileIndex, basename, group.preview_id);
        //check if group is complete
        if (groupQueues[group.preview_id].files.length === groupQueues[group.preview_id].total) {
            logger.verbose('Group %s complete with %d files', group.preview_id, group.total);
            //call callback and free memory
            onAddCallback(groupQueues[group.preview_id]);
            delete groupQueues[group.preview_id];
        }
    } else {
        logger.warn('No valid fileformat in output file: %s', basename);
        //todo move/delete file?
    }
}

function setupWatcher (path, grouped, onAddCallback) {
    // Initialize watcher.
    watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, //ignores .dotfiles
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
        },
    });
    //bind listener for new files
    watcher.on('add', filepath => {
        if (grouped) {
            groupedCallback(filepath, onAddCallback);
        } else {
            onAddCallback(filepath);
        }
    });
    return watcher;
}

function remove (filepath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filepath, err => {
            if (err) {
                reject(new Error(err));
                return;
            }
            resolve();
        })
    });
}

function storeZipAndRemoveSources (zipFilepath, buffer, files) {
    return new Promise((resolve, reject) => {
        fs.writeFile(zipFilepath, buffer, err => {
            if (err) {
                reject(new Error(err));
                return;
            }
            const promises = [];
            files.forEach(({filepath,}) => {
                promises.push(remove(filepath));
            });
            Promise.all(promises)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    });
}

module.exports = {
    getWatcher: () => watcher,
    getGroupQueues: () => groupQueues,
    watch: (path, onAddCallback) => setupWatcher(path, true, onAddCallback),
    watchSingle: (path, onAddCallback) => setupWatcher(path, false, onAddCallback),
    stop: () => watcher.close(),
    cleanup: (filepath, buffer, files) => storeZipAndRemoveSources(filepath, buffer, files),
};
