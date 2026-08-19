/**
 * Render the SVGs for one or more test-data folders, straight to disk.
 *
 * This is the golden-output capture for the port of src/graph/ into the WordPress
 * plugin's calculator app (docs/port-plan.md task 50). What d3 5 + jsdom produce
 * from these fixtures is the specification the browser has to reproduce, class
 * name for class name and path for path.
 *
 * It never worked as committed: sourcePath pointed at `scripts/test-data/v2`,
 * which has not existed since the fixtures were split per data folder, and it
 * built that path from DFM_APP_PATH, so it only ever ran on the Windows machine.
 * Both are fixed - folders come from argv (all of them by default), paths from
 * __dirname.
 *
 *   node scripts/build-svg.js                 # every v2-* folder
 *   node scripts/build-svg.js v2-asp-djia     # one
 *
 * Output goes to output/<folder>/<chart>.svg.
 */
const path = require('path');
const fs = require('fs');

const {generateSvgsFromFiles,} = require('../src/graph/generator');
const {getFlattenedFiles,} = require('../src/util/filesystem');

const dataPath = path.join(__dirname, 'test-data');
const outputPath = path.join(__dirname, '..', 'output');

const folders = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs.readdirSync(dataPath).filter(name => name.startsWith('v2-'));

async function buildFolder(folder) {
    //getFlattenedFiles gives {name, filepath} for the zip writer, which streams;
    //the generator reads .contents, so the file has to be read here.
    const files = (await getFlattenedFiles(path.join(dataPath, folder)))
        .map(({name, filepath,}) => ({name, contents: fs.readFileSync(filepath, 'utf8'),}));
    const results = await generateSvgsFromFiles(files);
    const target = path.join(outputPath, folder);
    fs.mkdirSync(target, {recursive: true,});
    results.forEach(({name, svg,}) => fs.writeFileSync(path.join(target, `${name}.svg`), svg));
    console.log(`${folder}: ${results.length} charts`);
}

(async () => {
    for (const folder of folders) {
        await buildFolder(folder);
    }
})().catch(e => {
    console.error(e);
    process.exitCode = 1;
});
