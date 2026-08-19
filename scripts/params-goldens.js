/**
 * Capture the query strings this processor builds today, as facts.
 *
 * The parameter mapping moves into the WordPress plugin (docs/port-plan.md task
 * 49): 561 lines of src/params/ become one PHP class. What the JavaScript emits
 * for a given parameter set is the specification that class has to reproduce,
 * character for character, so it gets captured here — from the running code,
 * before a line of it is deleted — and asserted on the PHP side by
 * tests/engine-query.php in the plugin repo.
 *
 * Two things have to be pinned or the goldens are not reproducible:
 *
 *  - **The clock.** `ValidationPeriod` becomes two Excel serials computed from
 *    `moment()` at the moment of the call, so Date.now() is stubbed. The instant
 *    is deliberately a *morning* one: toExcelDate() rounds the day rather than
 *    flooring it (js-excel-date-convert, `Math.round(daysFrom1900)`), so from
 *    12:00 UTC onwards these serials name tomorrow. The PHP side resolves a
 *    wall-clock day in the site's timezone instead, which is what BVAL is
 *    documented to mean; capturing in the morning makes the two identical, and
 *    clock_probe below records the afternoon divergence rather than hiding it.
 *  - **The timezone**, because moment() subtracts years in local time.
 *
 *     node scripts/params-goldens.js
 *     node scripts/params-goldens.js --fields=DIR --out=FILE
 *
 * `--fields` is the plugin's calculator data directory (the form's field
 * definitions and the gameplan presets are the source of the realistic cases);
 * `--out` defaults to the plugin's tests/data/engine-query-goldens.json.
 */
process.env.TZ = 'Europe/Amsterdam';

const path = require('path');
const fs = require('fs');

// 09:00 in Europe/Amsterdam, a Monday, nowhere near a month or year boundary:
// no DST edge, and no month-end for moment()'s year subtraction to clamp.
const CLOCK_ISO = '2026-06-15T07:00:00Z';
const EVENING_ISO = '2026-06-15T20:00:00Z';

const realNow = Date.now;
let clock = Date.parse(CLOCK_ISO);

Date.now = () => clock;

// Required after the stub, and read at call time by moment's own hooks.now().
const ParamsFileFull = require('../src/params/params-file-full');

const arg = (name, fallback) => {
    const found = process.argv.slice(2).find(a => a.startsWith(`--${name}=`));
    return found === undefined ? fallback : found.slice(name.length + 3);
};

const pluginDir = path.join(__dirname, '..', '..', '..', 'wordpress', 'dfm-core');
const fieldsDir = arg('fields', path.join(pluginDir, 'apps', 'calculator', 'data'));
const outFile = arg('out', path.join(pluginDir, 'tests', 'data', 'engine-query-goldens.json'));

const fieldsFile = path.join(fieldsDir, 'parameter-fields.json');
const presetsFile = path.join(fieldsDir, 'gameplans.json');

if (!fs.existsSync(fieldsFile)) {
    console.error(`No parameter-fields.json in ${fieldsDir}.`);
    console.error('Pass --fields=DIR pointing at the plugin\'s apps/calculator/data.');
    process.exitCode = 1;
    return;
}

const fields = JSON.parse(fs.readFileSync(fieldsFile, 'utf8'));
const presets = JSON.parse(fs.readFileSync(presetsFile, 'utf8'));

/*
 * The parameters arrive from the plugin, not from a browser, so they arrive
 * filtered: RequestParams::PARAMS types five of them as INT and two as
 * INT_OR_NA. That is not cosmetic for IncludeInactive — its formatter is
 * `value ? '1' : '0'`, so the *string* "0" out of the field definitions would go
 * out as 1. tests/engine-query.php pins these lists by running every captured
 * parameter set back through RequestParams::params() and requiring no change.
 */
const INT_PARAMS = ['AdaptiveStockCounting', 'IncludeInactive', 'PortfolioSize', 'Timing', 'ValidationPeriod'];
const INT_OR_NA_PARAMS = ['SetupPeriod', 'WeightInterval'];

function asPluginSends(params) {
    const sent = {};
    Object.entries(params).forEach(([name, value]) => {
        if (INT_PARAMS.includes(name)) {
            sent[name] = Number(value);
        } else if (INT_OR_NA_PARAMS.includes(name) && value !== 'N/A') {
            sent[name] = Number(value);
        } else {
            sent[name] = value;
        }
    });
    return sent;
}

// The form's own defaults, plus the one parameter the plugin fixes server-side
// (RequestParams::FIXED — the filter UI is gone, the parameter is not).
const defaults = asPluginSends({
    ...Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.default])),
    WatchlistsFilters: '0;0;0',
});

// A licence key of the right shape and an address that is obviously nobody's:
// these end up in a committed fixture. EMAIL leaves the wire in task 49, so the
// captured `email` is what proves the PHP output differs by exactly that pair.
const OPTIONS = {
    licenseKey: 'GOLD1-GOLD2-GOLD3-GOLD4-GOLD5',
    userId: 999,
    email: 'goldens@example.invalid',
    locale: 'en_US',
    ownWatchlistId: 0,
    width: 1200,
    layout: 'default',
};

const PREVIEW_ID = 'dfm_preview0123456789abc';

const cases = [];
const refused = [];

function capture(name, note, params, options = {}) {
    const opts = {...OPTIONS, ...options};
    const query = new ParamsFileFull(PREVIEW_ID, params, opts).queryString();
    const entry = {name, note, options: opts, params, query};

    // Watchlists 'All' is in neither the mapping nor the field definitions, so
    // its formatter returns undefined and the wire carries `WLID=undefined`.
    // Recorded as what today does, not as something to reproduce.
    (query.includes('=undefined') ? refused : cases).push(entry);
}

capture('app-defaults', 'every field at the default the form ships', defaults);

Object.entries(presets).forEach(([name, preset]) => {
    capture(
        `preset-${name}`,
        'gameplan preset, as GameplanPresets.vue applies it',
        asPluginSends({
            ...defaults,
            ...preset.params,
            Watchlists: preset.watchList[0],
        }),
        {ownWatchlistId: preset.watchList[1]}
    );
});

// A preset's own edge cases have to survive the two presets that cannot be sent:
// HoldingPeriod 'hold' (RHPD=32767) and InvestementObjective 'N/A' (which emits
// an *empty* second sub-field, because its map has no N/A entry and no
// fallback — PROTOCOL.md §3).
capture(
    'hold-and-na-objective',
    'MaxAbsReturn1000stocks2017 on a watchlist that exists',
    asPluginSends({...defaults, ...presets.MaxAbsReturn1000stocks2017.params, Watchlists: 'Safe'})
);

capture('own-watchlist', 'WLID gains the customer\'s own list id', {...defaults, Watchlists: 'Own'}, {ownWatchlistId: 4321});
capture('locale-nl', 'LANG=NL from a WordPress tag', defaults, {locale: 'nl_NL'});
capture('locale-nl-dash', 'LANG=NL from the processor\'s own default form', defaults, {locale: 'nl-NL'});
capture('locale-en-gb', 'the fifth accepted tag', defaults, {locale: 'en-GB'});
capture('benchmark-djia', 'BVAL sub-field 3 switches', {...defaults, Benchmark: 'DJIA'});
capture('provider-yahoo', 'the provider is a port, so the query must not change', {...defaults, DataProvider: 'Yahoo'});
capture('include-inactive', 'BVAL sub-field 4', {...defaults, IncludeInactive: 1});
capture('timing-on', 'BTIM with an objective of its own', {...defaults, Timing: 1, TimingInvestementObjective: 'MinRisk'});
capture(
    'long-short',
    'the hedge percentage and the optimisation technique come alive',
    {...defaults, LongShort: 'Long/short', HedgePercentage: '100', OptimalizationTechnique: 'RankByRank'}
);
capture(
    'everything-off',
    'every toggleable field at N/A: five zeroed quintuples and three zeroed sub-fields',
    asPluginSends({
        ...defaults,
        TradingLiquidity: 'N/A',
        HistoricalPrice: 'N/A',
        AdjustedPrice: 'N/A',
        MARRatio: 'N/A',
        Trend: 'N/A',
        TrendPeriod: 'N/A',
        Ranking: 'N/A',
        ShortCorrelation: 'N/A',
        LongCorrelation: 'N/A',
        HedgePercentage: 'N/A',
        InvestementObjective: 'N/A',
        IncludeWeightingLargerThan: 'N/A',
        SetupPeriod: 'N/A',
        WeightInterval: 'N/A',
        OptimalizationTechnique: 'N/A',
        TimingInvestementObjective: 'N/A',
    })
);
capture('sort-top', 'the ordering ordinals: TOP# is 2, BOT# is 1, N/A is 0', {
    ...defaults,
    TradingLiquidity: '1.00;1000000;TOP#;25',
    HistoricalPrice: '5.00;100;BOT#;10',
});
capture('validation-period-1', 'the shortest window the form offers', asPluginSends({...defaults, ValidationPeriod: '1'}));
capture('validation-period-50', 'the longest', asPluginSends({...defaults, ValidationPeriod: '50'}));
capture('percent-and-dollar', 'cleanNumber strips the units the form shows', {
    ...defaults,
    TransactionCosts: '$12.00',
    LoanPercentage: '1%',
    DividendTax: '25%',
    RiskFreeRate: '10.0%',
    InitialMarginRequirement: '0%',
    ShareCollateral: '100%',
    Trend: '-100%;100%;TOP#;40',
});
capture('investment-max', 'BINV is thousands of dollars', asPluginSends({...defaults, Investment: '250000'}));

/*
 * The one deviation that is not a dropped parameter: toExcelDate() rounds, so
 * the same calculation submitted after 12:00 UTC asks the engine for a window
 * ending tomorrow. The PHP class resolves a wall-clock day instead, which means
 * `morning` and `evening` below are identical on that side. Captured so the
 * difference is a recorded fact with a number on it rather than a claim.
 */
clock = Date.parse(EVENING_ISO);
const evening = new ParamsFileFull(PREVIEW_ID, defaults, OPTIONS).queryString();
clock = Date.parse(CLOCK_ISO);

const bval = query => (query.match(/&BVAL=([^&]*)/) || [])[1];

const goldens = {
    captured_from: 'dfm-processor src/params/, via scripts/params-goldens.js',
    captured_at: new Date(realNow()).toISOString().slice(0, 10),
    clock: {instant: CLOCK_ISO, timezone: process.env.TZ},
    preview_id: PREVIEW_ID,
    dropped_key: 'EMAIL',
    cases,
    refused,
    clock_probe: {
        note: 'toExcelDate() rounds the day; the PHP side floors it in the site timezone, so both of these are the morning value there.',
        morning: {instant: CLOCK_ISO, BVAL: bval(cases[0].query)},
        evening: {instant: EVENING_ISO, BVAL: bval(evening)},
    },
};

fs.mkdirSync(path.dirname(outFile), {recursive: true});
fs.writeFileSync(outFile, JSON.stringify(goldens, null, 2) + '\n');

console.log(`${cases.length} query strings -> ${outFile}`);
console.log(`${refused.length} parameter sets the mapping cannot express (Watchlists 'All')`);
console.log(`BVAL morning ${goldens.clock_probe.morning.BVAL}, evening ${goldens.clock_probe.evening.BVAL}`);
