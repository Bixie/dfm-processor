const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const GraphFromCsvs = require('./from-csvs');
const Svg = require('./svg');

function readFolderCsvs(srcPath, filenames = []) {
    const promises = [];
    fs.readdirSync(srcPath)
        .filter(f => (!filenames.length || filenames.includes(f)))
        .forEach(file => {
            promises.push(new Promise((resolve, reject) => {
                Papa.parse(fs.createReadStream(path.join(srcPath, file)), {
                    delimiter: "\t",
                    complete: results => resolve({results, file,}),
                    error: reject,
                });
            }));
        });
    return promises;
}

function createSvgFromCsv(graphDefinition, name) {
    return new Promise((resolve, reject) => {
        Promise.all(readFolderCsvs(graphDefinition.srcPath, graphDefinition.dataSets.map(d => d.filename)))
            .then(results => {
                //get the data from the csv files
                const graph = new GraphFromCsvs(results, graphDefinition);
                //build the svg
                const svg = (new Svg(graphDefinition))
                    .addAxes(graph)
                    .addGraphData(graph);

                resolve({name, svg: svg.getHtml(),});
            })
            .catch(reject)
    });
}

function generateSvgsFromDefinitions(graphDefinitions) {
     return Promise.all(
        Object.entries(graphDefinitions).map(([name, graphDefinition,]) => createSvgFromCsv(graphDefinition, name))
     );
}

module.exports = generateSvgsFromDefinitions;
