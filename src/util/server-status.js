//https://www.npmjs.com/package/node-server-status
const config = require('../../package.json');

const ServerStatus = (() => {

    const status = {
        status: 200,
    };
    const setUpTime = () => {
        if (typeof process.uptime !== 'function') {
            return;
        }
        const parsedUpTime = parseInt(process.uptime());
        if (isNaN(parsedUpTime)) {
            return;
        }
        const hours = parseInt(parsedUpTime / 3600);
        const minutes = parseInt((parsedUpTime % 3600) / 60);
        const seconds = (parsedUpTime % 3600) % 60;
        let upTime = '';
        if (hours) {
            upTime += hours + 'h ';
        }
        if (minutes){
            upTime += minutes + 'm ';
        }
        upTime += seconds + 's';
        status.upTime = upTime;
    };
    const setMemoryUsage = () => {
        if (typeof process.memoryUsage === 'function') {
            const memory = process.memoryUsage();
            const rssInMb = (memory.rss / 1024) / 1024;
            const heapTotalInMb = (memory.heapTotal / 1024) / 1024;
            const heapUsedInMb = (memory.heapUsed / 1024) / 1024;
            status.memoryUsage = {};
            if (!isNaN(rssInMb)) {
                status.memoryUsage.rss = rssInMb.toFixed(2) + 'mb';
            }
            if (!isNaN(heapTotalInMb)) {
                status.memoryUsage.heapTotal = heapTotalInMb.toFixed(2) + 'mb';
            }
            if (!isNaN(heapUsedInMb)) {
                status.memoryUsage.heapUsed = heapUsedInMb.toFixed(2) + 'mb';
            }
        }
    };
    const setCpuUsage = () => {
        if (typeof process.cpuUsage === 'function') {
            const cpuUsage = process.cpuUsage();
            const userCpu = cpuUsage.user / 1000000;
            const systemCpu = cpuUsage.system / 1000000;
            if (isNaN(userCpu)) {
                return;
            }
            if (isNaN(systemCpu)) {
                return;
            }
            status.cpuUsage = {
                user: userCpu + 's',
                system: systemCpu + 's',
            };
        }
    };
    function ServerStatus() {
        if (config.version) {
            status.appVersion = config.version;
        }
        if (process.version) {
            status.nodeVersion = process.version.substring(1);
        }
    }
    ServerStatus.prototype.getStatus = function() {
        setUpTime();
        setMemoryUsage();
        setCpuUsage();
        return status;
    };
    return ServerStatus;
})();
module.exports = ServerStatus;
