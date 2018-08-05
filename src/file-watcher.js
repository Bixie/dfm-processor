
const chokidar = require('chokidar');

let watcher;

function setupWatcher (path, onAddCallback) {
    // Initialize watcher.
    watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, //ignores .dotfiles
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
        },
    });
    //bind listener for new files
    watcher.on('add', onAddCallback);
    return watcher;
}

module.exports = {
    getWatcher: () => watcher,
    watch: (path, onAddCallback) => setupWatcher(path, onAddCallback),
    stop: () => watcher.close(),
};