const path = require('path');
const fs = require('fs');

const {DFM_APP_PATH,} = require('../config');
const {generateSvgsFromFiles,} = require('../src/graph/generator');
const {getFlattenedFiles,} = require('../src/util/filesystem');

//input
const sourcePath = path.join(DFM_APP_PATH, 'scripts', 'test-data', 'v2')
//get file-input
getFlattenedFiles(sourcePath)
    .then(files => {
        return generateSvgsFromFiles(files);
    })
    .then(results => {
        results.forEach(({name, svg,}) => fs.writeFileSync(path.join(DFM_APP_PATH, 'output', `${name}.svg`), svg));
    })
    .catch(e => console.error(e));

