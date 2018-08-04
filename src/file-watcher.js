
const chokidar = require('chokidar');

let watcher;

function setupWatcher (path, onAddCallback) {
    // Initialize watcher.
    watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, //ignores .dotfiles
        persistent: true,
    });

    // 'add', 'addDir' and 'change' events also receive stat() results as second
    // argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
    watcher.on('add', onAddCallback);
    return watcher;
}

module.exports = {
    getWatcher: () => watcher,
    watch: (path, onAddCallback) => setupWatcher(path, onAddCallback),
    stop: () => watcher.close(),
};