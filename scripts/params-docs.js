const fs = require('fs');
const path = require('path');

const LF = '\n';
const DLF = LF + LF;
const ParamsFileFull = require('../src/params/params-file-full');
const parameters = require('../../dfm-app/data/parameter-fields.json');
const params = {};
Object.entries(parameters).forEach(([key, field,]) => {
    params[key] = field.default;
});
const paramsFile = new ParamsFileFull('dfm_preview5e91eab7ab8f0', params, {
    licenseKey: 'DUMMY-12345-ABCDE-FGHIJ-67890',
    userId: '999',
    email: 'user@example.com',
});

let md = '';
md += '# Parameters DFM Applicatie' + DLF;
md += 'Alle parameters en opties voor berekeningen met de DigifundManager' + DLF;

md += '### Parameters' + DLF;

md += '|Key|Default|Options|' + LF;
md += '|---|---|---|' + LF;
Object.entries(parameters).forEach(([key, field,]) => {
    let options = '`0`, `1`';
    if (field.options.length) {
        options = field.options.map(o => '`' + o + '`').join(', ')
    }
    md += `|${key}|${field.default}|${options}|${LF}`;
});
md += LF;

md += '### Voorbeeld met standaardwaarden' + DLF;

md += '```' + LF;
md += paramsFile.render();
md += '```' + DLF;

md += 'As query string' + DLF;

md += '```' + LF;
md += paramsFile.queryString() + LF;
md += '```' + DLF;

fs.writeFileSync(path.resolve(__dirname, `../PARAMETERS.md`), md);
