/* eslint-disable no-console */
const {DFM_INPUT_PORT, IMAGEFILES_OUTPUT_PATH,} = require('../config');

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const {logger,} = require('../src/util/winston');

const {getFlattenedFiles,} = require('../src/util/filesystem');

const scriptArgs = process.argv.slice(2);

const quickRespond = scriptArgs.includes('-qr');

function getTimoutTime() {
    let toss = Math.random();
    //try to get some granular RNG, tending to shorter times
    if (toss < 0.2) {
        toss = toss * 0.2;
    } else if (toss < 0.5) {
        toss = toss * 0.25;
    } else if (toss < 0.7) {
        toss = toss * 0.5;
    }
    return Math.round(toss * (2 * 60 * 1000));
}

function writeFiles(files, fileBase) {
    files.forEach(({name, filepath,}, index) => {
        const fileIndex = index + 1;
        const [base, extension,] = name.split('.');
        const filename = `${fileBase}_${fileIndex}_${files.length}_${base}.${extension}`;
        const fileTimeoutTime = Math.round(Math.random() * 500);
        setTimeout(() => {
            fs.copyFile(filepath, `${IMAGEFILES_OUTPUT_PATH}/${filename}`, err => {
                if (err) {
                    console.log('ERROR: ', err.message);
                    return;
                }
                console.log(`File ${filename} added with ${fileTimeoutTime}ms delay for ${fileBase}`);
            });
        }, fileTimeoutTime);
    });
}

async function handleRequest(req) {
    let status = 200;
    let response = 'OK';
    const q = url.parse(req.url, true);
    const fileBase = q.query.id;
    if (!fileBase) {
        return {status: 400, response: 'id param is required',};
    }
    const sourcePath = path.join(__dirname, 'test-data', 'v2-flat');
    const timeoutTime = quickRespond ? 5 : getTimoutTime();
    try {
        const files = await getFlattenedFiles(sourcePath);
        logger.info(`Creating ${files.length} files for ${fileBase} in ${Math.round(timeoutTime/1000)} seconds`);
        setTimeout(() => {
            writeFiles(files, fileBase);
        }, timeoutTime);
    } catch (e) {
        logger.error(e);
        status = 500;
        response = e.message;
    }
    return {status, response,};
}

const server = http.createServer(async function (req, res) {
    logger.info(`${req.method} - ${req.url}`);
    const {status, response,} = await handleRequest(req);
    res.writeHead(status, {'Content-Type': 'text/plain'});
    res.write(response);
    res.end();
}).listen(DFM_INPUT_PORT);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    logger.verbose('Listening on %s', bind);
}






