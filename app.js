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

fileWatcher.watch(IMAGEFILES_OUTPUT_PATH, filepath => {
    const preview_id = path.basename(filepath, '.zip');
    api.putToApi(`/preview/${preview_id}`, zipHandler.getZipStream(filepath), (err, res, body) => {
        if (err) {
            logger.error('Error in zip submit request: %s', err);
        }
        const data = JSON.parse(body);
        if (res.statusCode === 200) {
            logger.info('Preview ID %s succesfully sent to the webserver', data.preview_id);
        } else {
            logger.error('Submit zip %s returned %d: %s', preview_id, res.statusCode, data.error);
        }
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
