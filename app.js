const path = require('path');

const express = require('express');

const morgan = require('morgan');
const winston = require('./src/util/winston');
const logger = winston.logger;
const bodyParser = require('body-parser');

//setup filewatcher
const {IMAGEFILES_OUTPUT_PATH,} = require('./config');
const fileWatcher = require('./src/file-watcher');
const zipHandler = require('./src/zip-handler');
const api = require('./src/util/api-request');

/**
 * Watch the output directory and send files to webserver. Move files when sent
 */
fileWatcher.watch(IMAGEFILES_OUTPUT_PATH, filepath => {
    const preview_id = path.basename(filepath, '.zip');
    logger.verbose('Preview ID %s output file found.', preview_id);
    api.putToApi(`preview/${preview_id}`, filepath)
        .then(data => {
            logger.info('Preview ID %s successfully sent to the webserver', data.preview_id);
            return zipHandler.moveZip(filepath);
        })
        .then(res => {
            if (!res) {
                logger.error('Error moving zip to sent folder!');
            }
        })
        .catch(err => {
            logger.error('Error in zip submit request: %s', err);
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
