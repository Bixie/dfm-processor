const fs = require('fs');
const path = require('path');

const LF = '\n';
const DLF = LF + LF;
const parameters = require('../../dfm-app/data/parameter-fields.json');

let userInfo = '';
let paramExample = '';
userInfo += 'licenseKey=DUMMY-12345-ABCDE-FGHIJ-67890' + LF;
userInfo += 'userId=999' + LF;
userInfo += 'email=user@example.com' + LF;

let md = '';
md += '# Parameters DFM Applicatie' + DLF;
md += 'Alle parameters en opties voor berekeningen met de DigifundManager' + DLF;

md += '### Bestandsformaat' + DLF;
md += '*Bestandsnaam*: `dfm_preview[uniek_id]_[EN|NL].txt`' + DLF;
md += 'Het bestand is een standaard text-file met windows regeleinden. Per regel staat een key=value paar.' + DLF;
md += 'Eerst staat de gebruikersinformatie vermeld:' + DLF;
md += '```' + LF;
md += userInfo;
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
    paramExample += `${key}=${field.default}${LF}`;
});

md += '### Voorbeeld met standaardwaarden' + DLF;
md += '`dfm_preview5e91eab7ab8f0_NL.txt`' + DLF;

md += '```' + LF;
md += userInfo;
md += LF;
md += paramExample;
md += '```' + DLF;

fs.writeFileSync(path.resolve(__dirname, `../PARAMETERS.md`), md);
