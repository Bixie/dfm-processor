const fs = require('fs');
const {keyBy, groupBy, mapValues,} = require('lodash');
const Promise = require('bluebird');
const {transformParameter,} = require('./params-transform');
const outputFormats = require('./params-outputformat');

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
    IncludeWeightingLargerThan: '0.1',
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
    userId: '',
    email: '',
};

function formatLine(key, value) {
    return `${key}=${value}${LF}`;
}

class ParamsFileFull {

    constructor(id, params, options = {}) {
        this.id = id;
        this.params = {...defaultParams, ...params,};
        this.options = {...defaultOptions, ...options,};
        this.data = this.transformData();
    }

    transformData() {
        const transformed = [
            ...Object.entries(this.params),
            ...Object.entries(this.options),
        ].map(([name, value,]) => {
            const {key, formatted,} = transformParameter(name, value);
            return {name, key, formatted, raw: value,}
        });
        return mapValues(groupBy(transformed, 'key'), v => keyBy(v,'name'));
    }

    render() {
        let output = '';
        Object.entries(outputFormats).forEach(([key, formatter,]) => {
            output += formatLine(key, formatter(this.data[key]));
        });
        return output;
    }

    write(folderpath) {
        const language = this.options.locale === 'nl-NL' ? 'NL' : 'EN';
        return new Promise((resolve, reject) => {
            const filename = `${folderpath}/${this.id}_${language}.txt`;
            fs.writeFile(filename, this.render(), err => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }
}

module.exports = ParamsFileFull;
