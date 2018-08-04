const { createLogger, format, transports, } = require('winston');
const { combine, printf, } = format;

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

const myFormat = printf(info => {
    return `${timestampDiff()} ${info.level}: ${info.message}`;
});

//set up transports
const transportsArr = [
    new (transports.File)({
        name: 'error-file',
        filename: __dirname + '/../../../logs/dfm-proc-error.log',
        level: 'error',
    }),
];

//console logger for local console
if (process.env.NODE_ENV !== 'production') {
    transportsArr.push(new transports.Console({
        level: 'silly',
    }));
}

//create logger
const logger = createLogger({
    format: combine(
        format.splat(),
        myFormat
    ),
    transports: transportsArr,
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message) {
        logger.info(message);
    },
};

/**
 * @returns {object}
 */
module.exports = {
    logger,
    stream: logger.stream,
};