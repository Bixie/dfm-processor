
const express = require('express');

const morgan = require('morgan');
const winston = require('./src/util/winston');
const logger = winston.logger;
const bodyParser = require('body-parser');

//setup filewatcher
const {IMAGEFILES_OUTPUT_PATH, WEBSERVER_LOCAL_PATH, IMAGEFILES_SENT_PATH,} = require('./config');
const fileWatcher = require('./src/file-watcher');
const archiver = require('./src/util/archiver');
const api = require('./src/util/api-request');

/**
 * Watch the output directory and send files to webserver. Move files when sent
 */
fileWatcher.watch(IMAGEFILES_OUTPUT_PATH, ({preview_id, total, files,}) => {
    if (WEBSERVER_LOCAL_PATH) {
        //copy to webservers path directly
        //todo if needed
    }
    let zipBuffer;
    //create zip blob
    archiver.createZipBuffer(files)
        .then(buffer => {
            zipBuffer = buffer;
            logger.verbose('Zip blob created with %d files for %s', total, preview_id);
            return api.putToApi(`preview/${preview_id}`, zipBuffer);
        })
        .then(data => {
            logger.info('Preview ID %s successfully sent to the webserver', data.preview_id);
            //clean up images
            return fileWatcher.cleanup(`${IMAGEFILES_SENT_PATH}/${preview_id}.zip`, zipBuffer, files);
        })
        .then(() => {
            logger.verbose('Zipfile for %s moved to archive', preview_id);
        })
        .catch(err => {
            logger.error('Error sending zipfile for %s: %s', preview_id, err.message);
        });

});

const app = express();

app.use(morgan('combined', {stream: winston.stream,}));
app.use(bodyParser.json());

const router = require('./src/router');
app.use('/', router);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
