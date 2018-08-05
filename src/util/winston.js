const { createLogger, format, transports, } = require('winston');
const { combine, printf, } = format;
require('winston-daily-rotate-file');

const moment = require('moment');

//add time diff and format messages
let last_call;
function timestampDiff() {
    let now = Date.now();
    let diff = now - (last_call || Date.now());
    last_call = now;
    if (diff > 60000) {
        return moment.duration(diff).humanize();
    }
    if (diff > 1000) {
        return moment.duration(diff).asSeconds() + 's';
    }
    return moment.duration(diff).asMilliseconds() + 'ms';
}

const difftimeFormat = printf(info => {
    return `${timestampDiff()} ${info.level}: ${info.message}`;
});

const filelogFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

//set up transports
const transportsArr = [
    new (transports.DailyRotateFile)({
        name: 'log-file',
        level: 'info',
        format: combine(
            format.timestamp(),
            filelogFormat
        ),
        filename: __dirname + '/../../../logs/dfm-processor-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
];

//console logger for local console
if (process.env.NODE_ENV !== 'production') {
    transportsArr.push(new transports.Console({
        level: 'silly',
        format: combine(
            format.colorize(),
            difftimeFormat
        ),
    }));
}

//create logger
const logger = createLogger({
    format: combine(
        format.splat()
    ),
    transports: transportsArr,
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message) {
        logger.verbose(message);
    },
};

/**
 * @returns {object}
 */
module.exports = {
    logger,
    stream: logger.stream,
};