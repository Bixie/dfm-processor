module.exports = {
    chart_compound: {
        viewBox: {width: 750, height: 400,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'chart_compound_equ_w_f.txt',
                className: 'equ_w_f',
                color: '#95b2c0',
            },
            {
                filename: 'chart_compound_equ_w_m.txt',
                className: 'equ_w_m',
                color: '#d98f8b',
            },
            {
                filename: 'chart_compound_pr_w_asp_m.txt',
                className: 'pr_w_asp_m',
                color: '#b4aea3',
            },
            {
                filename: 'chart_compound_random_500_f.txt',
                className: 'random_500_f',
                color: '#c2c383',
            },
            {
                filename: 'chart_compound_s_p_500.txt',
                className: 's_p_500',
                color: '#e0b093',
            },
        ],
    },
    chart_constant: {
        viewBox: {width: 750, height: 400,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_constant_equ_w_m_cashflow.txt',
                className: 'equ_w_m_cashflow',
                color: '#95b2c0',
            },
            {
                filename: 'chart_constant_equ_w_m_net_liquidation_value.txt',
                className: 'equ_w_m_net_liquidation_value',
                color: '#d98f8b',
            },
            {
                filename: 'chart_constant_opt_w_cashflow.txt',
                className: 'opt_w_cashflow',
                color: '#b4aea3',
            },
            {
                filename: 'chart_constant_opt_w_net_liquidation_value.txt',
                className: 'opt_w_net_liquidation_value',
                color: '#c2c383',
            },
            {
                filename: 'chart_constant_pr_w_asp_m_cashflow.txt',
                className: 'pr_w_asp_m_cashflow',
                color: '#e0b093',
            },
            {
                filename: 'chart_constant_pr_w_asp_m_net_liquidation_value.txt',
                className: 'prw_m_net_liquidation',
                color: '#8a8a8a',
            },
            {
                filename: 'chart_constant_s_p_500_cashflow.txt',
                className: 'sandp500_cashflow',
                color: '#fbd6a9',
            },
        ],
    },
    chart_miscellaneous: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_miscellaneous_stocks_before_ranking.txt',
                className: 'stocks_before_ranking',
                color: '#95b2c0',
            },
            {
                filename: 'chart_miscellaneous_stocks_required.txt',
                className: 'stocks_required',
                color: '#d98f8b',
            },
            {
                filename: 'chart_miscellaneous_volatility.txt',
                className: 'volatility',
                color: '#c2c383',
            },
        ],
    },
};
