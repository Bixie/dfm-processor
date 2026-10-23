const fs = require('fs');
const nodePath = require('path');
const {logger,} = require('./util/winston');

const chokidar = require('chokidar');

//the filewatcher instances
const watchers = {};

/**
 * Watch a directory and call back for every file that appears in it.
 *
 * chokidar emits `add` for the files already present when the watch starts, not
 * only for new ones. That is deliberate here: an archive still lying in the
 * watched directory is one whose delivery did not finish, and a restart of this
 * process retries it. See PROTOCOL.md §5.
 *
 * The grouped variant — a watcher that assembled loose per-chart files into a
 * complete set by parsing counts out of their filenames — went with the v1 output
 * format in task 23. The engine has written one zip per calculation since 2020,
 * and nothing had called the grouped watcher in as long.
 *
 * `accept` is given a basename and decides which files are watched at all, not
 * merely which ones reach the callback. The difference matters on Windows: the
 * engine composes its archive as `temp.zip` in the same directory and holds it
 * open while it writes, and fs.watch() on a file another process has locked
 * throws EBUSY. Filtering after the `add` event was too late — the watch had
 * already been attempted, and the error took the process down.
 */
function setupWatcher (path, onAddCallback, accept = () => true) {
    const root = nodePath.resolve(path);
    const watcher = chokidar.watch(path, {
        // Called with and without stats, for the root too, so the root is exempt
        // by path rather than by type. depth 0 means nothing below it is reached.
        ignored: filepath => {
            if (nodePath.resolve(filepath) === root) {
                return false;
            }
            const name = nodePath.basename(filepath);
            return name.startsWith('.') || !accept(name);
        },
        depth: 0,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
        },
    });
    //bind listener for new files
    watcher.on('add', filepath => {
        logger.verbose('Calling callback for file %s', filepath);
        onAddCallback(filepath);
    });
    // An FSWatcher with no 'error' listener throws, and that ends the process
    // and every delivery waiting in it. chokidar carries on after reporting, so
    // logging is the whole of the handling.
    watcher.on('error', err => {
        logger.error('File watcher error on %s: %s', err.path || path, err.message);
    });
    watchers[path] = watcher;
    return watcher;
}

function remove (filepath) {
    return fs.promises.unlink(filepath);
}

/**
 * Move a delivered archive out of the watched directory.
 *
 * This replaces `cleanup(zipFilepath, buffer, files)`, which wrote a zip this
 * process had built and then deleted the loose files it was built from. Nothing
 * is built here any more — the engine's own archive is forwarded byte for byte —
 * so all that is left of it is getting the file out of the watched directory, and
 * the destination is what says the delivery succeeded.
 *
 * rename() is atomic but fails with EXDEV across filesystems, which the two paths
 * are free to be: on the mini-PC they are both local, on ddev they are separate
 * bind mounts. Copy-then-unlink is the fallback rather than the default because a
 * half-copied archive in the sent directory would look like a delivery.
 */
async function move (from, to) {
    try {
        await fs.promises.rename(from, to);
    } catch (err) {
        if (err.code !== 'EXDEV') {
            throw err;
        }
        await fs.promises.copyFile(from, to);
        await fs.promises.unlink(from);
    }
}

module.exports = {
    getWatcher: (path = null) => path ? watchers[path] : watchers,
    watchSingle: (path, onAddCallback, accept) => setupWatcher(path, onAddCallback, accept),
    remove,
    move,
};
