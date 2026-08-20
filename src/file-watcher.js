const fs = require('fs');
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
 */
function setupWatcher (path, onAddCallback) {
    // Initialize watcher.
    const watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, //ignores .dotfiles
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
    watchSingle: (path, onAddCallback) => setupWatcher(path, onAddCallback),
    remove,
    move,
};
