const path = require('path');
const fs = require('fs');

const {DFM_APP_PATH,} = require('../config');
const generateSvgsFromDefinitions = require('../src/graph/generator');

//input
const graphDefinitions = {
    ChartCompound: {
        viewBox: {width: 975, height: 500,},
        margin: {top: 10, right: 10, bottom: 30, left: 50,},
        srcPath: path.join(DFM_APP_PATH, 'import', 'ChartCompound'),
        dataSets: [
            {
                filename: 'Equ.W (F).txt',
                className: 'chart_compound equw_f',
                color: 'red',
            },
            {
                filename: 'Equ.W (M).txt',
                className: 'chart_compound equw_m',
                color: 'blue',
            },
            {
                filename: 'Pr.W[ASP] (M).txt',
                className: 'chart_compound prw_m',
                color: 'purple',
            },
            {
                filename: 'Random500 (F).txt',
                className: 'chart_compound random500_f',
                color: 'darkblue',
            },
            {
                filename: 'S&P500.txt',
                className: 'chart_compound sandp500',
                color: 'orange',
            },
        ],
    },
    ChartConstant: {
        viewBox: {width: 975, height: 500,},
        margin: {top: 10, right: 10, bottom: 30, left: 50,},
        srcPath: path.join(DFM_APP_PATH, 'import', 'ChartConstant'),
        dataSets: [
            {
                filename: 'Equ.W (M) cashflow.txt',
                className: 'chart_constant equw_m_cashflow',
                color: 'red',
            },
            {
                filename: 'Equ.W (M) net liquidation value.txt',
                className: 'chart_constant equw_m_net_liquidation',
                color: 'blue',
            },
            {
                filename: 'Opt.W cashflow.txt',
                className: 'chart_constant optw_cashflow',
                color: 'purple',
            },
            {
                filename: 'Opt.W net liquidation value.txt',
                className: 'chart_constant optw_net_liquidation',
                color: 'darkblue',
            },
            {
                filename: 'Pr.W[ASP] (M) cashflow.txt',
                className: 'chart_constant prw_m_cashflow',
                color: 'orange',
            },
            {
                filename: 'Pr.W[ASP] (M) net liquidation value.txt',
                className: 'chart_constant prw_m_net_liquidation',
                color: 'pink',
            },
            {
                filename: 'S&P500 cashflow.txt',
                className: 'chart_constant sandp500_cashflow',
                color: 'magenta',
            },
        ],
    },
    ChartMiscellaneous: {
        viewBox: {width: 975, height: 500,},
        margin: {top: 10, right: 10, bottom: 30, left: 50,},
        srcPath: path.join(DFM_APP_PATH, 'import', 'ChartMiscellaneous'),
        dataSets: [
            {
                filename: 'StocksBeforeRanking.txt',
                className: 'chart_compound stocks_before_ranking',
                color: 'red',
            },
            {
                filename: 'StocksRequired.txt',
                className: 'chart_compound stocks_required',
                color: 'blue',
            },
            {
                filename: 'Volatility.txt',
                className: 'chart_compound volatility',
                color: 'purple',
            },
        ],
    },
};


//run it
generateSvgsFromDefinitions(graphDefinitions)
    .then(results => {
        results.forEach(({name, svg,}) => fs.writeFileSync(path.join(DFM_APP_PATH, 'import', `${name}.svg`), svg));
    })
    .catch(e => console.error(e));
