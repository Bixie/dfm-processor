const fs = require('fs');
const winston = require('../util/winston');
const logger = winston.logger;
const fileWatcher = require('../file-watcher');
const {createZipBuffer,} = require('../util/archiver');
const {putToApi,} = require('../util/api-request');

const {IMAGEFILES_SENT_PATH,} = require('../../config');

//One retry, then the archive is left where it is. Long enough for a container
//restart or a deploy to finish, short enough that a customer is still watching.
const RETRY_DELAY_MS = 10000;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PUT the archive, once, then once more.
 *
 * Two attempts and no more, because the archive stays in the watched directory
 * when both fail and chokidar re-emits it at startup — so a site that is down
 * for an hour is a redelivery on the next restart of this process rather than a
 * loop here. That is the last resort, not the plan; the durable version of it is
 * the job table in task 31.
 */
async function deliver(preview_id, buffer) {
    try {
        return await putToApi(`preview/${preview_id}`, buffer);
    } catch (first) {
        logger.warn('Delivery of %s failed (%s). Retrying in %ds.', preview_id, first.message, RETRY_DELAY_MS / 1000);
        await delay(RETRY_DELAY_MS);

        return putToApi(`preview/${preview_id}`, buffer);
    }
}

/**
 * Tell the customer, through the channel that already exists.
 *
 * `Preview.vue` displays the contents of any archive entry whose name contains
 * `error`, which is how the engine reports a bad gameplan or an expired licence
 * (`error_gameplan.txt`, `error_license.txt` — 10.5% of six years of
 * deliveries). So a failure *we* can see and the site cannot needs no new
 * endpoint and no new state: it is a one-entry archive, named for us rather than
 * for the engine.
 *
 * A site that cannot be reached at all is the one failure with nowhere to report
 * to; that is what the retry above and the job table are for.
 */
async function reportFailure(preview_id, message) {
    try {
        const buffer = await createZipBuffer([{name: 'error_processor.txt', contents: message,},]);
        await putToApi(`preview/${preview_id}`, buffer);
        logger.info('Failure report for %s sent to the webserver', preview_id);
    } catch (e) {
        logger.error('Could not even report the failure of %s: %s', preview_id, e.message);
    }
}

/**
 * Forward the engine's archive to the website, unopened.
 *
 * Until task 23 this read the zip, replaced the engine's 47 data files with 15
 * SVGs rendered here by d3 and jsdom, and repacked — which threw away the
 * numbers behind every chart and inflated 34 KB of the engine's own DEFLATE into
 * 1.2 MB stored. The charts are drawn in the browser now, so the archive travels
 * as it arrived. See PROTOCOL.md §5.
 */
async function prepareOutput(preview_id, zipFilepath) {
    let buffer;

    try {
        buffer = await fs.promises.readFile(zipFilepath);
    } catch (e) {
        logger.error('Could not read the archive for %s: %s', preview_id, e.message);
        await reportFailure(preview_id, `The calculation finished, but its result file could not be read on the calculation server. Please run the calculation again. Reference: ${preview_id}`);

        return;
    }

    /*
     * An archive that is not an archive. Two 0-byte zips from 2021 are kept in
     * the project's docs/error-inputs/, so this is a failure that has happened,
     * and it used to end as a preview that polled until it timed out with
     * nothing on screen: the site cannot tell "not delivered yet" from
     * "delivered empty".
     */
    if (buffer.length === 0 || buffer.subarray(0, 2).toString('latin1') !== 'PK') {
        logger.error('Archive for %s is not a usable zip (%d bytes)', preview_id, buffer.length);
        await reportFailure(preview_id, `The calculation finished, but the result file it produced is empty or damaged. Please run the calculation again. Reference: ${preview_id}`);
        await moveAside(preview_id, zipFilepath);

        return;
    }

    try {
        const data = await deliver(preview_id, buffer);
        logger.info('Preview ID %s successfully sent to the webserver (%d bytes)', data.preview_id, buffer.length);
    } catch (e) {
        logger.error(
            'Gave up on %s after two attempts: %s. The archive stays in %s and is retried when this process restarts.',
            preview_id, e.message, zipFilepath
        );

        return;
    }

    await moveAside(preview_id, zipFilepath);
}

async function moveAside(preview_id, zipFilepath) {
    try {
        await fileWatcher.move(zipFilepath, `${IMAGEFILES_SENT_PATH}/${preview_id}.zip`);
        logger.verbose('Zipfile for %s moved to archive', preview_id);
    } catch (e) {
        //The delivery is done; a file left in the watched directory only means
        //it is offered again after a restart, which the receiver takes twice.
        logger.error('Could not move the archive for %s out of the watched directory: %s', preview_id, e.message);
    }
}

module.exports = {
    prepareOutput,
};
