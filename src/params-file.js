const fs = require('fs');
const Promise = require('bluebird');

const LF = '\r\n';

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

const safeValues = [5, 5, 3, 8, 2, 1, 5, 1, 2, 1, 1, 4, 1,];

function formatLine(value, key) {
    if (key) {
        return `${key}:${value}`;
    }
    return value;
}

class ParamsFile {

    constructor(id, params, options = {}) {
        this.id = id;
        this.params = {};
        //we can just test for falsy value, since the indices are 1 based
        Object.entries(defaultParams)
            .forEach(([key, defaultValue,]) => this.params[key] = params[key] || defaultValue);
        this.options = options;
    }

    render() {
        //for now return a file with values DFM won't crash on
        return safeValues.map(val =>formatLine(val)).join(LF);

        let output = '';
        output += Object.keys(this.params).map(key => {
            return formatLine(this.params[key]);
        }).join(LF);
        output += LF;
        output += Object.keys(this.options).map(key => {
            return formatLine(this.options[key], key);
        }).join(LF);
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