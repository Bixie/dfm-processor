module.exports = {
    chart_compound: {
        viewBox: {width: 750, height: 400,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'comp_equ_w_f.txt',
                className: 'equ_w_f',
                type: 'line',
            },
            {
                filename: 'comp_benchmark_s_p_500.txt',
                className: 's_p_500',
                type: 'line',
            },
            {
                filename: 'comp_benchmark_djia.txt',
                className: 'djia',
                type: 'line',
            },
            {
                filename: 'comp_random_500_f.txt',
                className: 'random_500_f',
                type: 'line',
            },
            {
                filename: 'comp_equ_w_m.txt',
                className: 'equ_w_m',
                type: 'line',
            },
            {
                filename: 'comp_pr_w_asp_m.txt',
                className: 'pr_w_asp_m',
                type: 'line',
            },
            {
                filename: 'comp_pr_w_hsp_m.txt',
                className: 'pr_w_usp_m',
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
                filename: 'const_equ_w_m_cash.txt',
                className: 'equ_w_m_cashflow',
                type: 'line',
            },
            {
                filename: 'const_equ_w_m_nlv.txt',
                className: 'equ_w_m_net_liquidation_value',
                type: 'line',
            },
            {
                filename: 'const_pr_w_asp_m_cash.txt',
                className: 'pr_w_asp_m_cashflow',
                type: 'line',
            },
            {
                filename: 'const_pr_w_hsp_m_cash.txt',
                className: 'pr_w_usp_m_cashflow',
                type: 'line',
            },
            {
                filename: 'const_pr_w_asp_m_nlv.txt',
                className: 'prw_asp_m_net_liquidation',
                type: 'line',
            },
            {
                filename: 'const_pr_w_hsp_m_nlv.txt',
                className: 'prw_usp_m_net_liquidation',
                type: 'line',
            },
            {
                filename: 'const_opt_w_cash.txt',
                className: 'opt_w_cashflow',
                type: 'line',
            },
            {
                filename: 'const_opt_w_nlv.txt',
                className: 'opt_w_net_liquidation_value',
                type: 'line',
            },
            {
                filename: 'const_ve_v_benchmark_s_p_500.txt',
                className: 's_p_500_cashflow',
                type: 'line',
            },
            {
                filename: 'const_ve_v_benchmark_djia.txt',
                className: 'djia_cashflow',
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
                filename: 'volatility.txt',
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
                filename: 'comp_equ_w_f.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'comp_equ_w_f_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'comp_equ_w_f_worst.txt',
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
                filename: 'comp_equ_w_m.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'comp_equ_w_m_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'comp_equ_w_m_worst.txt',
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
                filename: 'comp_pr_w_asp_m.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'comp_pr_w_asp_m_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'comp_pr_w_asp_m_worst.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_pr_w_usp_m_comp: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'log',},},
        dataSets: [
            {
                filename: 'comp_pr_w_hsp_m.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'comp_pr_w_hsp_m_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'comp_pr_w_hsp_m_worst.txt',
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
                filename: 'const_equ_w_m_cash.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'const_equ_w_m_cash_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'const_equ_w_m_cash_worst.txt',
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
                filename: 'const_pr_w_asp_m_cash.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'const_pr_w_asp_m_cash_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'const_pr_w_asp_m_cash_worst.txt',
                className: 'worst',
                type: 'line',
            },
        ],
    },
    chart_timing_pr_w_usp_m_constant: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'time',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'const_pr_w_hsp_m_cash.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'const_pr_w_hsp_m_cash_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'const_pr_w_hsp_m_cash_worst.txt',
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
                filename: 'const_opt_w_cash.txt',
                className: 'default',
                type: 'line',
            },
            {
                filename: 'const_opt_w_cash_best.txt',
                className: 'best',
                type: 'line',
            },
            {
                filename: 'const_opt_w_cash_worst.txt',
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
                filename: 'stocks_before_ranking.txt',
                className: 'stocks_before_ranking',
                type: 'line',
            },
            {
                filename: 'stocks_required.txt',
                className: 'stocks_required',
                type: 'line',
            },
        ],
    },
    chart_return_distribution_equ_w: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'band',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'returndistr_equ_w.txt',
                className: 'return_distribution',
                type: 'bar',
            },
        ],
    },
    chart_return_distribution_pr_w: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'band',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'returndistr_pr_w.txt',
                className: 'return_distribution',
                type: 'bar',
            },
        ],
    },
    chart_return_distribution_opt_w: {
        viewBox: {width: 455, height: 225,},
        margin: {top: 10, right: 10, bottom: 50, left: 50,},
        axes: {x: {type: 'band',}, y: {type: 'linear',},},
        dataSets: [
            {
                filename: 'returndistr_opt_w.txt',
                className: 'return_distribution',
                type: 'bar',
            },
        ],
    },
};
