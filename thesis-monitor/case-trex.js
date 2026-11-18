// Time Machine case: Trex Company (TREX), thesis from The London Company SMID Cap 4Q 2022 portfolio commentary
//   https://www.tlcadvisory.com/wp-content/uploads/2023/01/Portfolio-Commentary_SMID-Cap_Q42022_R2500-Value.pdf
// Financials: Trex quarterly results (SEC 8-K Ex.99.1, CIK 1069878). Prices: Yahoo Finance daily closes (no split since 2020; price only).
// Fund holdings: The London Company of Virginia (SEC CIK 1259887), FIRM-LEVEL 13F-HR information tables, TREX (CUSIP 89531P105):
//   2022Q4 https://www.sec.gov/Archives/edgar/data/1259887/000139834423003154/fp0081733-1_13fhr-table.xml  704,520
//   2023Q1 https://www.sec.gov/Archives/edgar/data/1259887/000139834423009682/fp0083194-1_13fhr-table.xml  741,775
//   2023Q2 https://www.sec.gov/Archives/edgar/data/1259887/000139834423014735/fp0084486-1_13fhr-table.xml  755,627 (peak)
//   2023Q3 https://www.sec.gov/Archives/edgar/data/1259887/000139834423020609/fp0085543-1_13fhr-table.xml  727,900
//   2023Q4 https://www.sec.gov/Archives/edgar/data/1259887/000139834424002920/fp0086539-1_13fhr-table.xml  708,168
//   2024Q1 https://www.sec.gov/Archives/edgar/data/1259887/000139834424009630/fp0087895-1_13fhr-table.xml  542,923
//   2024Q2 https://www.sec.gov/Archives/edgar/data/1259887/000139834424014634/fp0089077-1_13fhr-table.xml  392,759
//   2024Q3 https://www.sec.gov/Archives/edgar/data/1259887/000139834424020731/fp0090670-1_13fhr-table.xml  428,673
//   2024Q4 https://www.sec.gov/Archives/edgar/data/1259887/000139834425002759/fp0091812-1_13fhr-table.xml  424,278
//   2025Q1 https://www.sec.gov/Archives/edgar/data/1259887/000139834425009459/fp0093239-1_13fhr-table.xml  422,864
//   2025Q2 https://www.sec.gov/Archives/edgar/data/1259887/000139834425015405/fp0094436-1_13fhr-table.xml  425,860
//   2025Q3 https://www.sec.gov/Archives/edgar/data/1259887/000139834425020905/fp0095777-1_13fhr-table.xml  416,391
//   2025Q4 https://www.sec.gov/Archives/edgar/data/1259887/000139834426003221/fp0097002-1_13fhr-table.xml  252,509
//   2026Q1 https://www.sec.gov/Archives/edgar/data/1259887/000139834426009231/fp0098381-1_13fhr-table.xml  0 (no TREX line)
//   2026Q2 https://www.sec.gov/Archives/edgar/data/1259887/000139834426014473/fp0099874-1_13fhr-table.xml  0
//   2026Q3 https://www.sec.gov/Archives/edgar/data/1259887/000139834426020115/fp0101106-1_13fhr-table.xml  0
//   (2021Q3–2022Q3 filings: no TREX.)
// Fund P&L method: initial 704,520 sh bought at the 2022Q4 quarter-end price $42.33 (= thesis entry price; matches 13F value/shares).
//   Later changes traded at the average of the two quarter-end prices. Result: cost $35.0M, proceeds $48.4M, fully exited by 2026-03-31
//   => +$13.3M (+38%). Flow-matched S&P 500 (same dollars in/out at the average S&P levels, residual closed 2026-03-31) => +41%.
// AI judgments are pre-computed for the replay.
const TX = q => ({
  "2022Q3":"https://www.sec.gov/Archives/edgar/data/1069878/000115752322001440/a52956241ex99_1.htm",
  "2022Q4":"https://www.sec.gov/Archives/edgar/data/1069878/000115752323000365/a53350615ex99_1.htm",
  "2023Q1":"https://www.sec.gov/Archives/edgar/data/1069878/000115752323000766/a53395519ex99_1.htm",
  "2023Q2":"https://www.sec.gov/Archives/edgar/data/1069878/000115752323001191/a53491265ex99_1.htm",
  "2023Q3":"https://www.sec.gov/Archives/edgar/data/1069878/000115752323001574/a53705437ex99_1.htm",
  "2023Q4":"https://www.sec.gov/Archives/edgar/data/1069878/000119312524046200/d753256dex991.htm",
  "2024Q1":"https://www.sec.gov/Archives/edgar/data/1069878/000119312524135255/d824907dex991.htm",
  "2024Q2":"https://www.sec.gov/Archives/edgar/data/1069878/000095017024091770/trex-ex99_1.htm",
  "2024Q3":"https://www.sec.gov/Archives/edgar/data/1069878/000095017024117718/trex-ex99_1.htm",
  "2024Q4":"https://www.sec.gov/Archives/edgar/data/1069878/000095017025025597/trex-ex99_1.htm",
  "2025Q1":"https://www.sec.gov/Archives/edgar/data/1069878/000095017025066913/trex-ex99_1.htm",
  "2025Q2":"https://www.sec.gov/Archives/edgar/data/1069878/000095017025101987/trex-ex99_1.htm",
  "2025Q3":"https://www.sec.gov/Archives/edgar/data/1069878/000119312525264647/trex-ex99_1.htm",
  "2025Q4":"https://www.sec.gov/Archives/edgar/data/1069878/000119312526066985/trex-ex99_1.htm",
  "2026Q1":"https://www.sec.gov/Archives/edgar/data/1069878/000119312526210213/trex-ex99_1.htm",
  "2026Q2":"https://www.sec.gov/Archives/edgar/data/1069878/000119312526331450/trex-ex99_1.htm",
  "2026Q3":"https://www.sec.gov/Archives/edgar/data/1069878/000119312526446144/trex-ex99_1.htm"
}[q]);
const LC = p => `https://www.sec.gov/Archives/edgar/data/1259887/${p}`;

(window.CASES = window.CASES || {}).trex = {
  ticker: "TREX",
  name: "Trex Company",
  holder: "The London Company (firm-wide 13F) · New position in Q4 2022",
  holderShort: "London (trimmed near the high, later sold the rest)",
  thesis: "Leader in composite decking with over 45% share in a concentrated market. The shift from wood is a long-term growth trend, backed by its brand, distribution, a cost edge from recycled materials, and high margins. Macro worries cut the stock 65%, but the balance sheet is sound and buybacks continue. Expecting it to exit the downturn in good shape, the fund bought a quality compounder on the sell-off.",
  start: "2022-12-31",
  end: "2026-11-13",
  kinds: { earnings: "Earnings", company: "Company", peer: "Peer", macro: "Macro", policy: "Policy", fund: "Fund trade" },
  claims: [
    { id: "secular", label: "The shift from wood to composites is a long-term growth trend",     short: "Shift from wood", kpi: "Revenue growth, dealer sell-through", start: 72 },
    { id: "moat",    label: "Leader with over 45% share; cost edge and high margins", short: "Leadership & margins",   kpi: "Gross margin, EBITDA margin", start: 74 },
    { id: "recover", label: "The macro sell-off is temporary; exits the downturn in good shape", short: "Recovery",       kpi: "Revenue YoY, channel inventory correction", start: 68 },
    { id: "priced",  label: "Once recovery is priced in, set the next thesis or an exit (added by AI)", short: "Priced in", kpi: "Stock gain vs revenue growth, company FY guidance", start: 65 }
  ],
  timer: {
    label: "Macro sell-off temporary",
    claimId: "recover",
    deadline: "2024-02-26",
    metric: "Quarterly revenue returns to positive YoY during FY2023 (\"exits the downturn in good shape\" set at about one year from purchase)",
    metAt: "2023-10-30",
    expiredTitle: "Recovery timer expired: revenue still below last year",
    expiredText: "By the FY2023 deadline print, quarterly revenue had not returned to positive YoY. Review the \"temporary\" premise."
  },
  signal: { date: "2024-08-06" },
  holdingsLabel: "London Company actual shares held (SEC 13F, firm-wide)",
  holdings: [
    { date: "2022-12-31", shares: 704520 }, { date: "2023-03-31", shares: 741775 }, { date: "2023-06-30", shares: 755627, label: "0.76M" },
    { date: "2023-09-30", shares: 727900 }, { date: "2023-12-31", shares: 708168 }, { date: "2024-03-31", shares: 542923 },
    { date: "2024-06-30", shares: 392759, label: "0.39M" }, { date: "2024-09-30", shares: 428673 }, { date: "2024-12-31", shares: 424278 },
    { date: "2025-03-31", shares: 422864 }, { date: "2025-06-30", shares: 425860 }, { date: "2025-09-30", shares: 416391 },
    { date: "2025-12-31", shares: 252509 }, { date: "2026-03-31", shares: 0, label: "0" }, { date: "2026-06-30", shares: 0 },
    { date: "2026-09-30", shares: 0 }
  ],
  fund: { name: "London", steps: [
    {date:"2022-12-31",shares:704520,cost:29822332,proceeds:0},
    {date:"2023-03-31",shares:741775,cost:31517434,proceeds:0},
    {date:"2023-06-30",shares:755627,cost:32308591,proceeds:0},
    {date:"2023-09-30",shares:727900,cost:32308591,proceeds:1763299},
    {date:"2023-12-31",shares:708168,cost:32308591,proceeds:3188146},
    {date:"2024-03-31",shares:542923,cost:32308591,proceeds:18270057},
    {date:"2024-06-30",shares:392759,cost:32308591,proceeds:31324565},
    {date:"2024-09-30",shares:428673,cost:34835141,proceeds:31324565},
    {date:"2024-12-31",shares:424278,cost:34835141,proceeds:31622568},
    {date:"2025-03-31",shares:422864,cost:34835141,proceeds:31712449},
    {date:"2025-06-30",shares:425860,cost:35003636,proceeds:31712449},
    {date:"2025-09-30",shares:416391,cost:35003636,proceeds:32214542},
    {date:"2025-12-31",shares:252509,cost:35003636,proceeds:39322924},
    {date:"2026-03-31",shares:0,cost:35003636,proceeds:48350121}
  ] },
  // Quarter-end closes plus daily closes around the peak and the two guidance-cut drops (S&P looked up, Yahoo ^GSPC)
  series: [
    {"date":"2022-12-31","price":42.33,"spx":3839.5},{"date":"2023-03-31","price":48.67,"spx":4109.31},{"date":"2023-06-30","price":65.56,"spx":4450.38},
    {"date":"2023-09-30","price":61.63,"spx":4288.05},{"date":"2023-12-31","price":82.79,"spx":4769.83},{"date":"2024-03-25","price":100.10,"spx":5218.19},
    {"date":"2024-03-31","price":99.75,"spx":5254.35},{"date":"2024-06-30","price":74.12,"spx":5460.48},{"date":"2024-08-06","price":76.56,"spx":5240.03},
    {"date":"2024-08-07","price":60.07,"spx":5199.50},{"date":"2024-09-30","price":66.58,"spx":5762.48},{"date":"2024-12-31","price":69.03,"spx":5881.63},
    {"date":"2025-03-31","price":58.10,"spx":5611.85},{"date":"2025-06-30","price":54.38,"spx":6204.95},{"date":"2025-09-30","price":51.67,"spx":6688.46},
    {"date":"2025-11-04","price":47.04,"spx":6771.55},{"date":"2025-11-05","price":32.43,"spx":6796.29},{"date":"2025-11-20","price":30.13,"spx":6538.76},
    {"date":"2025-12-31","price":35.08,"spx":6845.5},{"date":"2026-03-31","price":36.42,"spx":6528.52},{"date":"2026-06-30","price":50.04,"spx":7499.36},
    {"date":"2026-09-30","price":43.56,"spx":7651.54},{"date":"2026-11-13","price":52.76,"spx":7561.67}
  ],
  // sales_yoy: consolidated net sales vs prior-year quarter (2022 quarters include Trex Commercial, sold 2022-12-30).
  // gm: reported gross margin. guide: company's current-year net sales guidance midpoint ($B), null when none given.
  reports: [
    {"date":"2022-10-31","q":"2022Q3","sales_yoy":-44.0,"gm":24.5,"guide":null},{"date":"2023-02-27","q":"2022Q4","sales_yoy":-36.8,"gm":34.1,"guide":null},
    {"date":"2023-05-08","q":"2023Q1","sales_yoy":-29.5,"gm":39.6,"guide":null},{"date":"2023-07-31","q":"2023Q2","sales_yoy":-7.5,"gm":43.9,"guide":1.05},
    {"date":"2023-10-30","q":"2023Q3","sales_yoy":61.7,"gm":43.1,"guide":1.09},{"date":"2024-02-26","q":"2023Q4","sales_yoy":2.1,"gm":36.1,"guide":1.225},
    {"date":"2024-05-09","q":"2024Q1","sales_yoy":57.0,"gm":45.4,"guide":1.225},{"date":"2024-08-06","q":"2024Q2","sales_yoy":6.0,"gm":44.7,"guide":1.14},
    {"date":"2024-10-28","q":"2024Q3","sales_yoy":-23.0,"gm":39.9,"guide":1.14},{"date":"2025-02-24","q":"2024Q4","sales_yoy":-14.4,"gm":32.7,"guide":1.22},
    {"date":"2025-05-08","q":"2025Q1","sales_yoy":-9.1,"gm":40.5,"guide":1.22},{"date":"2025-08-04","q":"2025Q2","sales_yoy":3.2,"gm":40.7,"guide":1.22},
    {"date":"2025-11-04","q":"2025Q3","sales_yoy":22.1,"gm":40.5,"guide":1.155},{"date":"2026-02-24","q":"2025Q4","sales_yoy":-4.2,"gm":30.2,"guide":1.2075},
    {"date":"2026-05-07","q":"2026Q1","sales_yoy":1.0,"gm":40.5,"guide":1.2075},{"date":"2026-08-04","q":"2026Q2","sales_yoy":8.0,"gm":37.9,"guide":1.2325},
    {"date":"2026-11-04","q":"2026Q3","sales_yoy":26.0,"gm":36.0,"guide":1.301}
  ],
  kpiCards: [
    { key: "sales_yoy", label: "Revenue YoY", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v >= 5 ? "pos" : v >= 0 ? "wrn" : "neg" },
    { key: "gm", label: "Gross margin", fmt: v => v.toFixed(1) + "%", judge: v => v >= 40 ? "pos" : v >= 35 ? "wrn" : "neg" },
    { key: "guide", label: "Current-year revenue guide (company, midpoint)", fmt: v => "$" + v.toFixed(2) + "bn", judge: () => "" }
  ],
  events: [
    { date: "2022-12-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "London: new position of 0.70M shares (Q4 2022)",
      ai: "A new buy after a 65% drop in the stock. The thesis: the macro sell-off is temporary and the shift from wood is a long-term trend. It does not say at what price to sell or what would trigger a review.",
      source: LC("000139834423003154/fp0081733-1_13fhr-table.xml") },
    { date: "2023-02-27", kind: "earnings", claim: "recover", verdict: "support", impact: { recover: 5, moat: 3 },
      title: "TREX Q4: revenue −37%. But \"channel inventory correction complete by year-end\"; gross margin up 9.6pt QoQ",
      short: "Channel destocking complete",
      ai: "The company says the revenue drop came from destocking, which is now over. Margins started recovering right away. Evidence for \"temporary.\"",
      source: TX("2022Q4") },
    { date: "2023-05-08", kind: "earnings", claim: "moat", verdict: "support", impact: { moat: 4 },
      title: "TREX Q1: gross margin 39.6% despite revenue −30%. Buyback of up to 10% of shares authorized",
      short: "GM 39.6%, buyback",
      ai: "Margins stay high even with low plant utilization. Buybacks continue through the downturn, as the thesis said.",
      source: TX("2023Q1") },
    { date: "2023-07-31", kind: "earnings", claim: "secular", verdict: "support", impact: { secular: 5, moat: 4 },
      title: "TREX Q2: sell-through up mid single digits. Gross margin 43.9%. First FY revenue guide of $1.04–1.06bn",
      short: "Sell-through up mid single digits",
      ai: "Consumer demand is growing despite the slowdown. Evidence for the long-term shift from wood.",
      source: TX("2023Q2") },
    { date: "2023-10-26", kind: "macro", claim: "recover", verdict: "contradict", impact: { recover: -4 },
      title: "30-year mortgage rate hits 7.79%, highest since 2000",
      short: "Mortgage rate 7.79%",
      ai: "The macro headwind is still strengthening. But TREX sales lean on repair & remodel (R&R), which is less rate-sensitive than new construction.",
      source: "https://www.freddiemac.com/pmms/docs/PMMS_history.csv" },
    { date: "2023-10-30", kind: "earnings", claim: "recover", verdict: "support", impact: { recover: 10, secular: 3 },
      title: "TREX Q3: revenue +62%, back to positive YoY. FY guide raised to about $1.09bn",
      short: "Revenue +62% YoY",
      ai: "Recovery timer met. The prior year was the destocking trough, so discount it somewhat, but \"exits the downturn\" is confirmed.",
      source: TX("2023Q3") },
    { date: "2024-02-26", kind: "earnings", claim: "secular", verdict: "support", impact: { secular: 3, priced: -10 },
      title: "TREX FY2023: revenue about $1.1bn, flat YoY. Sees double-digit growth in 2024 (+12% at midpoint)",
      short: "2024 seen +12%",
      ai: "The company expects double-digit growth. But the stock is more than double the purchase price while revenue is still below 2021 (about $1.2bn). The stock priced in the recovery first.",
      source: TX("2023Q4") },
    { date: "2024-03-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "London: sold about 0.17M shares in Jan–Mar, down to 0.54M. Stock about 2.4x the purchase price",
      ai: "The original thesis paid off here. What's needed next is a new forward thesis or an exit rule. Neither appears in the public letters.",
      alert: "warn", alertTitle: "Thesis paid off: time to write the next thesis or an exit rule",
      alertText: "The stock is up about 136% from purchase. \"Macro sell-off temporary\" is confirmed. From here, the case rests on continued growth. Record a new thesis and an exit if it fails.",
      cue: "The stock is up 136% from purchase. The thesis paid off. Now the app asks: what's the next thesis, and what's the exit rule?",
      source: LC("000139834424009630/fp0087895-1_13fhr-table.xml") },
    { date: "2024-05-09", kind: "earnings", claim: "secular", verdict: "support", impact: { secular: 3 },
      title: "TREX Q1: revenue +57% (incl. about $75M of early-buy orders pulled forward). High-end sell-through up double digits",
      short: "Revenue +57% (incl. pull-forward)",
      ai: "Strong numbers, but part of the growth is order timing. We watch for a payback in the second half.",
      source: TX("2024Q1") },
    { date: "2024-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "London: sold another 0.15M shares in Apr–Jun, down to 0.39M (about half of peak)",
      ai: "The fund halved the position near the high. For the remaining 0.39M shares, no reason to hold or exit condition is recorded.",
      source: LC("000139834424014634/fp0089077-1_13fhr-table.xml") },
    { date: "2024-08-06", kind: "earnings", claim: "secular", verdict: "contradict", impact: { secular: -12, priced: -10 },
      title: "TREX Q2: FY revenue guide cut from $1.215–1.235bn to $1.13–1.15bn. Weak low end, channel destocking. Stock about −22% next day",
      short: "FY revenue guide cut about 7%",
      ai: "The growth claim misses for the first time. The double-digit outlook is now single digits. Gains are still large. Now is the time to rewrite the thesis.",
      alert: "bad", alertTitle: "Review signal: growth outlook starts to miss",
      alertText: "The company cut its FY revenue guide about 7%. The stock is still about 81% above the purchase price. Write a new thesis or set an exit rule.",
      cue: "The growth outlook misses for the first time. But the stock is still up 81% from purchase. With gains this large, it's time to rewrite the thesis.",
      source: TX("2024Q2") },
    { date: "2024-09-18", kind: "macro", claim: "recover", verdict: "support", impact: { recover: 3 },
      title: "Fed cuts rates by 0.5%, to a 4.75–5.00% target range",
      short: "Fed starts cutting",
      ai: "A sign the rate headwind is easing. But it takes time to reach remodel demand.",
      source: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm" },
    { date: "2024-10-28", kind: "earnings", claim: "secular", verdict: "contradict", impact: { secular: -5, moat: 2 },
      title: "TREX Q3: revenue −23%. Channel inventory cut by about $70M. High-end sell-through up high single digits",
      short: "Revenue −23%, destocking",
      ai: "The high end is growing, but total revenue fell. Margins held, so \"leadership & margins\" stays Intact.",
      source: TX("2024Q3") },
    { date: "2025-02-24", kind: "earnings", claim: "secular", verdict: "contradict", impact: { secular: -6 },
      title: "TREX FY2024: revenue +5.2% (initial guide +12%). Sees +5 to 7% in 2025",
      short: "2024 +5%, 2025 single digits too",
      ai: "2024 revenue of about $1.15bn is still below 2021. The double-digit growth premise has fallen to single digits two years running.",
      source: TX("2024Q4") },
    { date: "2025-03-23", kind: "peer", claim: "moat", verdict: "contradict", impact: { moat: -4 },
      title: "James Hardie to buy AZEK (TimberTech) for $8.75bn",
      short: "Rival AZEK joins a bigger player",
      ai: "One of the market's few major players moves under a larger building products company. Competition in distribution and sales could intensify.",
      source: "https://www.proremodeler.com/home/article/55277000/james-hardie-to-acquire-azek-for-875-billion" },
    { date: "2025-07-17", kind: "macro", claim: "recover", verdict: "contradict", impact: { recover: -4 },
      title: "Harvard remodeling leading indicator: spending growth seen at only +1.2% through Q2 2026",
      short: "Slow remodel spending growth",
      ai: "The repair & remodel market is expected to stay near flat. A market-wide tailwind is unlikely for now.",
      source: "https://www.proremodeler.com/home/article/55304039/slower-growth-projected-for-remodeling-sector-into-2026" },
    { date: "2025-08-04", kind: "earnings", claim: "secular", verdict: "support", impact: { secular: 2 },
      title: "TREX Q2: revenue +3%. New products 22% of revenue. FY guide of +5 to 7% maintained",
      short: "New products 22% of revenue",
      ai: "New products are contributing, but total growth is low single digits. No sign yet of growth reaccelerating.",
      source: TX("2025Q2") },
    { date: "2025-11-04", kind: "earnings", claim: "secular", verdict: "contradict", impact: { secular: -12, moat: -8 },
      title: "TREX Q3: 2025 revenue guide cut to flat. EBITDA margin guide lowered; SG&A to about 18% of revenue. Stock about −31% next day",
      short: "2025 flat, margins lower",
      ai: "Growth has stalled and the margin premise has dropped too. Three years after purchase, revenue is about where it was at entry.",
      alert: "bad", alertTitle: "Contradicts: growth stalls, margin outlook lowered",
      alertText: "2025 revenue is now seen flat with 2024. The stock fell about 31% in a day, below the purchase price.",
      source: TX("2025Q3") },
    { date: "2025-12-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "London: sold about 0.16M shares in Oct–Dec, down to 0.25M",
      ai: "After the guide cut, the fund reduced the position by about 40%. The stock is below the purchase price.",
      cue: "The est. gain, about $40M at the peak, has shrunk to about $13M. The stock is 17% below the purchase price.",
      source: LC("000139834426003221/fp0097002-1_13fhr-table.xml") },
    { date: "2026-02-24", kind: "company", claim: "moat", verdict: "contradict", impact: { moat: -4 },
      title: "TREX FY2025: revenue +2%, gross margin 39.2% (prior year 43.6%). CEO Fairbanks to leave in April; COO Zambanini to succeed",
      short: "Lower margins, CEO change",
      ai: "Margins fell more than 4pt YoY. The management change is not in the original thesis.",
      source: "https://www.sec.gov/Archives/edgar/data/1069878/000119312526067031/trex-ex99_1.htm" },
    { date: "2026-03-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "London: sold the remaining 0.25M shares in Jan–Mar, sold out",
      ai: "The position is closed. Est. P&L is locked in at about +$13M (+38%). Selling about half near the high is what preserved the gain.",
      source: LC("000139834426009231/fp0098381-1_13fhr-table.xml") },
    { date: "2026-07-13", kind: "company", claim: "secular", verdict: "support", impact: { secular: 6 },
      title: "TREX restructures distribution (SBP as sole national distributor). Q2 revenue seen at about $418M; FY guide raised",
      short: "Distribution revamp, guide raised",
      ai: "Growth is returning under new management. But this needs to be recorded as a new thesis, separate from the original.",
      source: "https://www.sec.gov/Archives/edgar/data/1069878/000119312526302012/trex-ex99_1.htm" },
    { date: "2026-11-04", kind: "earnings", claim: "secular", verdict: "support", impact: { secular: 10 },
      title: "TREX Q3: revenue +26%, a record third quarter, driven by the shift from wood. FY guide raised again to about $1.3bn",
      short: "Revenue +26%, guide raised again",
      ai: "The shift from wood is finally showing up in the numbers. But the company says inventory build tied to the distribution switch also helped.",
      source: TX("2026Q3") }
  ],
  summaryHTML: `
    <h3>Replay complete: TREX (Dec 2022 → Nov 2026)</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">The thesis was right, and the stock hit about 2.4x the purchase price in 15 months. But neither a next thesis nor an exit rule was written.</p>
    <div class="grid">
      <div><div class="v neg">−72pt</div><div class="l">Held from the first purchase price (+25%; S&amp;P 500 +97%)</div></div>
      <div><div class="v">+38%</div><div class="l">London's actual P&amp;L (est. about $13M, sold out). Trading the S&amp;P on the same dates: +41% (gap −3pt)</div></div>
      <div><div class="v pos">+44pt</div><div class="l">vs S&amp;P 500 at the review signal (Aug 2024)</div></div>
    </div>
    <ul>
      <li><b>The thesis paid off, but nothing was written for what came next.</b> In Mar 2024 the stock was up 136% from purchase. Revenue was still below its 2021 level.</li>
      <li><b>London sold about half near the high, and that preserved the gain.</b> It held the remaining ~0.42M shares for about 18 months after the growth outlook started to miss. The est. gain went from about $40M at the peak to about $13M.</li>
      <li><b>Forcing a thesis rewrite when it pays off and when growth starts to miss makes the rest of the gain easier to protect.</b> This tool flags both moments against recorded criteria.</li>
    </ul>
    <p class="foot">Prices are approximate, linearly interpolated between quarter-end closes (some daily closes). Excludes dividends. London P&amp;L is estimated from firm-wide 13F quarter-end share counts, assuming the first buy at the end-2022 close and later trades at each quarter's average price. The S&amp;P comparison moves the same dollars into and out of the S&amp;P 500 on the same dates. AI reads are pre-computed for the replay.</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">Close</button><button type="button" onclick="document.getElementById('reset').click()">Replay</button></div>`
};
