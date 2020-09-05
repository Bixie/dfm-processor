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
|Watchlists|Safe|`All`, `SP500`, `Liquid`, `Safe`|
|TradingLiquidity|1.00;100000;N/A;N/A|`0.00`, `0.05`, `0.10`, `0.50`, `1.00`, `1.50`, `2.00`, `2.50`, `5.00`, `7.50`, `10`, `15`, `20`, `25`, `50`, `75`, `100`, `250`, `500`, `1000`, `5000`, `10000`, `100000`|
|HistoricalPrice|5.00;100;N/A;N/A|`0.10`, `0.25`, `0.50`, `0.75`, `1.00`, `1.25`, `1.50`, `1.75`, `2.00`, `2.50`, `3.00`, `5.00`, `7.50`, `10`, `15`, `20`, `25`, `30`, `50`, `75`, `100`, `125`, `150`, `200`, `500`, `750`, `1000`, `5000`, `10000`, `100000`, `500000`|
|AdjustedPrice|0.50;200;N/A;N/A|`0.10`, `0.25`, `0.50`, `0.75`, `1.00`, `1.50`, `2.50`, `5.00`, `10`|
|MARRatio|N/A|`-10.00`, `-9.00`, `-8.00`, `-7.00`, `-6.00`, `-5.00`, `-4.00`, `-3.00`, `-2.00`, `-1.00`, `0.00`, `1.00`, `2.00`, `3.00`, `4.00`, `5.00`, `6.00`, `7.00`, `8.00`, `9.00`, `10.00`|
|Trend|N/A|`-100%`, `-90%`, `-80%`, `-70%`, `-60%`, `-50%`, `-40%`, `-35%`, `-30%`, `-25%`, `-20%`, `-15%`, `-10%`, `0%`, `10%`, `15%`, `20%`, `25%`, `30%`, `35%`, `40%`, `50%`, `60%`, `70%`, `80%`, `90%`, `100%`|
|TrendPeriod|N/A|`N/A`, `1`, `2`, `4`, `8`, `13`, `26`, `52`|
|Ranking|Trend-reversing|`N/A`, `Trend-reversing`, `Trend-following`|
|ShortCorrelation|13|`N/A`, `1`, `4`, `13`, `26`, `52`|
|LongCorrelation|26|`N/A`, `2`, `8`, `26`, `52`, `104`|
|Investment|$48|`$1`, `$6`, `$12`, `$24`, `$48`, `$100`, `$250`, `$500`, `$1000`, `$5000`, `$10000`, `$25000`, `$50000`, `$100000`, `$250000`|
|PortfolioSize|24|`1`, `6`, `12`, `15`, `24`, `48`, `100`, `250`, `500`, `1000`, `2000`, `4000`|
|LongShort|Long|`Long`, `Short`, `Long/short`|
|HoldingPeriod|13|`1`, `4`, `13`, `26`, `52`, `hold`|
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
### Voorbeeld met standaardwaarden

`dfm_preview5e91eab7ab8f0_NL.txt`

```
PROV=C
licenseKey=DUMMY-12345-ABCDE-FGHIJ-67890
userId=999
email=user@example.com
STLI=1.00;100000;0;0
SHSP=5.00;100;0;0
SASP=0.50;200;0;0
SMAR=0;0;0;0
STRD=0;0;0;0
SRNK=T;13;26;0
RPFS=24
RHPD=13
RTRD=L;0
RPWT=A
ROWT=M;9;1;20;L
WLID=Safe
BROK=0.00;0;15
BINV=48
STRP=0
RVLP=30
```

