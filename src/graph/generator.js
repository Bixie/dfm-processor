const fs = require('fs');
const Papa = require('papaparse');

const graphDefinitions = require('./definitions');
const GraphFromCsvs = require('./from-csvs');
const Svg = require('./svg');

const graphNames = Object.keys(graphDefinitions);
const graphNamesRegex = new RegExp(`^(${graphNames.join('|')})_`);

function readFolderCsvs(filemap, filenames = []) {
    const promises = [];
    filenames.forEach(filename => {
        if (filemap[filename] === undefined) {
            return;
        }
        promises.push(new Promise((resolve, reject) => {
            Papa.parse(fs.createReadStream(filemap[filename]), {
                delimiter: "\t",
                complete: results => resolve({results, filename,}),
                error: reject,
            });
        }));
    });
    return promises;
}

function createSvgFromCsv(name, graphDefinition, filemap) {
    return new Promise((resolve, reject) => {
        Promise.all(readFolderCsvs(filemap, graphDefinition.dataSets.map(d => d.filename)))
            .then(results => {
                if (!results.length) {
                    reject(`No data for graph ${name}`);
                    return;
                }
                //get the data from the csv files
                const graph = new GraphFromCsvs(results, graphDefinition);
                //build the svg
                const svg = (new Svg(graphDefinition, name))
                    .setGraphData(graph);

                resolve({name, svg: svg.getHtml(),});
            })
            .catch(reject);
    });
}

function getFilemapsPerGraph(files) {
    const filemapsPerGraph = {};
    for (let i = 0; i < files.length; i++) {
        let m = graphNamesRegex.exec(files[i].name);
        if (m) {
            filemapsPerGraph[m[1]] = filemapsPerGraph[m[1]] || {};
            filemapsPerGraph[m[1]][files[i].name] = files[i].filepath;
        }
    }
    return filemapsPerGraph;
}

function generateSvgsFromFiles(files) {
    //do we have graph files in the output?
    const filemapsPerGraph = getFilemapsPerGraph(files);
    return Promise.all(
        Object.entries(filemapsPerGraph)
            .map(([name, filemap,]) => createSvgFromCsv(name, graphDefinitions[name], filemap))
    );
}

function prepareDfmOutput(files) {
    //@legacy
    if (files.every(({name}) => name.includes('.png'))) {
        files = files.map((f, index) => ({...f, name: `output_${index + 1}`,}));
        return Promise.resolve(files);
    }
    return new Promise((resolve, reject) => {
        generateSvgsFromFiles(files)
            .then(results => {
                resolve(files
                    .filter(f => !f.name.match(graphNamesRegex))
                    .concat(results.map(({name, svg,}) => ({name: `${name}.svg`, contents: svg,})))
                );
            })
            .catch(reject);
    });
}

module.exports = {
    generateSvgsFromFiles,
    prepareDfmOutput,
};
