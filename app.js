
const express = require('express');

const morgan = require('morgan');
const winston = require('./src/util/winston');
const bodyParser = require('body-parser');

//setup filewatcher
const {IMAGEFILES_PATH,} = require('./config');
const fileWatcher = require('./src/file-watcher');

fileWatcher.watch(IMAGEFILES_PATH, (path, stats) => {
    winston.logger.info(`File ${path} has been added`);
    if (stats) {
        winston.logger.info(`File ${path} has a size of ${stats.size}`);
    }
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
