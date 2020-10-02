const winston = require('../util/winston');
const logger = winston.logger;
const fileWatcher = require('../file-watcher');
const {prepareDfmOutput,} = require('../graph/generator');
const {createZipBuffer, readZip,} = require('../util/archiver');
const {putToApi,} = require('../util/api-request');

const {IMAGEFILES_SENT_PATH,} = require('../../config');

async function sendOutput(preview_id, outputFiles, sourceFiles) {
    const zipBuffer = await createZipBuffer(outputFiles);
    logger.verbose('Zip blob created with %d files for %s', outputFiles.length, preview_id);

    const data = await putToApi(`preview/${preview_id}`, zipBuffer);
    logger.info('Preview ID %s successfully sent to the webserver', data.preview_id);

    await fileWatcher.cleanup(`${IMAGEFILES_SENT_PATH}/${preview_id}.zip`, zipBuffer, sourceFiles);
    logger.verbose('Zipfile for %s moved to archive', preview_id);
}

async function prepareOutput(preview_id, zipFilepath) {
    try {
        const dataFiles = await readZip(zipFilepath);
        const outputFiles = await prepareDfmOutput(dataFiles);
        await sendOutput(preview_id, outputFiles, [zipFilepath,]);
    } catch (e) {
        logger.error('Error sending zipfile for %s: %s', preview_id, e.message);
    }
}

//@legacy
async function prepareLegacyOutput(preview_id, files) {
    await sendOutput(preview_id, files.map((f, index) => ({...f, name: `output_${index + 1}`,})), files.map(f => f.filepath));
}

module.exports = {
    prepareLegacyOutput,
    prepareOutput,
};
