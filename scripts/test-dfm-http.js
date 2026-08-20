/* eslint-disable no-console */
const {ENGINE_TARGETS, ZIPFILES_OUTPUT_PATH,} = require('../config');

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
    const q = url.parse(req.url, true);
    const id = q.query.id;
    const priceWeighting = q.query.RPWT;
    const benchMark = q.query.BVAL.split(';')[2];
    if (!id) {
        return {status: 400, response: 'id param is required',};
    }
    let data_folder = 'v2-';
    data_folder += Number(priceWeighting) === 1 ? 'usp-' : 'asp-';
    data_folder += Number(benchMark) === 1 ? 'djia' : 's_p';
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
        // Path only. The query carries LKEY, and src/router.js goes to the trouble
        // of keeping it out of this same logfile — see PROTOCOL.md §7.
        logger.info(`${req.method} - ${url.parse(req.url).pathname}`);
        const {status, response,} = await handler(req);
        res.writeHead(status, {'Content-Type': 'text/plain'});
        res.write(response);
        res.end();
    }).listen(port, '0.0.0.0');

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

/*
 * One listener, on the one engine target. There were two, CSI and Yahoo, both
 * answering identically — the fixtures under test-data/ are CSI captures either
 * way, so the second port only ever proved that the routing table had two rows.
 * Task 53 will add a second target for real, and it will be a second machine.
 *
 * The files go out under the engine's own names now (see src/util/filesystem.js):
 * normalising them here made the emulator's archives *unlike* the ones this is
 * standing in for, which is how the rename hid from every test that used it.
 */
createServer(ENGINE_TARGETS.main.port, handleRequest);