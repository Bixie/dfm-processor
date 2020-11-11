module.exports = {
    LKEY: values => values.licenseKey.formatted,
    EMAIL: values => values.email.formatted,
    LANG: values => values.locale.formatted,
    //screening rules
    STLI: values => values.TradingLiquidity.formatted,
    SHSP: values => values.HistoricalPrice.formatted,
    SASP: values => values.AdjustedPrice.formatted,
    SMAR: values => values.MARRatio.formatted,
    STRD: values => {
        return [
            values.Trend.formatted,
            values.TrendPeriod.formatted,
        ].join(';')
    },
    //ranking
    SRNK: values => {
        return [
            values.Ranking.raw === 'N/A' ? 0 : 1,
            values.Ranking.formatted,
            values.ShortCorrelation.formatted,
            values.LongCorrelation.formatted,
            values.AdaptiveStockCounting.formatted,
        ].join(';')
    },
    //risks
    RPFS: values => values.PortfolioSize.formatted,
    RHPD: values => values.HoldingPeriod.formatted,
    RTRD: values => {
        return [
            values.LongShort.formatted,
            values.LongShort.raw === 'Long/short' ? values.HedgePercentage.formatted : 0,
        ].join(';')
    },
    RPWT: values => values.PriceWeighing.formatted,
    ROWT: values => {
        return [
            values.InvestementObjective.raw === 'N/A' ? 0 : 1,
            values.InvestementObjective.formatted,
            values.SetupPeriod.formatted,
            values.WeightInterval.formatted,
            values.IncludeWeightingLargerThan.formatted,
            values.OptimalizationTechnique.formatted,
        ].join(';')
    },
    WLID: values => {
        if (values.Watchlists.formatted === 'O') {
            return [
                values.Watchlists.formatted,
                values.ownWatchlistId.formatted,
            ].join(';');
        }
        return values.Watchlists.formatted;
    },
    BROK: values => {
        return [
            values.TransactionCosts.formatted,
            values.LoanPercentage.formatted,
            values.DividendTax.formatted,
            values.InitialMarginRequirement.formatted,
            values.ShareCollateral.formatted,
            values.RiskFreeRate.formatted
        ].join(';')
    },
    BINV: values => values.Investment.formatted,
    BVAL: values => {
        return [
            values.ValidationPeriod.formatted,
            values.Benchmark.formatted,
            values.IncludeInactive.formatted,
        ].join(';')
    },
    BTIM: values => {
        return [
            values.Timing.formatted,
            values.TimingInvestementObjective.formatted,
        ].join(';')
    },
};
