
const express = require('express');

const morgan = require('morgan');
const winston = require('./src/util/winston');
const logger = winston.logger;
const bodyParser = require('body-parser');

//setup filewatcher
const {ZIPFILES_OUTPUT_PATH, OUTPUT_FILENAME_PREFIX,} = require('./config');
const fileWatcher = require('./src/file-watcher');
const {prepareOutput, prepareLegacyOutput,} = require('./src/dfm-response');

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
const zipfileRegex = new RegExp(`${OUTPUT_FILENAME_PREFIX}([^\\\\].*)\.zip$`);
fileWatcher.watchSingle(ZIPFILES_OUTPUT_PATH, async zipFilepath => {
    const m = zipFilepath.match(zipfileRegex);
    if (!m) {
        return;
    }
    const preview_id = `${OUTPUT_FILENAME_PREFIX}${m[1]}`;
    await prepareOutput(preview_id, zipFilepath);
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
