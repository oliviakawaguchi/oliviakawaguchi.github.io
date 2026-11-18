// Time Machine case: SLB (Schlumberger), thesis from American Century U.S. Sustainable Large Cap Core SMA commentary, 2Q 2022
//   ("Notable Trades: Schlumberger. We initiated a position..."; PMs Joseph Reiland, Justin Brown, Rob Bove).
//   Source: https://web.archive.org/web/20220723094118/https://ipro.americancentury.com/content/dam/ac/pdfs/ipro/flyer/sustainable-large-cap-core-sma-commentary.pdf
// Fund holdings: the strategy's mutual fund, American Century Sustainable Equity Fund (series S000006203,
//   registrant American Century Mutual Funds, Inc., CIK 100334; same PM team Brown/Reiland/Bove per the FY2022 N-CSR).
//   N-PORT-P is public for FISCAL quarter-ends (FY ends Oct 31), so share counts are at Jan/Apr/Jul/Oct month-ends.
//   Note: the mutual fund already held SLB before the SMA "initiation" (553,860 sh at 2021-04-30; 1,176,988 sh at 2022-04-30).
//   (The American Century Growth Fund, S000006205, also bought SLB in Feb-Jul 2022, but the thesis text comes from the Sustainable strategy.)
//   N-PORT-P primary_doc.xml (https://www.sec.gov/Archives/edgar/data/100334/<accession>/primary_doc.xml):
//   2022-04-30 000114554922038098  2022-07-31 000114554922056667  2022-10-31 000114554922077388  2023-01-31 000114554923018836
//   2023-04-30 000114554923037789  2023-07-31 000114554923056467  2023-10-31 000114554923077013  2024-01-31 000114554924017640
//   2024-04-30 000114554924039499  2024-07-31 000114554924061741  2024-10-31 000114554924080395  2025-01-31 000114554925018871
//   2025-04-30 000114554925043423  2025-07-31 000119312525215736  2025-10-31 000119312525335026  2026-01-31 000119312526129677
//   2026-04-30 000119312526284639  2026-07-31 000119312526407377 (latest available filing)
// Financials: SLB quarterly results (8-K Ex.99). Prices: Yahoo Finance closes (no splits in period; dividends excluded).
// Oil: EIA WTI Cushing spot, daily (RWTCD); quarter averages computed from the daily series. AI judgments are pre-computed for the replay.
const SL = q => ({
  "2022Q2":"https://www.sec.gov/Archives/edgar/data/87347/000119312522199614/d275692dex99.htm",
  "2022Q3":"https://www.sec.gov/Archives/edgar/data/87347/000119312522266331/d387926dex99.htm",
  "2022Q4":"https://www.sec.gov/Archives/edgar/data/87347/000119312523011445/d425971dex99.htm",
  "2023Q2":"https://www.sec.gov/Archives/edgar/data/87347/000119312523190924/d530224dex99.htm",
  "2024Q3":"https://www.sec.gov/Archives/edgar/data/87347/000119312524239201/d837842dex99.htm",
  "2024Q4":"https://www.sec.gov/Archives/edgar/data/87347/000119312525008046/d902232dex99.htm",
  "2025Q1":"https://www.sec.gov/Archives/edgar/data/87347/000119312525094916/d704132dex99.htm",
  "2025Q2":"https://www.sec.gov/Archives/edgar/data/87347/000119312525160817/d63402dex99.htm",
  "2025Q4":"https://www.sec.gov/Archives/edgar/data/87347/000119312526020133/d59412dex99.htm",
  "2026Q3":"https://www.sec.gov/Archives/edgar/data/87347/000119312526429435/d151271dex99.htm"
}[q]);
const ACNP = id => `https://www.sec.gov/Archives/edgar/data/100334/${id}/primary_doc.xml`;
const EIA_WTI = "https://www.eia.gov/dnav/pet/hist/RWTCD.htm";

(window.CASES = window.CASES || {}).slb = {
  ticker: "SLB",
  name: "SLB (formerly Schlumberger)",
  holder: "American Century U.S. Sustainable Large Cap Core (mutual fund: Sustainable Equity Fund) · New position in Q2 2022",
  holderShort: "American Century (trimmed near the high)",
  thesis: "The largest oilfield services firm, but positioned for the low-carbon transition through its New Energy unit in geothermal, hydrogen, and carbon capture and storage (CCS). The fund also liked its CO2 emissions, among the lowest in the energy sector, and its 2050 net-zero target.",
  start: "2022-06-30",
  end: "2026-11-13",
  kinds: { earnings: "Earnings", macro: "Oil & Macro", company: "Company", peer: "Peer", policy: "Policy", fund: "Fund trade" },
  claims: [
    { id: "newenergy", label: "New Energy (geothermal, hydrogen, CCS) grows with the low-carbon transition", short: "New Energy", kpi: "New Energy deals and partnerships, revenue disclosure", start: 68 },
    { id: "carbon",    label: "Among the lowest CO2 emissions in the sector; 2050 net-zero target",         short: "Low carbon, net zero", kpi: "Emissions targets kept, decarbonization efforts", start: 72 },
    { id: "quality",   label: "Business fundamentals are improving",               short: "Earnings power improving", kpi: "Pretax segment margin, adjusted EPS", start: 70 },
    { id: "cycle",     label: "Returns depend on oil prices and the E&P capex cycle. WTI was over $100 at purchase, so earnings are near the cycle peak (added by AI)", short: "Oil cycle", kpi: "WTI (quarterly avg), company upstream spending outlook", start: 60 }
  ],
  timer: {
    label: "Cycle peak",
    claimId: "cycle",
    deadline: "2023-07-21",
    metric: "A year later, in Apr–Jun 2023, WTI still averages $90 or more for the quarter (up to 20% below the $109 average in the purchase quarter). Tests the AI-added claim that earnings are near the cycle peak within one year",
    metAt: null,
    cue: "WTI fell to a $74 average, so the cycle timer expires. The stock is up 57% and New Energy is still green. Returns alone raise no flag.",
    expiredTitle: "Cycle timer expired: WTI averaged $74 in Apr–Jun",
    expiredText: "Down about 30% from the $109 average in the purchase quarter. SLB's earnings are still growing, but the high oil prices behind them are over. The thesis looked only at New Energy. We recommend reviewing the thesis with the oil cycle built in."
  },
  signal: { date: "2023-07-21" },
  holdingsLabel: "Sustainable Equity Fund actual shares held (SEC N-PORT, fiscal quarter-ends)",
  holdings: [
    { date: "2022-07-31", shares: 1666066 }, { date: "2022-10-31", shares: 1414217 }, { date: "2023-01-31", shares: 1834810, label: "1.83M" },
    { date: "2023-04-30", shares: 1796352 }, { date: "2023-07-31", shares: 1115624 }, { date: "2023-10-31", shares: 1065161 },
    { date: "2024-01-31", shares: 954895 }, { date: "2024-04-30", shares: 1104420 }, { date: "2024-07-31", shares: 1054193 },
    { date: "2024-10-31", shares: 1126989 }, { date: "2025-01-31", shares: 1020085 }, { date: "2025-04-30", shares: 1020085 },
    { date: "2025-07-31", shares: 976156 }, { date: "2025-10-31", shares: 570354 }, { date: "2026-01-31", shares: 534289, label: "0.53M" },
    { date: "2026-04-30", shares: 838900 }, { date: "2026-07-31", shares: 791974 }
  ],
  // First step: the 1,176,988 shares already held at 2022-04-30 are marked at the 2022-06-30 close ($35.76, the thesis date) as the starting cost.
  // Each later change between fiscal quarter-ends is traded at the average of the two quarter-end closes
  // (2022-07-31 change uses the average of 2022-06-30 and 2022-07-29 closes).
  // Flow-matched S&P 500: same dollars in/out at the average S&P levels of the same dates. Result at 2026-11-13: fund +15% (~$17M), S&P +33%.
  fund: { name: "American Century", steps: [
    {date:"2022-06-30",shares:1176988,cost:42089091,proceeds:0},
    {date:"2022-07-31",shares:1666066,cost:59889085,proceeds:0},
    {date:"2022-10-31",shares:1414217,cost:59889085,proceeds:11214836},
    {date:"2023-01-31",shares:1834810,cost:82813506,proceeds:11214836},
    {date:"2023-04-30",shares:1796352,cost:82813506,proceeds:13259456},
    {date:"2023-07-31",shares:1115624,cost:82813506,proceeds:49913255},
    {date:"2023-10-31",shares:1065161,cost:82813506,proceeds:52789646},
    {date:"2024-01-31",shares:954895,cost:82813506,proceeds:58543326},
    {date:"2024-04-30",shares:1104420,cost:90004163,proceeds:58543326},
    {date:"2024-07-31",shares:1054193,cost:90004163,proceeds:60948445},
    {date:"2024-10-31",shares:1126989,cost:93220291,proceeds:60948445},
    {date:"2025-01-31",shares:1020085,cost:93220291,proceeds:65243314},
    {date:"2025-07-31",shares:976156,cost:93220291,proceeds:66716033},
    {date:"2025-10-31",shares:570354,cost:93220291,proceeds:80890697},
    {date:"2026-01-31",shares:534289,cost:93220291,proceeds:82413362},
    {date:"2026-04-30",shares:838900,cost:109251968,proceeds:82413362},
    {date:"2026-07-31",shares:791974,cost:109251968,proceeds:84911467}
  ] },
  series: [
    {"date":"2022-06-30","price":35.76,"spx":3785.38},{"date":"2022-09-30","price":35.9,"spx":3585.62},{"date":"2022-10-31","price":52.03,"spx":3871.98},
    {"date":"2022-12-31","price":53.46,"spx":3839.5},{"date":"2023-03-31","price":49.1,"spx":4109.31},{"date":"2023-06-30","price":49.12,"spx":4450.38},
    {"date":"2023-07-21","price":56.01,"spx":4536.34},{"date":"2023-09-12","price":62.1,"spx":4461.9},{"date":"2023-09-30","price":58.3,"spx":4288.05},
    {"date":"2023-12-31","price":52.04,"spx":4769.83},{"date":"2024-03-31","price":54.81,"spx":5254.35},{"date":"2024-06-30","price":47.18,"spx":5460.48},
    {"date":"2024-09-30","price":41.95,"spx":5762.48},{"date":"2024-12-31","price":38.34,"spx":5881.63},{"date":"2025-03-31","price":41.8,"spx":5611.85},
    {"date":"2025-06-30","price":33.8,"spx":6204.95},{"date":"2025-09-30","price":34.37,"spx":6688.46},{"date":"2025-10-10","price":31.72,"spx":6552.51},
    {"date":"2025-12-31","price":38.38,"spx":6845.5},{"date":"2026-03-31","price":51.39,"spx":6528.52},{"date":"2026-04-30","price":56.88,"spx":7209.01},
    {"date":"2026-06-30","price":46.49,"spx":7499.36},{"date":"2026-09-30","price":48.72,"spx":7651.54},{"date":"2026-11-13","price":51.67,"spx":7561.67}
  ],
  // wti = EIA WTI spot average for the quarter being reported.
  reports: [
    {"date":"2022-07-22","q":"2022Q2","rev_yoy":20,"eps":0.50,"margin":17.1,"wti":108.8},{"date":"2022-10-21","q":"2022Q3","rev_yoy":28,"eps":0.63,"margin":18.7,"wti":93.1},
    {"date":"2023-01-20","q":"2022Q4","rev_yoy":27,"eps":0.71,"margin":19.8,"wti":82.8},{"date":"2023-04-21","q":"2023Q1","rev_yoy":30,"eps":0.63,"margin":18.0,"wti":75.9},
    {"date":"2023-07-21","q":"2023Q2","rev_yoy":20,"eps":0.72,"margin":19.5,"wti":73.5},{"date":"2023-10-20","q":"2023Q3","rev_yoy":11,"eps":0.78,"margin":20.3,"wti":82.3},
    {"date":"2024-01-19","q":"2023Q4","rev_yoy":14,"eps":0.86,"margin":20.8,"wti":78.5},{"date":"2024-04-19","q":"2024Q1","rev_yoy":13,"eps":0.75,"margin":18.9,"wti":77.5},
    {"date":"2024-07-19","q":"2024Q2","rev_yoy":13,"eps":0.85,"margin":20.3,"wti":81.8},{"date":"2024-10-18","q":"2024Q3","rev_yoy":10,"eps":0.89,"margin":20.8,"wti":76.4},
    {"date":"2025-01-17","q":"2024Q4","rev_yoy":3,"eps":0.92,"margin":20.7,"wti":70.7},{"date":"2025-04-25","q":"2025Q1","rev_yoy":-3,"eps":0.72,"margin":18.3,"wti":71.8},
    {"date":"2025-07-18","q":"2025Q2","rev_yoy":-6,"eps":0.74,"margin":18.5,"wti":64.6},{"date":"2025-10-17","q":"2025Q3","rev_yoy":-3,"eps":0.69,"margin":18.2,"wti":65.8},
    {"date":"2026-01-23","q":"2025Q4","rev_yoy":5,"eps":0.78,"margin":18.5,"wti":59.6},{"date":"2026-04-24","q":"2026Q1","rev_yoy":3,"eps":0.52,"margin":15.2,"wti":72.7},
    {"date":"2026-07-24","q":"2026Q2","rev_yoy":5,"eps":0.55,"margin":15.6,"wti":95.6},{"date":"2026-10-23","q":"2026Q3","rev_yoy":6,"eps":0.64,"margin":16.7,"wti":87.1}
  ],
  kpiCards: [
    { key: "rev_yoy", label: "Revenue YoY", fmt: v => (v > 0 ? "+" : "") + v.toFixed(0) + "%", judge: v => v >= 10 ? "pos" : v >= 0 ? "wrn" : "neg" },
    { key: "eps", label: "Quarterly adj. EPS", fmt: v => "$" + v.toFixed(2), judge: () => "" },
    { key: "margin", label: "Pretax segment margin", fmt: v => v.toFixed(1) + "%", judge: () => "" },
    { key: "wti", label: "WTI quarterly avg (oil cycle)", fmt: v => "$" + v.toFixed(0), judge: v => v >= 90 ? "pos" : v >= 70 ? "wrn" : "neg" }
  ],
  events: [
    { date: "2022-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "American Century: U.S. Sustainable Large Cap Core strategy opens a position in SLB (Apr–Jun 2022)",
      ai: "The rationale is the New Energy unit and low-carbon efforts. Oil prices are not mentioned. WTI was $107.76 that day.",
      source: "https://web.archive.org/web/20220723094118/https://ipro.americancentury.com/content/dam/ac/pdfs/ipro/flyer/sustainable-large-cap-core-sma-commentary.pdf" },
    { date: "2022-07-22", kind: "earnings", claim: "quality", verdict: "support", impact: { quality: 6, cycle: -2 },
      title: "SLB Q2: revenue +20%, margin 17.1%. Company calls it a \"multiyear upcycle\" and raises FY guidance",
      short: "Revenue +20%, guide raised",
      ai: "Earnings power is strong, as the thesis says. But growth comes from drilling activity and pricing. WTI averaged $109 in Apr–Jun, so earnings ride on high oil prices.",
      alert: "warn", alertTitle: "AI note: these earnings are near the cycle peak",
      alertText: "WTI averaged $109 in Apr–Jun. SLB's margin is the highest since 2015. The thesis cites New Energy, but the oil cycle is driving earnings.",
      cue: "AI added the fourth claim. With WTI averaging $109, it logs earnings as near the cycle peak.",
      source: SL("2022Q2") },
    { date: "2022-07-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Sustainable Equity Fund: added 0.49M shares in May–Jul, up to 1.67M",
      ai: "The mutual fund also grew its position 40%. It has held SLB since 2021.",
      source: ACNP("000114554922056667") },
    { date: "2022-10-05", kind: "macro", claim: "cycle", verdict: "support", impact: { cycle: 4 },
      title: "OPEC+ agrees to cut output by 2M barrels a day, the largest since 2020",
      short: "OPEC+ big output cut",
      ai: "Support for oil prices. A tailwind for the cycle claim, but producers' decisions are setting the price.",
      source: "https://www.worldoil.com/news/2022/10/5/opec-agrees-on-2-million-barrel-a-day-output-limit-reduction/" },
    { date: "2022-10-21", kind: "earnings", claim: "quality", verdict: "support", impact: { quality: 5, newenergy: -2 },
      title: "SLB Q3: revenue +28%. EPS and margin highest since 2015",
      short: "Revenue +28%, margin 18.7%",
      ai: "Strong Supports for the earnings power claim. The company cites \"three growth engines: Core, Digital and New Energy,\" but gives no New Energy revenue.",
      source: SL("2022Q3") },
    { date: "2022-10-24", kind: "company", claim: "newenergy", verdict: "support", impact: { newenergy: 4, carbon: 3 },
      title: "Schlumberger renames itself SLB, an \"energy technology company\" putting New Energy and decarbonization up front",
      short: "Renamed SLB",
      ai: "The company itself is pushing the low-carbon thesis. But this is a statement of direction, not a revenue figure.",
      source: "https://www.worldoil.com/news/2022/10/24/schlumberger-becomes-slb-a-technology-company-driving-the-future-of-energy/" },
    { date: "2022-12-29", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Sustainable Equity Fund annual report: SLB's gain attributed to \"fossil fuel prices spiking after the invasion of Ukraine\"",
      ai: "The fund itself credits oil and gas prices for the gain, not New Energy. The same view as the cycle claim AI added.",
      source: "https://www.sec.gov/Archives/edgar/data/100334/000010033422000089/acmf103122n-csr.htm" },
    { date: "2023-01-20", kind: "earnings", claim: "cycle", verdict: "contradict", impact: { quality: 4, cycle: -4 },
      title: "SLB FY2022: dividend raised 43%. Company sees the \"early stages of a structural upcycle\"",
      short: "Dividend +43%",
      ai: "Results are excellent. But WTI averaged $83 in Oct–Dec, about 20% below purchase. Earnings and the cycle are starting to point in different directions.",
      source: SL("2022Q4") },
    { date: "2023-01-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Sustainable Equity Fund: position peaks at 1.83M shares (end of Jan 2023)",
      ai: "The fund added more with the stock up about 60% from purchase. This is the peak holding.",
      source: ACNP("000114554923018836") },
    { date: "2023-02-22", kind: "company", claim: "newenergy", verdict: "support", impact: { newenergy: 4 },
      title: "SLB New Energy: targets about $3bn of revenue around 2030 and over $10bn around 2040",
      short: "New Energy $3bn by 2030",
      ai: "The New Energy claim gets a numeric target for the first time. Against total revenue of $28bn a year, it is still only about 10%.",
      source: "https://about.bnef.com/blog/slb-new-energy-to-target-billion-dollar-opportunities-only/" },
    { date: "2023-03-17", kind: "macro", claim: "cycle", verdict: "contradict", impact: { cycle: -8 },
      title: "WTI falls to $66.61, the lowest since 2022 began",
      short: "WTI $66",
      ai: "Down nearly 40% from $107 at purchase. Clear Contradicts for the cycle claim. Nothing has happened to the New Energy or low-carbon claims.",
      source: EIA_WTI },
    { date: "2023-07-21", kind: "earnings", claim: "cycle", verdict: "contradict", impact: { cycle: -6, quality: 3 },
      title: "SLB Q2: revenue +20%. WTI averaged $74 in Apr–Jun; North American rig count down",
      short: "Revenue +20%, WTI avg $74",
      ai: "The deadline print. SLB's results are still growing, but WTI is well below the $90 bar. The company itself notes the falling North American rig count.",
      source: SL("2023Q2") },
    { date: "2023-07-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Sustainable Equity Fund: sold 0.68M shares in May–Jul, down to 1.12M (about 40% of the position)",
      ai: "Around the time of the review signal, the fund cut the position sharply. Est. proceeds were about $37M.",
      cue: "The real fund sold about 40% of its stake here, about $37M, near the stock's high.",
      source: ACNP("000114554923056467") },
    { date: "2023-09-27", kind: "macro", claim: "cycle", verdict: "support", impact: { cycle: 6 },
      title: "WTI rises to $93.67 as Saudi Arabia and others extend output cuts",
      short: "WTI back to $94",
      ai: "Oil rebounded for a while. SLB's stock also peaked around now. It confirms again that the stock moves with oil.",
      source: EIA_WTI },
    { date: "2024-06-14", kind: "company", claim: "newenergy", verdict: "support", impact: { newenergy: 4, carbon: 2 },
      title: "SLB and Aker Carbon Capture form a carbon capture joint venture; SLB owns 80%",
      short: "Carbon capture JV",
      ai: "A concrete step that Supports the New Energy claim. But its profit contribution is still small, and revenue is not disclosed.",
      source: "https://prnewswire.com/news-releases/slb-and-aker-carbon-capture-announce-closing-of-carbon-capture-joint-venture-302172968.html" },
    { date: "2024-10-18", kind: "earnings", claim: "cycle", verdict: "contradict", impact: { cycle: -10, quality: -2 },
      title: "SLB Q3: company says \"lower oil prices and ample supply\" are making some producers cautious on spending",
      short: "Customers cautious on spending",
      ai: "The company itself concedes lower oil prices are holding back customer investment. The cycle claim starts to break here.",
      alert: "warn", alertTitle: "At risk: company says low oil prices make customers cautious",
      alertText: "SLB's producer customers have started cutting investment on lower oil prices. The New Energy claim is untouched, but this is what moves the stock.",
      source: SL("2024Q3") },
    { date: "2025-01-17", kind: "earnings", claim: "cycle", verdict: "contradict", impact: { cycle: -6 },
      title: "SLB FY2024: Oct–Dec revenue growth slows to +3% YoY. Company: \"upstream spending growth is slowing\"",
      short: "Upstream spending growth slows",
      ai: "Revenue growth has nearly stopped. The cause lies outside the company: its customers' investment cycle.",
      source: SL("2024Q4") },
    { date: "2025-04-03", kind: "macro", claim: "cycle", verdict: "contradict", impact: { cycle: -8 },
      title: "OPEC+ agrees to a bigger-than-expected output hike. With US tariff announcements, Brent drops below $70",
      short: "OPEC+ speeds up output hikes",
      ai: "Producers have turned toward more supply. A headwind for oil prices and for SLB's customers' investment.",
      source: "https://www.ogj.com/general-interest/economics-markets/article/55279708/opec-accelerated-oil-supply-hike-amid-tariff-tensions" },
    { date: "2025-04-25", kind: "earnings", claim: "quality", verdict: "contradict", impact: { quality: -8, cycle: -6 },
      title: "SLB Q1: revenue −3% YoY. Activity slows in Mexico and Saudi Arabia",
      short: "Revenue below last year",
      ai: "Revenue fell YoY for the first time since purchase. The \"earnings power improving\" claim can't beat the cycle's downslope either.",
      alert: "bad", alertTitle: "Contradicts: revenue below last year for the first time since purchase",
      alertText: "Q1 revenue was −3% YoY. The oil cycle's downturn is now clear in results. The stock is below the $35.76 purchase price.",
      source: SL("2025Q1") },
    { date: "2025-07-18", kind: "earnings", claim: "cycle", verdict: "contradict", impact: { cycle: -4, quality: -4 },
      title: "SLB Q2: revenue −6%, EPS −13%. Company cites a \"well-supplied oil market and OPEC+ output hikes\"",
      short: "Revenue −6%, EPS −13%",
      ai: "Revenue and profit keep falling. Every reason the company gives is about the oil market.",
      source: SL("2025Q2") },
    { date: "2025-10-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Sustainable Equity Fund: sold 0.41M shares in Aug–Oct, down to 0.57M",
      ai: "With the stock near its lows, the fund cut the position another 40%. That is less than a third of the 1.83M peak.",
      source: ACNP("000119312525335026") },
    { date: "2026-01-23", kind: "earnings", claim: "newenergy", verdict: "contradict", impact: { newenergy: -6, cycle: 2 },
      title: "SLB FY2025: full-year revenue down on an \"oversupplied oil market.\" Growth came from the ChampionX deal, digital and data centers",
      short: "Growth from data centers, digital",
      ai: "The company's new growth drivers are data centers and digital. Three and a half years after purchase, no earnings release has shown New Energy revenue.",
      source: SL("2025Q4") },
    { date: "2026-03-30", kind: "macro", claim: "cycle", verdict: "support", impact: { cycle: 10 },
      title: "War involving Iran and disruption in the Strait of Hormuz push WTI above $100 for the first time since 2022",
      short: "WTI tops $100",
      ai: "The cycle has turned up again, but for geopolitical reasons. SLB's stock is moving with oil here too, not New Energy.",
      source: "https://www.worldoil.com/news/2026/3/30/wti-settles-above-100-for-first-time-since-2022-amid-iran-war-escalation" },
    { date: "2026-04-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Sustainable Equity Fund: bought back 0.30M shares in Feb–Apr, up to 0.84M",
      ai: "The fund added again as oil rose. This needs to be recorded as a new reason, separate from the original thesis.",
      source: ACNP("000119312526284639") },
    { date: "2026-10-23", kind: "earnings", claim: "cycle", verdict: "support", impact: { cycle: 6, quality: 2 },
      title: "SLB Q3: revenue +6%. Company says the \"upcycle is gaining momentum.\" Data center revenue +23% QoQ",
      short: "Revenue +6%, upcycle again",
      ai: "The earnings recovery coincides with the oil cycle's recovery. Four years after purchase, the stock still moves with the cycle.",
      source: SL("2026Q3") }
  ],
  summaryHTML: `
    <h3>Replay complete: SLB (Jun 2022 → Nov 2026)</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">The thesis cited New Energy. But the oil cycle moved the stock to the end.</p>
    <div class="grid">
      <div><div class="v neg">−55pt</div><div class="l">Held from the first purchase price (SLB +44%, S&amp;P 500 +100%)</div></div>
      <div><div class="v pos">+15%</div><div class="l">Fund's actual P&amp;L (est. about $17M, partly still held). Trading the S&amp;P on the same dates: +33% (gap −17pt)</div></div>
      <div><div class="v pos">+37pt</div><div class="l">vs S&amp;P 500 at the review signal (Jul 2023, approx.)</div></div>
    </div>
    <ul>
      <li><b>When the signal fired, the stock was well ahead of the market.</b> The New Energy and low-carbon claims had not broken either. What broke was the oil cycle, which the thesis never mentioned.</li>
      <li><b>The fund sold about 40% of its position around the time of the signal.</b> Selling near the high narrowed the gap versus holding on.</li>
      <li><b>AI writes in the premises the thesis left out, from day one.</b> Recording up front whether you are buying at the cycle peak lets you check it as soon as the KPIs turn down.</li>
    </ul>
    <p class="foot">Prices are approximate, linearly interpolated between quarter-end and other closes. Excludes dividends. Share counts are from SEC N-PORT filings of the Sustainable Equity Fund (the U.S. Sustainable Large Cap Core strategy's mutual fund) at fiscal quarter-ends (end of Jan, Apr, Jul, Oct). The fund has held SLB since 2021; its holding at end-Jun 2022 is treated as bought at that day's close ($35.76). Later changes are estimated as trades at the average of the surrounding quarter-end prices. WTI is the quarterly average of EIA daily spot prices. AI reads are pre-computed for the replay.</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">Close</button><button type="button" onclick="document.getElementById('reset').click()">Replay</button></div>`
};
