# Protocol

The wire formats this processor speaks. Source of truth; when this file and the code disagree, one of
them is a bug. Long-form analysis, measurements and open questions live in `docs/transport-protocol.md`
of the parent project.

**One boundary is not ours:** the `GET` of §3, defined by `docs/Webrequest_url10.docx` (June 2025).
Everything else here is ours on both ends.

The parameter vocabulary is **not** repeated here. `apps/calculator/data/parameter-fields.json` in the
`dfm-core` plugin is its source: 34 names, types, option lists, ranges, defaults.

**Nor is the mapping onto §3's keys.** It was `src/params/` here until August 2026 and is
`Api\EngineQuery` in the plugin now, next to the fields it reads; the plugin's own `PARAMETERS.md` is
generated from that class and is where a parameter's route onto the wire is written down. This
processor no longer knows the vocabulary at all — it receives a finished query string and relays it.

---

## 1. Endpoints served

Base `http://<host>:${DFM_APP_PORT}`. All except `/status` require the header
**`x-dfm-apitoken`** = `DFM_INTERNAL_API_KEY`; a mismatch is `403 {"error": "Not allowed"}`.

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/status` | — | `{status, watchedPaths}` |
| POST | `/preview/:preview_id` | `{query, engine}` | `{result: true, preview_id}`, or `{result: false, preview_id, error}` with 422 (malformed `query`, or an `engine` that is not a key of `ENGINE_TARGETS`), 504 (the engine did not answer within 10s), 502 (it could not be reached) or the engine's own status |
| POST | `/license` | `{data, key, userId}` | `{result}`, or 422 with `error` for a `key` outside `^[A-Za-z0-9-]{1,64}$` |
| GET | `/watchlists/:user_id` | — | `{watchlists: [{id, name, item_count}]}` |
| GET | `/watchlists/:user_id/:id` | — | `{watchlist: {id, name, item_count, items}}`, 404 if absent |
| POST | `/watchlists/:user_id/:id?` | `{name, items}` | `{watchlist}`; no `:id` inserts, `:id` updates |
| DELETE | `/watchlists/:user_id/:id` | — | `204` |

`query` is §3's query string minus the leading `?`, built by the plugin and passed through
character for character. It is checked against `^[A-Za-z0-9;.\-_=&]+$` before being appended to a URL
— not a filter on legitimate input, since everything the mapping emits is a digit, a dot, a minus or
an ordinal, but a guard on a newline or a `#` arriving from somewhere else.

`engine` is the *name* of a machine, resolved against `ENGINE_TARGETS` in `config.js` to a port and a
path; a URL in a request body would make this fetch whatever it is told. There is one name today,
`main`. Until task 23 this field was `provider`, carrying `CSI` or `Yahoo` — Nico's interface listens
on one port per dataset — but Yahoo has been abandoned for years and the next thing that key selects
is a *box*, not a feed (task 53). `DataProvider` is still an accepted parameter on the plugin's side
and still stored with a customer's gameplan; it simply routes nowhere.

`key` on `POST /license` becomes a filename, so it is shape-checked before it is used as one.

## 2. Pipeline

1. Browser → WordPress: `POST /wp-json/dfm/v1/calculation`. WordPress mints the id, gates the licence
   and maps the parameters onto §3's keys.
2. WordPress → processor: `POST /preview/<id>` (§1), carrying the finished query string.
3. Processor → engine: `GET` (§3) — the query appended to the named engine's URL, unchanged.
4. Engine → disk: one zip in `ZIPFILES_OUTPUT_PATH`, named from the id (§4).
5. Processor → WordPress: `PUT` (§5) — those bytes, unopened.
6. Browser polls `GET /wp-json/dfm/v1/calculation/<id>` until the archive is there.

Steps 2 and 5 are the only two this program does anything in, and in neither does it look inside what
it is carrying. Since task 23 it knows the parameter vocabulary, the archive's entry names and the
charts not at all.

**The id is the whole correlation mechanism.** `dfm_preview` + 13 hex characters, minted by WordPress,
sent as `id=`, and the name the engine gives its output file.

## 3. The engine request

```
GET ${DFM_INPUT_HOST}:<port><path>?id=<preview_id>&LKEY=…&LANG=…&STLI=…
```

`port` and `path` come from the `engine` name via `ENGINE_TARGETS` — one entry, `main`, fed by
`DFM_ENGINE_PORT_MAIN` / `DFM_ENGINE_PATH_MAIN`, which point at a stub in dev. Production is path
`/gameplan` on **6247**; **6246** was the Yahoo feed and is abandoned. `DataProvider` is *not* a query
key, and the mapping never produced one: `PROV` in the old generated `PARAMETERS.md` here was a key
nothing on the wire ever carried.

Then these 20 keys, in this order — `id` and nineteen four-letter ones. Sub-fields are joined with
`;`, keys with `&`, and **nothing is URL-encoded**: the engine splits on `&`, `=` and `;` and does not
decode.

The request times out after **10 seconds**, and that is not a calculation budget: Nico's interface
answers when it has *queued* the run, not when it has finished one, so 10s is generous for an
acknowledgement and a hung socket no longer holds the plugin's own request open behind it. The number
is 10 rather than 15 because it has to expire *inside* the site's own client timeout
(`Api\Client::TIMEOUT`, 15s) — measured at 15 both fired within 50ms of each other, the site lost the
race, and the customer read a cURL message instead of the sentence below. A timeout is
`504` to WordPress, an unreachable host `502`, and any non-2xx from the engine is relayed with its own
status and the first 500 characters of its body. Nothing about the calculation itself is knowable here
— it arrives as a file or it does not (§4).

The **From** column names what the plugin reads; `Api\EngineQuery` is where each row is declared and
the plugin's `PARAMETERS.md` prints the same table the other way round, by parameter.

| Key | Sub-fields | From |
|---|---|---|
| `LKEY` | licence key, `XXXXX-XXXXX-XXXXX-XXXXX-XXXXX` | `options.licenseKey` |
| `LANG` | `NL` \| `EN` | `options.locale` |
| `STLI` | `ord(IsSelected);Min;Max;ord(SortOrder);OrderCount`, or `0;0;0;0;0` | `TradingLiquidity` |
| `SHSP` | idem | `HistoricalPrice` |
| `SASP` | idem | `AdjustedPrice` |
| `SMAR` | idem | `MARRatio` |
| `STRD` | idem + `WeeksInTrend` (6) | `Trend`, `TrendPeriod` |
| `SRNK` | `ord(IsSelected);Fallers;Short;Long;ord(AdaptiveStockCounting)` | `Ranking`, `ShortCorrelation`, `LongCorrelation`, `AdaptiveStockCounting` |
| `RPFS` | portfolio size | `PortfolioSize` |
| `RHPD` | holding period in weeks; `hold` → `32767` | `HoldingPeriod` |
| `RTRD` | `ord(Trade);HedgeRatio` | `LongShort`, `HedgePercentage` |
| `RPWT` | `ord(PriceWeighting)` | `PriceWeighing` |
| `ROWT` | `ord(IsSelected);ord(OptimizeCriterion);LearningPeriodHPs;Interval;Threshold;ord(LongThenShort)` | `InvestementObjective`, `SetupPeriod`, `WeightInterval`, `IncludeWeightingLargerThan`, `OptimalizationTechnique` |
| `WLID` | watchlist number, or `0;<ownWatchlistId>` | `Watchlists`, `options.ownWatchlistId` |
| `WLFS` | `ord(IsSelected);Exchanges;Sectors;Industries` — **always `0;0;0;0`** | server-fixed |
| `BROK` | `TransactionCosts;DividendTax;InitialMarginRequirement;ShareCollateral;LoanPercentage;RiskFreeRate` | same names, each stripped of every character that is not a digit, `.` or `-` |
| `BINV` | initial capital = `Investment` × 1000 | `Investment` |
| `BVAL` | `StartDate;EndDate;ord(BenchMark);ord(IncludeNotActive)` | `ValidationPeriod`, `Benchmark`, `IncludeInactive` |
| `BTIM` | `ord(IsSelected);ord(OptimizeCriterion)` | `Timing`, `TimingInvestementObjective` |

**`EMAIL` sat between `LKEY` and `LANG` until August 2026 and is gone.** The engine's field for it was
`MAIL` and was withdrawn on 2021-03-24, so for five years the key was read by nothing while putting a
customer's address in a plaintext query string, in this processor's log and in the site's. Twenty keys
either way: it left and nothing replaced it, because `id` was never counted in the old nineteen.

`BVAL`'s dates are **Excel/Windows serial numbers naming a wall-clock day**, resolved at request time
from WordPress's clock in `wp_timezone()`: `end = today`, `start = today − ValidationPeriod years`. So
the same parameter set sent on two different days is two different requests — `ValidationPeriod` is a
duration, and the window is resolved last.

Earlier revisions of this file said **floored**, and that was wrong about the JavaScript in a way worth
recording: `toExcelDate` divided by a day and *rounded*, so from 12:00 UTC onwards both serials named
tomorrow. The office is in Amsterdam and calculations run in the working day, which is why nobody saw
it. The PHP names the local day for every instant in it, which changes the value only for a request
made in the afternoon.

`BVAL` field 4 came from `IncludeInactive` through a JavaScript truthiness test, where the string `'0'`
inverted it; the PHP compares against the parameter's own accepted values instead.

Declared precision: `%0.2f` for screening min/max, `BROK` 1 and 5, and `ROWT` 5; `%0.3f` for `BROK` 6;
`%d` elsewhere. Not enforced on our side.

### Ordinal maps

```
Boolean             0 false, 1 true
TSortOrder          0 NONE, 1 ASC (bottom), 2 DESC (top)
TTrade              0 Long, 1 Short, 2 Long/short
TOptimizeCriterion  0 RewardRisk (MaxMAR), 1 Reward (MaxProfits), 2 Risk (MinRisk)
TPriceWeighting     0 ASP (Adjusted), 1 USP (Historical)
TBenchMark          0 SP500, 1 DJIA
```

`N/A` on any parameter is `0` in its `IsSelected` field.

### Watchlist numbers

`0` own · `1` General_watchlist · `2` SnP500 · `3` DJIA · `4` ETF_Collection · `5` Best_EPS_Collection ·
`6` Twenty_Analysts · `7` DivStocks · `8` HedgeFundStocks2020 · `9` LiquidStocks · `10` Russell2000 ·
`11` SafeStocks

### Example

The specification's, with its dummy key — so it still carries `MAIL` and a filter selection the form
no longer offers. For a request as the plugin builds one today, see the worked example at the end of
`PARAMETERS.md` in `dfm-core`, which is a golden captured from the JavaScript this replaced.

```
http://localhost:6246/gameplan?id=dfm_preview5e91eab7ab8f0
&LKEY=DUMMY-12345-ABCDE-FGHIJ-67890&MAIL=user@example.com&LANG=EN
&STLI=1;1.50;1000000.00;0;31&SHSP=1;5.00;100.00;0;24&SASP=1;0.50;200.00;0;48
&SMAR=1;-10.00;10.00;1;36&STRD=0;-100.00;100.00;0;51;13&SRNK=1;1;13;26;1
&RPFS=12&RHPD=13&RTRD=0;35&RPWT=0&ROWT=1;0;9;1;0;1
&WLID=11&WLFS=0;16;179;22924
&BROK=5.00;15;100;100;0.57;0.027&BINV=48000&BVAL=32994;44098;0;1&BTIM=1;0
```

### Known discrepancies with the specification

- `SRNK` field 2 is `ord(Boolean)`; `Ranking = Trend-following` sends `2`.
- `ROWT` field 6 is `ord(Boolean)`; `OptimalizationTechnique = RankByRank` sends `2`.
- `BROK` field 6 units are unconfirmed. The spec's example is `0.027` at three decimals; we send `2.5`
  for `2.5%`. Field 5 in the same example (`0.57`) matches our percent convention.
- `ROWT` omits `Weighting.StartDate`, which the spec's format string lists and its own example does not.
- `WeightInterval` is *"required but ignored, default = 1"* since 2021-04-15.
- The spec's format strings join with `,`; every example and production use `;`.
- `ROWT` field 2 is **empty** when `InvestementObjective` is `N/A` — `ROWT=0;;9;1;0;1` — because that
  parameter's map has no `N/A` row and the JavaScript formatter had no fallback, while
  `TimingInvestementObjective` one key along sends `BTIM=0;0` from the same choice. Reproduced rather
  than fixed: what the engine makes of the empty field is unknown, and a `0` there would be a change
  to six years of behaviour on a guess. A question for Nico.

## 4. The engine's answer

One zip in `ZIPFILES_OUTPUT_PATH`, matched by `` `${OUTPUT_FILENAME_PREFIX}([^\\].*)\.zip$` ``:

```
dfm_preview<13 hex>.zip
```

No manifest, no status file, no signal for a run that produced nothing. Entry count varies with the
options chosen (19–29 in the samples). Raw names are mixed-case with spaces and brackets:
`MainTable.csv`, `comp_Benchmark[S&P500].txt`.

**Every entry is renamed, and since task 23 that happens on the receiving side.** It was lodash
`snakeCase` here, applied while repacking; it is `Api\PreviewZip::normalizeName()` in the plugin now,
applied while reading. The transformation is unchanged — the basename in snake_case plus the original
extension — and it had to move because nothing here opens the archive any more:

```
MainTable.csv               → main_table.csv
comp_Pr.W[ASP] (M).txt      → comp_pr_w_asp_m.txt
comp_Benchmark[S&P500].txt  → comp_benchmark_s_p_500.txt
```

Those names are part of the protocol: the browser matches on them, so the PHP is a transcription of
what lodash did rather than a reimplementation —
`preg_match_all('/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/')`, lowercased, joined with `_`. It is pinned
against all 26 names in `scripts/test-data/` in the plugin's `tests/api-module.php`, and it is
idempotent, which is what let it land and be verified as a no-op before the pass-through flipped.

**Read this before writing a test fixture.** `scripts/test-data/` holds the engine's *raw* names, and
the emulator (`scripts/test-dfm-http.js`) zips them as they are. It used to normalise them on the way
in, so its archives were unlike anything the engine produces and the rename was invisible to every
emulator-driven check.

The archive's only error channel is a **filename containing `error`**; the browser displays its
contents. There is no error code anywhere in the protocol, which is also why §5's own failure report
is a file in an archive.

## 5. Delivery to WordPress

```
PUT ${DFM_INTERNAL_API_HOST}/preview/<preview_id>
x-dfm-apitoken: <DFM_INTERNAL_API_KEY>
Content-type: application/zip
<zip bytes>
```

Handled by `dfm-core`'s `Api\Receiver`, which compares the token with `hash_equals` and requires the id
to match `/^[A-Za-z0-9_-]{1,64}$/`. The token is the whole authorisation — the id is not checked against
a live request. On success the archive is moved to `RESPONSES_SENT_PATH`, and that move is what says
the delivery succeeded.

**Nothing happens between §4 and here.** The bytes chokidar saw are the bytes WordPress receives. Until
task 23 `prepareDfmOutput` opened the archive, replaced the engine's 47 data files with 15 rendered
SVGs and repacked **stored, not deflated** — so a 34 KB answer left as 1.2 MB of pictures and the
numbers behind every chart were discarded on this side of the wire. The charts are drawn in the browser
from the data now.

The archive is checked, not parsed, before it is sent: a file that cannot be read, is 0 bytes, or does
not begin with `PK` is not delivered. `docs/error-inputs/` in the parent project keeps two 0-byte zips
from 2021, and a `.zip` containing a plain-text message is the shape that makes the browser poll for
four minutes and give up.

**Two attempts, ten seconds apart, then the archive is left where it is.** No further retry and no
queue: chokidar emits `add` for files already present when the watch starts, so a restart of this
process is the last resort, and a durable record of a run is task 31's job — this program holds no
state about a calculation it has not been handed a file for.

**A failure this program can see is reported through §4's error channel.** For an unusable archive it
PUTs a one-entry zip holding `error_processor.txt`, and the browser displays it like any other `error`
entry — no new endpoint, no new status, and the customer gets a sentence instead of a four-minute wait.
The entry is named for *us* so the engine's own `error.txt` stays distinguishable in a log. A
*WordPress* that cannot be reached is the one failure with nowhere to report to.

## 6. Watchlists

SQLite, `${DFM_DB_PATH}/watchlists.sqlite`, one table created on boot if absent:

| Column | Type |
|---|---|
| `id` | integer, PK, autoincrement |
| `user_id` | integer |
| `name` | string(128) |
| `item_count` | integer |
| `items` | text — a JSON array; rejected with 422 if it does not parse |

`item_count` is derived from `items` on write, `name` is truncated to 128. Every read and write is
scoped by `user_id`; touching another user's row is `403`. **The engine reads these rows directly**, so
`id` is shared state — a `WLID` of `0;<id>` names one of them, and ids must not be renumbered.

## 7. Licence files

`POST /license` writes `${LICENSEFILES_PATH}/<key>.txt` for the engine to read. CRLF line endings,
`userId` first, then one `key=value` per entry of `data`:

```
userId=1234
LicenseKey=XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
...
```

The key is the filename, so it is refused unless it matches `^[A-Za-z0-9-]{1,64}$` — the same
containment the receiver applies to a preview id in §5. Real keys are five hyphenated groups of five,
well inside that.

## 8. Configuration

Names only; values live in `config.js` defaults and the environment.

| Variable | Use |
|---|---|
| `DFM_APP_PORT` | listen port |
| `DFM_DB_PATH` | directory holding `watchlists.sqlite` |
| `DFM_INPUT_HOST`, `DFM_ENGINE_PORT_MAIN`, `DFM_ENGINE_PATH_MAIN` | the engine (§3) |
| `ZIPFILES_OUTPUT_PATH`, `DFM_OUTPUT_FILENAME_PREFIX` | the watched output (§4) |
| `DFM_RESPONSES_SENT_PATH` | where a delivered archive is moved to (§5) |
| `DFM_LICENSEFILES_PATH` | licence files (§7) |
| `DFM_INTERNAL_API_HOST`, `DFM_INTERNAL_API_KEY` | WordPress, and the shared token both directions |

`config.js` reads exactly these and nothing else. Seven variables were dropped in task 23 with the code
that read them: `DFM_INPUT_PORT_CSI`/`_YAHOO` and `DFM_INPUT_PATH_CSI`/`_YAHOO`, replaced by the two
`_MAIN` names above, and `DFM_PARAMSFILES_PATH`, `DFM_PARAMSFILES_ARCHIVE_PATH`,
`DFM_IMAGEFILES_OUTPUT_PATH`, `DFM_OUTPUT_FILENAME_SUFFIX` and `DFM_WEBSERVER_LOCAL_PATH`, which were
v1 paths. Setting any of them has no effect.
