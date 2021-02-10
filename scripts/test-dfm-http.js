/* eslint-disable no-console */
const {DFM_INPUT_PORT_CSI, DFM_INPUT_PORT_YAHOO, ZIPFILES_OUTPUT_PATH,} = require('../config');

const path = require('path');
const http = require('http');
const url = require('url');
const {logger,} = require('../src/util/winston');
const {createZipFile,} = require('../src/util/archiver');

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

async function handleRequest(req) {
    let status = 200;
    let response = 'OK';
    let data_folder = 'v2-asp';
    const q = url.parse(req.url, true);
    const id = q.query.id;
    const priceWeighting = q.query.RPWT;
    const benchMark = q.query.BVAL.substring(4,5);
    if (!id) {
        return {status: 400, response: 'id param is required',};
    }
    if (Number(priceWeighting) === 1) {
        data_folder = 'v2-usp';
    }
    if (Number(benchMark) === 1) {
        data_folder = 'v2-djia';
    }
    const sourcePath = path.join(__dirname, 'test-data', data_folder);
    const filename = `${id}.zip`;
    const timeoutTime = quickRespond ? 5 : getTimoutTime();
    try {
        const files = await getFlattenedFiles(sourcePath);
        logger.info(`Creating ${files.length} files from /${data_folder} for ${id} in ${Math.round(timeoutTime/1000)} seconds`);
        setTimeout(async () => {
           const zipPath = await createZipFile(files, `${ZIPFILES_OUTPUT_PATH}/${filename}`);
           logger.info(`Zipfile ${zipPath} written`);
        }, timeoutTime);
    } catch (e) {
        logger.error(e);
        status = 500;
        response = e.message;
    }
    return {status, response,};
}
function createServer(port, handler) {
    const server = http.createServer(async function (req, res) {
        logger.info(`${req.method} - ${req.url}`);
        const {status, response,} = await handler(req);
        res.writeHead(status, {'Content-Type': 'text/plain'});
        res.write(response);
        res.end();
    }).listen(port);

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
    return server;
}

createServer(DFM_INPUT_PORT_CSI, handleRequest);
createServer(DFM_INPUT_PORT_YAHOO, handleRequest);
