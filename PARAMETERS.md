# Parameters DFM Applicatie

Alle parameters en opties voor berekeningen met de DigifundManager

### Bestandsformaat

*Bestandsnaam*: `dfm_preview[uniek_id]_[EN|NL].txt`

Het bestand is een standaard text-file met windows regeleinden. Per regel staat een `key=value` paar.

Eerst staat de provider en gebruikersinformatie vermeld:

```
PROV=Y
licenseKey=DUMMY-12345-ABCDE-FGHIJ-67890
userId=999
email=user@example.com
```

Vervolgens na een lege regel de waarden van de parameters

### Parameters

|Key|Default|Options|
|---|---|---|
|DataProvider|CSI|`CSI`, `Yahoo`|
|IncludeInactive|1|`0`, `1`|
|Benchmark|SP500|`SP500`, `DJIA`|
|Watchlists|Safe|`All`, `Russell2000`, `SnP500`, `DJIA`, `Safe`, `Liquid`, `T: ETF-collection`, `T: Best_EPS_Collection`, `T: Twenty_Analysts`, `T: DivStocks`, `T: SnP500`, `Own`|
|TradingLiquidity|1.00;100000;N/A;N/A|`0.00`, `0.05`, `0.10`, `0.50`, `1.00`, `1.50`, `2.00`, `2.50`, `5.00`, `7.50`, `10`, `15`, `20`, `25`, `50`, `75`, `100`, `250`, `500`, `1000`, `5000`, `10000`, `100000`, `1000000`|
|HistoricalPrice|5.00;100;N/A;N/A|`0.10`, `0.25`, `0.50`, `0.75`, `1.00`, `1.25`, `1.50`, `1.75`, `2.00`, `2.50`, `3.00`, `5.00`, `7.50`, `10`, `15`, `20`, `25`, `30`, `50`, `75`, `100`, `125`, `150`, `200`, `500`, `750`, `1000`, `5000`, `10000`, `100000`, `500000`|
|AdjustedPrice|0.50;200;N/A;N/A|`0.10`, `0.25`, `0.50`, `0.75`, `1.00`, `1.50`, `2.50`, `5.00`, `10.00`, `15`, `20`, `25`, `30`, `50`, `75`, `100`, `125`, `150`, `200`, `500`, `750`, `1000`, `5000`, `10000`, `100000`, `500000`|
|MARRatio|N/A|`-10.00`, `-9.00`, `-8.00`, `-7.00`, `-6.00`, `-5.00`, `-4.00`, `-3.00`, `-2.00`, `-1.00`, `0.00`, `1.00`, `2.00`, `3.00`, `4.00`, `5.00`, `6.00`, `7.00`, `8.00`, `9.00`, `10.00`|
|Trend|N/A|`-100%`, `-90%`, `-80%`, `-70%`, `-60%`, `-50%`, `-40%`, `-35%`, `-30%`, `-25%`, `-20%`, `-15%`, `-10%`, `0%`, `10%`, `15%`, `20%`, `25%`, `30%`, `35%`, `40%`, `50%`, `60%`, `70%`, `80%`, `90%`, `100%`|
|TrendPeriod|N/A|`N/A`, `1`, `2`, `4`, `8`, `13`, `26`, `52`|
|Ranking|Trend-reversing|`N/A`, `Trend-reversing`, `Trend-following`|
|ShortCorrelation|13|`N/A`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `26`, `52`|
|LongCorrelation|26|`N/A`, `2`, `4`, `6`, `8`, `10`, `12`, `14`, `16`, `18`, `20`, `22`, `24`, `26`, `52`, `104`|
|Investment|$48|`$1`, `$6`, `$12`, `$24`, `$48`, `$100`, `$250`, `$500`, `$1000`, `$5000`, `$10000`, `$25000`, `$50000`, `$100000`, `$250000`|
|PortfolioSize|24|`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28`, `29`, `30`, `31`, `32`, `33`, `34`, `35`, `36`, `37`, `38`, `39`, `40`, `41`, `42`, `43`, `44`, `45`, `46`, `47`, `48`, `49`, `50`, `51`, `52`, `53`, `54`, `55`, `56`, `57`, `58`, `59`, `60`, `61`, `62`, `63`, `64`, `65`, `66`, `67`, `68`, `69`, `70`, `71`, `72`, `73`, `74`, `75`, `76`, `77`, `78`, `79`, `80`, `81`, `82`, `83`, `84`, `85`, `86`, `87`, `88`, `89`, `90`, `91`, `92`, `93`, `94`, `95`, `96`, `97`, `98`, `99`, `100`, `125`, `150`, `175`, `200`, `250`, `300`, `400`, `500`, `1000`, `2000`, `4000`|
|LongShort|Long|`Long`, `Short`, `Long/short`|
|AdaptiveStockCounting|0|`0`, `1`|
|HoldingPeriod|13|`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `26`, `52`, `hold`|
|ValidationPeriod|30|`1`, `5`, `10`, `20`, `30`|
|InvestementObjective|MaxMAR|`N/A`, `MaxMAR`, `MinRisk`, `MaxProfits`, `NoOptimization`|
|PriceWeighing|Adjusted|`N/A`, `Adjusted`, `Historical`|
|HedgePercentage|35%|`N/A`, `0%`, `20%`, `25%`, `30%`, `35%`, `40%`, `50%`, `60%`, `75%`, `90%`, `100%`|
|IncludeWeightingLargerThan|20%|`N/A`, `10%`, `20%`, `30%`, `40%`, `50%`|
|SetupPeriod|9|`N/A`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `13`, `26`, `52`|
|WeightInterval|1|`N/A`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `13`, `26`, `52`|
|OptimalizationTechnique|LongThenShort|`N/A`, `LongThenShort`, `RankByRank`|
|TransactionCosts|$0.00|`$0.00`, `$0.50`, `$4.00`, `$5.00`, `$7.50`, `$9.50`, `$12.00`|
|LoanPercentage|0%|`0%`, `0.5%`, `0.6%`, `0.7%`, `0.8%`, `0.9%`, `1%`|
|DividendTax|15%|`0%`, `5%`, `10%`, `15%`, `20%`, `25%`|
|RiskFreeRate|2.5%|`0%`, `0.5%`, `1.0%`, `1.5%`, `2.0%`, `2.5%`, `3.0%`, `3.5%`, `4.0%`, `4.5%`, `5.0%`, `5.5%`, `6.0%`, `6.5%`, `7.0%`, `7.5%`, `8.0%`, `8.5%`, `9.0%`, `9.5%`, `10.0%`|
|InitialMarginRequirement|50%|`0%`, `10%`, `20%`, `30%`, `40%`, `50%`, `60%`, `70%`, `80%`, `90%`, `100%`|
|ShareCollateral|90%|`0%`, `10%`, `20%`, `30%`, `40%`, `50%`, `60%`, `70%`, `80%`, `90%`, `100%`|

### Voorbeeld met standaardwaarden

`dfm_preview5e91eab7ab8f0_NL.txt`

```
PROV=C
licenseKey=DUMMY-12345-ABCDE-FGHIJ-67890
userId=999
email=user@example.com
STLI=1;1.00;100000;0;0
SHSP=1;5.00;100;0;0
SASP=1;0.50;200;0;0
SMAR=0;0;0;0;0
STRD=0;0;0;0;0;0
SRNK=1;T;13;26;0
RPFS=24
RHPD=13
RTRD=L;0
RPWT=A
ROWT=1;M;9;1;20;L
WLID=V
BROK=0.00;0;15;50;90
BINV=48
BVAL=30;S;I
BTIM=// No input known for BTIM
RFR=2.5 // No output known for RiskFreeRate
ASC=0 // No output known for AdaptiveStockCounting
```

