// Time Machine case: Fortune Brands Innovations (FBIN), thesis from Oakmark Fund 3Q 2022 commentary.
// Financials: FBIN quarterly results (8-K Ex.99.1). Prices: Yahoo, spin-adjusted quarter-end closes. Rates: Freddie Mac PMMS.
// Fund holdings: Oakmark Fund (series S000002758) quarter-end N-PORT-P, SEC EDGAR CIK 872323. AI judgments are pre-computed for the replay.
const FB = q => ({
  "2022Q3":"https://www.sec.gov/Archives/edgar/data/1519751/000115752322001398/a52952463ex99_1.htm",
  "2022Q4":"https://www.sec.gov/Archives/edgar/data/1519751/000115752323000295/a53328945_ex991.htm",
  "2023Q2":"https://www.sec.gov/Archives/edgar/data/1519751/000115752323001175/a53486939ex99_1.htm",
  "2023Q4":"https://www.sec.gov/Archives/edgar/data/1519751/000115752324000132/a53889076ex99_1.htm",
  "2024Q2":"https://www.sec.gov/Archives/edgar/data/1519751/000095017024086506/fbin-ex99_1.htm",
  "2024Q3":"https://www.sec.gov/Archives/edgar/data/1519751/000095017024122307/fbin-ex99_1.htm",
  "2025Q1":"https://www.sec.gov/Archives/edgar/data/1519751/000095017025064485/fbin-ex99_1.htm",
  "2025Q2":"https://www.sec.gov/Archives/edgar/data/1519751/000095017025100904/fbin-ex99_1.htm",
  "2026Q3":"https://finviz.com/news/414780/fortune-brands-announces-third-quarter-results-taking-action-to-revitalize-the-companys-performance"
}[q]);
const NP = id => `https://www.sec.gov/Archives/edgar/data/872323/${id}/primary_doc.xml`;

(window.CASES = window.CASES || {}).fbin = {
  ticker: "FBIN",
  name: "Fortune Brands Innovations",
  holder: "Oakmark Fund (Harris Associates) · New position in Q3 2022",
  holderShort: "Oakmark (added, still holds)",
  thesis: "Leading home products maker (Moen in plumbing, among others). Slowing growth and rising rates squeeze near-term results, but that is short-term. Demographics and years of underbuilding keep long-term housing demand strong. About 9x next year's earnings is cheap.",
  start: "2022-09-30",
  end: "2026-11-13",
  kinds: { earnings: "Earnings", housing: "Housing", macro: "Macro", company: "Company", peer: "Peer", policy: "Policy", activist: "Activist", fund: "Fund trade" },
  claims: [
    { id: "moat",    label: "Category leader in plumbing and more, strong in repair & remodel (R&R)", short: "Business strength", kpi: "Organic growth, margins", start: 74 },
    { id: "temp",    label: "Rate and macro headwinds are short-term",                     short: "Headwinds short-term", kpi: "R&R market outlook, mortgage rates", start: 70 },
    { id: "housing", label: "Long-term housing demand is strong",                         short: "Housing demand", kpi: "Existing home sales, housing starts", start: 72 },
    { id: "cheap",   label: "About 9x next year's earnings is cheap",                     short: "Cheap", kpi: "Adjusted EPS trend", start: 68 }
  ],
  timer: {
    label: "Headwinds short-term",
    claimId: "temp",
    deadline: "2024-01-30",
    metric: "Organic growth turns positive YoY during FY2023 (\"short-term\" in the original thesis set at one year)",
    metAt: null,
    cue: "Same moment as NXPI. Organic growth is still negative, so the deadline expires. And top right: Oakmark is sitting on about $100M of gains.",
    expiredTitle: "Headwind timer expired: organic growth still negative",
    expiredText: "FY2023 organic growth was −3% YoY at the deadline. The company expects the remodel market to shrink again in 2024. The stock beats the market, but the \"short-term\" premise has broken. We recommend reviewing the thesis."
  },
  signal: { date: "2024-01-30" },
  holdingsLabel: "Oakmark actual shares held (SEC N-PORT)",
  holdings: [
    { date: "2022-09-30", shares: 2500000 }, { date: "2022-12-31", shares: 3154500 }, { date: "2023-03-31", shares: 3254500 },
    { date: "2023-06-30", shares: 3654500 }, { date: "2023-09-30", shares: 3654500 }, { date: "2023-12-31", shares: 3654500 },
    { date: "2024-03-31", shares: 3254500 }, { date: "2024-06-30", shares: 4031300 }, { date: "2024-09-30", shares: 4593400 },
    { date: "2024-12-31", shares: 4743400 }, { date: "2025-03-31", shares: 4993300 }, { date: "2025-06-30", shares: 5498300 },
    { date: "2025-09-30", shares: 5673300, label: "5.67M" }, { date: "2025-12-31", shares: 5673300 }, { date: "2026-03-31", shares: 5673300 },
    { date: "2026-06-30", shares: 5673300 }
  ],
  fund: { name: "Oakmark", factor: { until: "2022-12-15", k: 1.170 }, steps: [
    {date:"2022-09-30",shares:2500000,cost:141950000,proceeds:0},
    {date:"2022-12-15",shares:2500000,cost:141950000,proceeds:0,other:20100000},
    {date:"2022-12-31",shares:3154500,cost:175656750,proceeds:0,other:20100000},
    {date:"2023-03-31",shares:3254500,cost:181448750,proceeds:0,other:20100000},
    {date:"2023-06-30",shares:3654500,cost:207584750,proceeds:24587500},
    {date:"2024-03-31",shares:3254500,cost:207584750,proceeds:56751500},
    {date:"2024-06-30",shares:4031300,cost:265697158,proceeds:56751500},
    {date:"2024-09-30",shares:4593400,cost:309108141,proceeds:56751500},
    {date:"2024-12-31",shares:4743400,cost:320947641,proceeds:56751500},
    {date:"2025-03-31",shares:4993300,cost:337093680,proceeds:56751500},
    {date:"2025-06-30",shares:5498300,cost:365464580,proceeds:56751500},
    {date:"2025-09-30",shares:5673300,cost:374641580,proceeds:56751500}
  ] },
  series: [
    {"date":"2022-09-30","price":45.89,"spx":3585.62},{"date":"2022-12-31","price":57.11,"spx":3839.5},{"date":"2023-03-31","price":58.73,"spx":4109.31},
    {"date":"2023-06-30","price":71.95,"spx":4450.38},{"date":"2023-09-30","price":62.16,"spx":4288.05},{"date":"2023-12-31","price":76.14,"spx":4769.83},
    {"date":"2024-03-31","price":84.67,"spx":5254.35},{"date":"2024-06-30","price":64.94,"spx":5460.48},{"date":"2024-09-30","price":89.53,"spx":5762.48},
    {"date":"2024-12-31","price":68.33,"spx":5881.63},{"date":"2025-03-31","price":60.88,"spx":5611.85},{"date":"2025-06-30","price":51.48,"spx":6204.95},
    {"date":"2025-09-30","price":53.39,"spx":6688.46},{"date":"2025-12-31","price":50.02,"spx":6845.5},{"date":"2026-03-31","price":38.97,"spx":6528.52},
    {"date":"2026-06-30","price":54.9,"spx":7499.36},{"date":"2026-09-30","price":38.05,"spx":7651.54},{"date":"2026-11-13","price":48.05,"spx":7561.67}
  ],
  reports: [
    {"date":"2022-10-26","q":"2022Q3","sales_yoy":3.4,"organic":null,"eps":1.79,"mort":6.7},{"date":"2023-02-16","q":"2022Q4","sales_yoy":-7.0,"organic":null,"eps":1.07,"mort":6.42},
    {"date":"2023-04-26","q":"2023Q1","sales_yoy":-9.0,"organic":null,"eps":0.69,"mort":6.32},{"date":"2023-07-27","q":"2023Q2","sales_yoy":-7.0,"organic":null,"eps":1.07,"mort":6.71},
    {"date":"2023-10-25","q":"2023Q3","sales_yoy":5.0,"organic":-4.0,"eps":1.19,"mort":7.31},{"date":"2024-01-30","q":"2023Q4","sales_yoy":2.6,"organic":-3.0,"eps":0.95,"mort":6.61},
    {"date":"2024-04-30","q":"2024Q1","sales_yoy":6.7,"organic":-3.0,"eps":0.83,"mort":6.79},{"date":"2024-07-25","q":"2024Q2","sales_yoy":6.5,"organic":-3.0,"eps":1.16,"mort":6.86},
    {"date":"2024-11-06","q":"2024Q3","sales_yoy":-8.4,"organic":-5.0,"eps":1.16,"mort":6.08},{"date":"2025-02-06","q":"2024Q4","sales_yoy":-4.9,"organic":-1.0,"eps":0.98,"mort":6.85},
    {"date":"2025-05-06","q":"2025Q1","sales_yoy":-6.9,"organic":-5.0,"eps":0.66,"mort":6.65},{"date":"2025-07-31","q":"2025Q2","sales_yoy":-3.0,"organic":-1.0,"eps":1.0,"mort":6.77},
    {"date":"2025-10-30","q":"2025Q3","sales_yoy":-0.5,"organic":1.0,"eps":1.09,"mort":6.3},{"date":"2026-02-12","q":"2025Q4","sales_yoy":-2.4,"organic":0.0,"eps":0.86,"mort":6.15},
    {"date":"2026-05-07","q":"2026Q1","sales_yoy":-2.1,"organic":-1.2,"eps":0.53,"mort":6.38},{"date":"2026-08-04","q":"2026Q2","sales_yoy":-4.1,"organic":null,"eps":1.35,"mort":6.49},
    {"date":"2026-11-03","q":"2026Q3","sales_yoy":-3.1,"organic":-2.4,"eps":1.14,"mort":7.03}
  ],
  kpiCards: [
    { key: "sales_yoy", label: "Sales YoY (incl. M&A)", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v >= 0 ? "pos" : "neg" },
    { key: "organic", label: "Organic growth", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v > 0 ? "pos" : v === 0 ? "wrn" : "neg" },
    { key: "eps", label: "Quarterly adj. EPS", fmt: v => "$" + v.toFixed(2), judge: () => "" },
    { key: "mort", label: "30-yr mortgage rate", fmt: v => v.toFixed(2) + "%", judge: v => v >= 7 ? "neg" : v >= 6.5 ? "wrn" : "" }
  ],
  events: [
    { date: "2022-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark: new position of 2.5M shares (Q3 2022)",
      ai: "A new buy as rising rates hit housing stocks. The thesis: headwinds are short-term, long-term housing demand is strong.",
      source: NP("000175272422265402") },
    { date: "2022-10-26", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -4, moat: 2 },
      title: "FBIN Q3: sales +3.4%. FY EPS guide cut. Housing demand softening \"as expected\"",
      short: "EPS guide cut",
      ai: "Management calls the softening expected. Not at odds with the thesis, but we log it as the start of the headwind.",
      source: FB("2022Q3") },
    { date: "2022-12-14", kind: "company", claim: null, verdict: "neutral", impact: {},
      title: "Spins off MasterBrand cabinets; renamed Fortune Brands Innovations",
      ai: "The business mix changed. Plumbing and security are now the core, raising reliance on repair & remodel (R&R).",
      source: "https://www.businesswire.com/news/home/20221215005057/en/MasterBrand-Completes-Separation-from-Fortune-Brands" },
    { date: "2023-02-16", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6, moat: 4 },
      title: "FBIN 2023 outlook: sales −5 to −7%, market −6.5 to −8.5%. \"Rapid rate hikes hit buying appetite\"",
      short: "2023 sales −5 to −7%",
      ai: "The headwind is now expected to last over a year. Margins are holding, so Supports \"business strength\" and Contradicts \"short-term.\"",
      source: FB("2022Q4") },
    { date: "2023-07-27", kind: "earnings", claim: "housing", verdict: "support", impact: { housing: 6, temp: 4 },
      title: "FBIN Q2: new construction stronger than expected; FY guide raised",
      short: "New construction stronger",
      ai: "First evidence for the thesis. But the strength is in new builds; the core remodel market is still assumed at −4 to −6%.",
      source: FB("2023Q2") },
    { date: "2023-10-26", kind: "housing", claim: "temp", verdict: "contradict", impact: { temp: -8, housing: -6 },
      title: "30-year mortgage rate hits 7.79%, highest since 2000",
      short: "Mortgage rate 7.79%",
      ai: "The rate headwind called short-term is getting stronger. When existing home sales stall, remodel demand struggles to return.",
      alert: "warn", alertTitle: "At risk: rate headwind at a 23-year high",
      alertText: "Mortgage rates reached 7.79%. The headwind the thesis called short-term is strengthening, not easing.",
      source: "https://www.freddiemac.com/pmms/docs/PMMS_history.csv" },
    { date: "2024-01-30", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -8 },
      title: "FBIN FY2023: organic growth −3%. Remodel market seen −2 to −4% again in 2024",
      short: "2024 R&R −2 to −4% too",
      ai: "The deadline print. The company itself expects a third straight year of remodel decline. The \"short-term\" premise no longer holds.",
      source: FB("2023Q4") },
    { date: "2024-03-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark: sold 0.4M shares, down to 3.25M (Q1 2024; its only sale)",
      ai: "Right after the review signal, the fund trimmed. From the next quarter it went back to adding.",
      source: NP("000175272424122371") },
    { date: "2024-07-25", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6, moat: -4 },
      title: "FBIN Q2: remodel market outlook cut again; China sharply worse",
      short: "R&R outlook cut",
      ai: "Recovery timing slipped again. China is a new risk not in the thesis.",
      source: FB("2024Q2") },
    { date: "2024-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark: added 1.34M shares in Apr–Sep, up to 4.59M",
      ai: "After the deadline expired, the fund grew the position 40% from the 3.25M it held after selling. Its public letters show no rewritten thesis.",
      cue: "This is where the two funds split. T. Rowe sold. Oakmark added. Watch the bars at the bottom grow.",
      source: NP("000175272424266112") },
    { date: "2024-11-06", kind: "earnings", claim: "cheap", verdict: "contradict", impact: { cheap: -8, temp: -6 },
      title: "FBIN Q3: organic −5%. FY EPS guide cut (destocking, weak retail sell-through)",
      short: "EPS guide cut",
      ai: "The earnings behind the \"cheap\" premise are starting to fall. The low P/E may have been computed on earnings before the decline.",
      source: FB("2024Q3") },
    { date: "2025-05-06", kind: "policy", claim: "moat", verdict: "contradict", impact: { moat: -6, temp: -6 },
      title: "FBIN pulls detailed 2025 guidance after tariff announcements",
      short: "Guidance pulled on tariffs",
      ai: "A headwind not in the thesis has been added, on top of weaker consumer demand.",
      source: FB("2025Q1") },
    { date: "2025-07-31", kind: "earnings", claim: "cheap", verdict: "contradict", impact: { cheap: -16, temp: -6 },
      title: "FBIN cuts 2025 EPS guide to $3.75–3.95 (Feb: $4.15–4.45). Remodel market now seen negative",
      short: "Big EPS guide cut",
      ai: "The earnings outlook fell 10%. The \"9x\" at purchase is no longer cheap on current earnings. A classic value trap pattern.",
      source: FB("2025Q2") },
    { date: "2025-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark: position peaks at 5.67M shares (end of Q3 2025)",
      ai: "The fund kept adding as the earnings outlook fell. That's 2.3x the shares of its first purchase.",
      source: NP("000141036825030052") },
    { date: "2026-01-14", kind: "housing", claim: "housing", verdict: "contradict", impact: { housing: -12 },
      title: "2025 existing home sales at 4.06M, lowest since 1995 and a fourth straight annual decline",
      short: "Existing sales at 30-year low",
      ai: "The most direct evidence against \"long-term housing demand is strong.\" Demand may exist, but high rates are blocking transactions.",
      source: "https://www.rismedia.com/2026/01/14/existing-home-sales-december-2025/" },
    { date: "2026-02-12", kind: "company", claim: "moat", verdict: "contradict", impact: { moat: -10, cheap: -12 },
      title: "FBIN 2026 outlook misses consensus; CEO to step down. Stock about −18% next day",
      short: "Weak outlook, CEO exit",
      ai: "The management change is not in the thesis. The company stated plainly it does not expect a market recovery.",
      alert: "bad", alertTitle: "Contradicts: company expects no recovery in 2026",
      alertText: "Outlook below consensus, CEO stepping down. Three and a half years after purchase, the headwind is not over.",
      cue: "The company says no recovery in 2026, and the CEO leaves. The $100M gain has turned into a loss of about 17%.",
      source: "https://www.businesswire.com/news/home/20260212410314/en/Fortune-Brands-Innovations-Announces-Fourth-Quarter-and-Full-Year-2025-Results" },
    { date: "2026-03-16", kind: "activist", claim: "moat", verdict: "contradict", impact: { moat: -4 },
      title: "Activist Ed Garden joins the board. CEO succession plan withdrawn; CFO departs",
      short: "Activist joins board",
      ai: "Management turmoil continues. The team the thesis relied on is gone.",
      source: "https://www.businesswire.com/news/home/20260316077727/en/" },
    { date: "2026-06-29", kind: "company", claim: null, verdict: "neutral", impact: {},
      title: "Jesse Singh (former AZEK CEO) named CEO",
      ai: "A turnaround under new management is a new thesis, separate from the original. It needs to be recorded afresh.",
      source: "https://secure.businesswire.com/news/home/20260629296039/en/Fortune-Brands-Innovations-Appoints-Jesse-Singh-as-Chief-Executive-Officer" },
    { date: "2026-11-03", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6, housing: -6 },
      title: "FBIN Q3: EPS guide cut again. Turnaround plan includes divestitures and a China exit",
      short: "Turnaround plan, guide cut",
      ai: "Four years on, the headwind persists. 2026 new construction is seen down high single digits, remodel down as well.",
      source: FB("2026Q3") }
  ],
  summaryHTML: `
    <h3>Replay complete: FBIN (Sep 2022 → Nov 2026)</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">After the deadline expired, Oakmark added instead of selling. The opposite of T. Rowe, which sold NXPI.</p>
    <div class="grid">
      <div><div class="v neg">−106pt</div><div class="l">Held from the first purchase price (vs S&amp;P 500)</div></div>
      <div><div class="v neg">−12%</div><div class="l">Oakmark's actual P&amp;L (est., still held). Trading the S&amp;P on the same dates: +63% (gap −75pt)</div></div>
      <div><div class="v pos">+35pt</div><div class="l">vs S&amp;P 500 at the review signal (Jan 2024, approx.)</div></div>
    </div>
    <ul>
      <li><b>When the signal fired, the stock was still beating the market.</b> As with NXPI, returns alone raised no flag.</li>
      <li><b>After the deadline, the fund grew the position about 1.5x.</b> From 3.65M to 5.67M shares. Meanwhile the earnings outlook kept falling and the "cheap" premise broke too.</li>
      <li><b>Same "temporary headwind" thesis, different outcomes for the fund that reviewed and the one that added.</b> This tool aims to stop adding to a thesis that has not been tested.</li>
    </ul>
    <p class="foot">Prices are approximate, linearly interpolated between split-adjusted quarter-end closes. Excludes dividends. Oakmark P&amp;L is estimated from quarterly share counts (SEC N-PORT), assuming trades at each quarter's average price, and includes the MasterBrand shares. AI reads are pre-computed for the replay.</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">Close</button><button type="button" onclick="document.getElementById('reset').click()">Replay</button></div>`
};
