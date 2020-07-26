
const transforms = {
    DataProvider: {
        key: () => 'PROV',
        format: firstAsCapital,
    },
    IncludeInactive: {
        key: () => 'DINA',
    },
    Benchmark: {
        key: () => 'DBEN',
        format: firstAsCapital,
    },
    Watchlists: {
        key: () => 'WLID',
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
        key: () => 'STRP',
        format: zeroForNA,
    },
    Ranking: {
        key: () => 'SRNK',
        format: value => zeroOrFormatted(value, firstAsCapital),
    },
    ShortCorrelation: {
        key: () => 'SSCO',
        format: zeroForNA,
    },
    LongCorrelation: {
        key: () => 'SLCO',
        format: zeroForNA,
    },
    Investment: {
        key: () => 'BINV',
        format: cleanNumber,
    },
    PortfolioSize: {
        key: () => 'RPFS',
        format: cleanNumber,
    },
    LongShort: {
        key: () => 'RTRD',
        format: value => {
            value = value === 'Long/short' ? 'H' : value;
            return firstAsCapital(value);
        },
    },
    HoldingPeriod: {
        key: () => 'RHPD',
        format: value => {
            value = value === 'hold' ? '9999' : value;
            return cleanNumber(value);
        },
    },
    ValidationPeriod: {
        key: () => 'RVAL',
        format: cleanNumber,
    },
    InvestementObjective: {
        key: () => 'RIOB',
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
    PriceWeighing: {
        key: () => 'RPWE',
        format: value => zeroOrFormatted(value, firstAsCapital),
    },
    HedgePercentage: {
        key: () => 'RHED',
        format: value => zeroOrFormatted(value, cleanNumber),
    },
    LowerBound: {
        key: () => 'RLBO',
        format: value => zeroOrFormatted(value, cleanNumber),
    },
    SetupPeriod: {
        key: () => 'RSET',
        format: zeroForNA,
    },
    WeightInterval: {
        key: () => 'RINT',
        format: zeroForNA,
    },
    OptimalizationTechnique: {
        key: () => 'ROPT',
        format: value => zeroOrFormatted(value, firstAsCapital),
    },
    TransactionCosts: {
        key: () => 'BRTC',
        format: cleanNumber,
    },
    LoanPercentage: {
        key: () => 'BLOA',
        format: cleanNumber,
    },
    DividendTax: {
        key: () => 'BDIV',
        format: cleanNumber,
    },
};

function firstAsCapital(value) {
    return value.substr(0, 1).toUpperCase();
}

function minMaxValues(value) {
    if (zeroForNA(value) === 0) {
        return '0;0;0;0';
    }
    const [min, max, sort, nr,] = value.split(';');
    return [
        cleanNumber(min),
        cleanNumber(max),
        zeroOrFormatted(value, firstAsCapital),
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
    const format = transforms[name] && transforms[name].format ? transforms[name].format(value, name) : value;
    return `${key}=${format}`;
}

module.exports = {
    transformParameter,
};
