/* eslint-disable no-console */

const path = require('path');
const {Service,} = require('node-windows');
const {DFM_APP_PATH,} = require('../config');

// Create a new service object
const svc = new Service({
    name: 'dfm-processor',
    description: 'Monitor DFM parameter and output files.',
    script: path.join(DFM_APP_PATH, 'bin/www'),
});

// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install', () => {
    svc.start();
    console.log('Service installed and started');
});

svc.install();