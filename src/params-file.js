const fs = require('fs');
const Promise = require('bluebird');

const LF = '\r\n';

const defaultParams = {
    DataProvider: 'CSI',
    IncludeInactive: 1,
    Benchmark: 'SP500',
    Watchlists: 'Safe',
    TradingLiquidity: '1',
    HistoricalPrice: '5',
    AdjustedPrice: '0.5',
    MARRatio: 'N/A',
    Trend: 'N/A',
    TrendPeriod: 'N/A',
    Ranking: 'reversing',
    ShortCorrelation: 'N/A',
    LongCorrelation: 'N/A',
    Investment: 48,
    PortfolioSize: 12,
    LongShort: 'Long',
    HoldingPeriod: '13',
    ValidationPeriod: 30,
    InvestementObjective: 'MaxMAR',
    PriceWeighing: 'Adjusted',
    HedgePercentage: 35,
    LowerBound: '0.1',
    SetupPeriod: 9,
    WeightInterval: 1,
    OptimalizationTechnique: 'LongThenShort',
    TransactionCosts: '4',
    LoanPercentage: '0.5',
    DividendTax: '15'
};

const defaultOptions = {
    width: 1200,
    layout: 'default',
    locale: 'nl-NL',
    licenseKey: '',
};

function formatLine(value, key) {
    if (key) {
        return `${key}:${value}`;
    }
    return value;
}

class ParamsFile {

    constructor(id, params, options = {}) {
        this.id = id;
        this.params = {...defaultParams, ...params,};
        this.options = {...defaultOptions, ...options,};
    }

    render() {
        let output = '';
        output += Object.keys(this.params).map(key => {
            return formatLine(this.params[key], key);
        }).join(LF);
        // output += LF;
        // output += Object.keys(this.options).map(key => {
        //     return formatLine(this.options[key], key);
        // }).join(LF);
        return output;
    }

    write(folderpath) {
        const language = this.options.locale === 'nl-NL' ? 'NL' : 'EN';
        return new Promise((resolve, reject) => {
            const filename = `${folderpath}/${this.id}_${language}_${this.options.licenseKey}.txt`;
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
