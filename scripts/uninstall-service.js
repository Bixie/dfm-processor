/* eslint-disable no-console */

const path = require('path');
const {Service,} = require('node-windows');
const {DFM_APP_PATH,} = require('../config');

// Create a new service object
const svc = new Service({
    name: 'dfm-processor',
    description: 'Monitor DFM parameter and input files.',
    script: path.join(DFM_APP_PATH, 'bin/www'),
});

// Listen for the 'uninstall' event so we know when it's done.
svc.on('uninstall', () => {
    console.log('The service exists: ',svc.exists);
    console.log('Uninstall complete.');
});

// Uninstall the service.
svc.uninstall();