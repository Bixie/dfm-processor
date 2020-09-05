const fs = require('fs');
const path = require('path');

const LF = '\n';
const DLF = LF + LF;
const ParamsFileFull = require('../src/params-file-full');
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

md += '### Bestandsformaat' + DLF;
md += '*Bestandsnaam*: `dfm_preview[uniek_id]_[EN|NL].txt`' + DLF;
md += 'Het bestand is een standaard text-file met windows regeleinden. Per regel staat een `key=value` paar.' + DLF;
md += 'Eerst staat de provider en gebruikersinformatie vermeld:' + DLF;
md += '```' + LF;
md += 'PROV=Y' + LF;
md += 'licenseKey=DUMMY-12345-ABCDE-FGHIJ-67890' + LF;
md += 'userId=999' + LF;
md += 'email=user@example.com' + LF;
md += '```' + DLF;
md += 'Vervolgens na een lege regel de waarden van de parameters' + DLF;

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
md += '`dfm_preview5e91eab7ab8f0_NL.txt`' + DLF;

md += '```' + LF;
md += paramsFile.render();
md += '```' + DLF;

fs.writeFileSync(path.resolve(__dirname, `../PARAMETERS.md`), md);
