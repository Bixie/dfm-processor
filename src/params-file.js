const fs = require('fs');
const Promise = require('bluebird');

const LF = '\n';
const TAB = '\t';

const PREVIEW_ID_KEY = 'ClientName';

const defaultParams = {
    Investment: 48,
    PortfolioSize: 12,
    HoldingPeriod: 13,
    ValidationPeriod: 30,
    PennyStocks: 'No',
    GrowthPotential: 'Yes',
    HedgePercentage: 0,
    BalanceRR: 'MinimizeRisk/Reward',
    Watchlists: 'Safe',
    TransactionCosts: 0,
    LoanPercentage: 0,
    DividendTax: 15,
    DataProvider: 'CSI',
};

function formatLine(key, value) {
    const tabs = key.length > 15 ? TAB : TAB + TAB;
    return `${key}${tabs}${value}${LF}`;
}

class ParamsFile {

    constructor(id, params, options = {}) {
        this.id = id;
        this.params = {...defaultParams, ...params,};
        this.options = options;
    }

    render() {
        let output = LF;
        output += formatLine(PREVIEW_ID_KEY, this.id);
        output += LF;
        output += Object.keys(this.params).map(key => {
            return formatLine(key, this.params[key]);
        }).join('');
        output += LF;
        output += Object.keys(this.options).map(key => {
            return formatLine(key, this.options[key]);
        }).join('');
        return output;
    }

    write(folderpath) {
        return new Promise((resolve, reject) => {
            const filename = `${folderpath}/${this.id}.txt`;
            fs.writeFile(filename, this.render(), err => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }
}

module.exports = ParamsFile;