module.exports = {
    PROV: values => values.DataProvider.formatted,
    licenseKey: values => values.licenseKey.formatted,
    userId: values => values.userId.formatted,
    email: values => values.email.formatted,
    //screening rules
    STLI: values => values.TradingLiquidity.formatted,
    SHSP: values => values.HistoricalPrice.formatted,
    SASP: values => values.AdjustedPrice.formatted,
    SMAR: values => values.MARRatio.formatted,
    STRD: values => values.Trend.formatted,
    //ranking
    SRNK: values => {
        return [
            values.Ranking.formatted,
            values.ShortCorrelation.formatted,
            values.LongCorrelation.formatted,
            0, //unknown! 1(adaptive stock counting), 0(not)
        ].join(';')
    },
    //risks
    RPFS: values => values.PortfolioSize.formatted,
    RHPD: values => values.HoldingPeriod.formatted,
    RTRD: values => {
        return [
            values.LongShort.formatted,
            values.LongShort.formatted === 'H' ? values.HedgePercentage.formatted : 0,
        ].join(';')
    },
    RPWT: values => values.PriceWeighing.formatted,
    ROWT: values => {
        return [
            values.InvestementObjective.formatted,
            values.SetupPeriod.formatted,
            values.WeightInterval.formatted,
            values.LowerBound.formatted,
            values.OptimalizationTechnique.formatted,
        ].join(';')
    },
    WLID: values => values.Watchlists.formatted,
    BROK: values => {
        return [
            values.TransactionCosts.formatted,
            values.LoanPercentage.formatted,
            values.DividendTax.formatted,
        ].join(';')
    },
    BINV: values => values.Investment.formatted,
    //unknown
    STRP: values => values.TrendPeriod.formatted,
    RVLP: values => values.ValidationPeriod.formatted,
};