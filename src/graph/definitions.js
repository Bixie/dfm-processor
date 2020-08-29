module.exports = {
    chart_compound: {
        viewBox: {width: 750, height: 400,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'chart_compound_equ_w_f.txt',
                className: 'equ_w_f',
                type: 'line',
            },
            {
                filename: 'chart_compound_equ_w_m.txt',
                className: 'equ_w_m',
                type: 'line',
            },
            {
                filename: 'chart_compound_pr_w_asp_m.txt',
                className: 'pr_w_asp_m',
                type: 'line',
            },
            {
                filename: 'chart_compound_random_500_f.txt',
                className: 'random_500_f',
                type: 'line',
            },
            {
                filename: 'chart_compound_s_p_500.txt',
                className: 's_p_500',
                type: 'line',
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
                type: 'line',
            },
            {
                filename: 'chart_constant_equ_w_m_net_liquidation_value.txt',
                className: 'equ_w_m_net_liquidation_value',
                type: 'line',
            },
            {
                filename: 'chart_constant_opt_w_cashflow.txt',
                className: 'opt_w_cashflow',
                type: 'line',
            },
            {
                filename: 'chart_constant_opt_w_net_liquidation_value.txt',
                className: 'opt_w_net_liquidation_value',
                type: 'line',
            },
            {
                filename: 'chart_constant_pr_w_asp_m_cashflow.txt',
                className: 'pr_w_asp_m_cashflow',
                type: 'line',
            },
            {
                filename: 'chart_constant_pr_w_asp_m_net_liquidation_value.txt',
                className: 'prw_m_net_liquidation',
                type: 'line',
            },
            {
                filename: 'chart_constant_s_p_500_cashflow.txt',
                className: 'sandp500_cashflow',
                type: 'line',
            },
        ],
    },
    chart_volatility: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_volatility_volatility.txt',
                className: 'volatility',
                type: 'line',
            },
        ],
    },
    chart_timing_equ_w_f_comp: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'chart_timing_equ_w_f_comp_timing_equ_w_f.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'chart_timing_equ_w_f_comp_best_timing_equ_w_f.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'chart_timing_equ_w_f_comp_worst_timing_equ_w_f.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_equ_w_m_comp: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'chart_timing_equ_w_m_comp_timing_equ_w_m.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'chart_timing_equ_w_m_comp_best_timing_equ_w_m.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'chart_timing_equ_w_m_comp_worst_timing_equ_w_m.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_pr_w_asp_m_comp: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'chart_timing_pr_w_asp_m_comp_timing_pr_w_asp_m.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'chart_timing_pr_w_asp_m_comp_best_timing_pr_w_asp_m.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'chart_timing_pr_w_asp_m_comp_worst_timing_pr_w_asp_m.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_equ_w_m_constant: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_timing_equ_w_m_constant_timing_equ_w_m_cashflow.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'chart_timing_equ_w_m_constant_best_timing_equ_w_m_cashflow.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'chart_timing_equ_w_m_constant_worst_timing_equ_w_m_cashflow.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_pr_w_asp_m_constant: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_timing_pr_w_asp_m_constant_timing_pr_w_asp_m_cashflow.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'chart_timing_pr_w_asp_m_constant_best_timing_pr_w_asp_m_cashflow.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'chart_timing_pr_w_asp_m_constant_worst_timing_pr_w_asp_m_cashflow.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_opt_w_constant: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_timing_opt_w_constant_timing_opt_w_cashflow.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'chart_timing_opt_w_constant_best_timing_opt_w_cashflow.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'chart_timing_opt_w_constant_worst_timing_opt_w_cashflow.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_nr_stocks_a_screening: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_nr_stocks_a_screening_stocks_before_ranking.txt',
                className: 'stocks_before_ranking',
                type: 'line',
            },
            {
                filename: 'chart_nr_stocks_a_screening_stocks_required.txt',
                className: 'stocks_required',
                type: 'line',
            },
        ],
    },
    chart_return_distribution_equ_w: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'linear',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_return_distribution_equ_w_return_distribution_equ_w.txt',
                className: 'return_distribution',
                type: 'bar',
            },
        ],
    },
    chart_return_distribution_pr_w: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'linear',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_return_distribution_pr_w_return_distribution_pr_w.txt',
                className: 'return_distribution',
                type: 'bar',
            },
        ],
    },
    chart_return_distribution_opt_w: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'linear',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'chart_return_distribution_opt_w_return_distribution_opt_w.txt',
                className: 'return_distribution',
                type: 'bar',
            },
        ],
    },
};
