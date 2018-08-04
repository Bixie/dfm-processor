
const express = require('express');

const morgan = require('morgan');
const winston = require('./src/util/winston');
const logger = winston.logger;
const bodyParser = require('body-parser');

//setup filewatcher
const {IMAGEFILES_PATH,} = require('./config');
const fileWatcher = require('./src/file-watcher');
const imageHandler = require('./src/image-handler');
const api = require('./src/util/api-request');

fileWatcher.watch(IMAGEFILES_PATH, filepath => {
    imageHandler(filepath)
        .then(({preview_id, imageData,}) => {
            logger.info('Preview ID %s result fetched.', preview_id);
            //send to webserver API
            return api.postToApi(`/preview/${preview_id}`, {imageData,});
        })
        .then(res => {
            logger.info('Preview ID %s succesfully sent to the webserver', res.preview_id);
        })
        .catch(err => logger.error(err));
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
