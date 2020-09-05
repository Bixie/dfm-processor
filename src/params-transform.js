
const transforms = {
    DataProvider: {
        key: () => 'PROV',
        format: firstAsCapital,
    },
    IncludeInactive: {
        key: () => 'BVAL',
        format: value => value ? 'I' : '',
    },
    Benchmark: {
        key: () => 'BVAL',
        format: firstAsCapital,
    },
    TradingLiquidity: {
        key: () => 'STLI',
        format: minMaxValues,
    },
    HistoricalPrice: {
        key: () => 'SHSP',
        format: minMaxValues,
    },
    AdjustedPrice: {
        key: () => 'SASP',
        format: minMaxValues,
    },
    MARRatio: {
        key: () => 'SMAR',
        format: minMaxValues,
    },
    Trend: {
        key: () => 'STRD',
        format: minMaxValues,
    },
    TrendPeriod: {
        key: () => 'STRD',
        format: zeroForNA,
    },
    Ranking: {
        key: () => 'SRNK',
        format: value => zeroOrFormatted(value, firstAsCapital),
    },
    ShortCorrelation: {
        key: () => 'SRNK',
        format: zeroForNA,
    },
    LongCorrelation: {
        key: () => 'SRNK',
        format: zeroForNA,
    },
    PortfolioSize: {
        key: () => 'RPFS',
        format: cleanNumber,
    },
    HoldingPeriod: {
        key: () => 'RHPD',
        format: value => {
            value = value === 'hold' ? '-1' : value; //unknown hold value
            return cleanNumber(value);
        },
    },
    LongShort: {
        key: () => 'RTRD',
        format: value => {
            value = value === 'Long/short' ? 'H' : value;
            return firstAsCapital(value);
        },
    },
    HedgePercentage: {
        key: () => 'RTRD',
        format: value => zeroOrFormatted(value, cleanNumber),
    },
    ValidationPeriod: {
        key: () => 'BVAL',
        format: cleanNumber,
    },
    PriceWeighing: {
        key: () => 'RPWT',
        format: value => zeroOrFormatted(value, firstAsCapital),
    },
    InvestementObjective: {
        key: () => 'ROWT',
        format: value => {
            return {
                'N/A': '0',
                'MaxMAR': 'M',
                'MinRisk': 'K',
                'MaxProfits': 'D',
                'NoOptimization': '0',
            }[value];
        },
    },
    SetupPeriod: {
        key: () => 'ROWT',
        format: zeroForNA,
    },
    WeightInterval: {
        key: () => 'ROWT',
        format: zeroForNA,
    },
    IncludeWeightingLargerThan: {
        key: () => 'ROWT',
        format: value => zeroOrFormatted(value, cleanNumber),
    },
    OptimalizationTechnique: {
        key: () => 'ROWT',
        format: value => zeroOrFormatted(value, firstAsCapital),
    },
    Watchlists: {
        key: () => 'WLID',
        format: value => value,
    },
    TransactionCosts: {
        key: () => 'BROK',
        format: cleanNumber,
    },
    LoanPercentage: {
        key: () => 'BROK',
        format: cleanNumber,
    },
    DividendTax: {
        key: () => 'BROK',
        format: cleanNumber,
    },
    Investment: {
        key: () => 'BINV',
        format: cleanNumber,
    },
};

function firstAsCapital(value) {
    return value.substr(0, 1).toUpperCase();
}

function minMaxValues(value) {
    if (zeroForNA(value) === 0) {
        return '0;0;0;0;0';
    }
    const [min, max, sort, nr,] = value.split(';');
    return [
        1,
        cleanNumber(min),
        cleanNumber(max),
        zeroOrFormatted(sort, firstAsCapital),
        zeroForNA(nr),
    ].join(';');
}

function zeroOrFormatted(value, formatter) {
    return zeroForNA(value) === 0 ? 0 : formatter(value);
}

function zeroForNA(value) {
    return value === 'N/A' ? 0 : value;
}

function cleanNumber(value) {
    return String(value).replace(/[^0-9\.\-]/g, '');
}

function transformParameter(name, value) {
    const key = transforms[name] && transforms[name].key ? transforms[name].key(name) : name;
    const formatted = transforms[name] && transforms[name].format ? transforms[name].format(value, name) : value;
    return {key, formatted,};
}

module.exports = {
    transformParameter,
};
