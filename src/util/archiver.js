const {logger,} = require('./winston');

const archiver = require('archiver');
const fs = require('fs');
const Promise = require('bluebird');

/**
 * Create a zip file
 * @param dest_filepath
 * @param files
 * @return {Promise} number of bytes written on success
 */
function create(dest_filepath, files) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(dest_filepath);
        const archive = archiver('zip', {
            zlib: { level: 9, }, // Sets the compression level.
        });
        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                logger.warning('Archiver %s: %s', dest_filepath, err.message)
            } else {
                reject(err);
            }
        });
        archive.on('error', err => reject(err));

        // listen for all archive data to be written
        output.on('close', () => {
            resolve(archive.pointer());
        });
        // pipe archive data to the file
        archive.pipe(output);
        //add the filestreams
        files.forEach(({name, filepath,}) => {
            archive.append(fs.createReadStream(filepath), { name,});
        });
        // finalize the archive (ie we are done appending files but streams have to finish yet)
        archive.finalize();

    });
}

module.exports = {
    create,
};