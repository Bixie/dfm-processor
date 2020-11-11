const Papa = require('papaparse');

const graphDefinitions = require('./definitions');
const GraphFromCsvs = require('./from-csvs');
const Svg = require('./svg');

const graphFiles = {};
Object.entries(graphDefinitions).forEach(([name, definition,]) => {
    definition.dataSets.forEach(ds => {
        graphFiles[ds.filename] = graphFiles[ds.filename] || [];
        graphFiles[ds.filename].push(name);
    });
});

function readCsvs(filemap, filenames = []) {
    const promises = [];
    filenames.forEach(filename => {
        if (filemap[filename] === undefined) {
            return;
        }
        promises.push(new Promise((resolve, reject) => {
            Papa.parse(filemap[filename], {
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
        Promise.all(readCsvs(filemap, graphDefinition.dataSets.map(d => d.filename)))
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
    const filenames = Object.keys(graphFiles);
    for (let i = 0; i < files.length; i++) {
        if (filenames.includes(files[i].name)) {
            graphFiles[files[i].name].forEach(name => {
                filemapsPerGraph[name] = filemapsPerGraph[name] || {};
                filemapsPerGraph[name][files[i].name] = files[i].contents;
            });
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
    const filenames = Object.keys(graphFiles);
    return new Promise((resolve, reject) => {
        generateSvgsFromFiles(files)
            .then(results => {
                resolve(files
                    .filter(f => !filenames.includes(f.name))
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
