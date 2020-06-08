
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

//watchlists db
const watchlists = require('./src/util/watchlists');
watchlists.setup()
    .then(() => {
        logger.verbose('Watchlist database ready');
    })
    .catch(err => {
        logger.error('Error setting up watchlist database: %s', err.message);
        process.exit(1);
    })
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

const watchlistRoutes = require('./src/watchlists');
const router = require('./src/router');
app.use('/', router);
app.use('/watchlists', watchlistRoutes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
//fourth argument next needed to register as error handler
app.use((error, req, res, next) => {
    // set vars, only providing error in development
    const {message,} = error;
    const isDevelopment = req.app.get('env') === 'development';
    //request-errors get a status and are regular or logged
    if (error.status === undefined) {
        logger.error('Uncaught error: %s', error.message);
        // eslint-disable-next-line no-console
        console.error(error);
    }
    // render the error page
    res.status(error.status || 500).send({message, error: isDevelopment ? error : {},});
});

module.exports = app;
