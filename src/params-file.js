const fs = require('fs');
const Promise = require('bluebird');

const LF = '\n';

const defaultParams = {
    Investment: 5,
    PortfolioSize: 3,
    HoldingPeriod: 3,
    ValidationPeriod: 8,
    PennyStocks: 2,
    GrowthPotential: 1,
    HedgePercentage: 3,
    BalanceRR: 1,
    Watchlists: 4,
    TransactionCosts: 1,
    LoanPercentage: 1,
    DividendTax: 3,
    DataProvider: 1,
};

function formatLine(value, key) {
    if (key) {
        return `${key}:${value}${LF}`;
    }
    return `${value}${LF}`;
}

class ParamsFile {

    constructor(id, params, options = {}) {
        this.id = id;
        this.params = {...defaultParams, ...params,};
        this.options = options;
    }

    render() {
        let output = LF;
        output += Object.keys(this.params).map(key => {
            return formatLine(this.params[key]);
        }).join('');
        output += LF;
        output += Object.keys(this.options).map(key => {
            return formatLine(this.options[key], key);
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