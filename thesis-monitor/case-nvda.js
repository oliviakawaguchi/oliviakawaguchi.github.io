// Time Machine case: NVIDIA (NVDA), William Blair Large Cap Growth Fund (series S000008601, SEC CIK 822632).
// Thesis: LCG semiannual report, June 30, 2023 (N-CSRS): "we established a position in NVIDIA stock during the second quarter";
//   NVIDIA "advanced as AI applications were used more broadly and demand is expected to continue to accelerate".
//   https://www.sec.gov/Archives/edgar/data/822632/000093041323002025/c106307_ncsrs.htm
//   No purchase rationale was published for the first (2021) position or for the 2022 exit; the 2021 annual report and the
//   2022 quarterly commentaries name NVIDIA only in holdings / attribution lists.
// Fund holdings: LCG quarter-end N-PORT-P, primary_doc.xml under https://www.sec.gov/Archives/edgar/data/822632/<accession>/
//   2021-03-31 0001752724-21-112365 (no NVDA)   2021-06-30 0001752724-21-172685 (15,830 pre-4:1 split)
//   2021-09-30 0001752724-21-261210 (75,490)    2021-12-31 0001752724-22-052237 (112,010)   2022-03-31 0001752724-22-117186 (160,070)
//   2022-06-30 0001752724-22-198268 (184,840)   2022-09-30 0001752724-22-258179 (none)      2022-12-31 0001752724-23-029954 (none)
//   2023-03-31 0001752724-23-114732 (none)      2023-06-30 0001752724-23-173641 (113,000)   2023-09-30 0001752724-23-260199 (183,200)
//   2023-12-31 0001752724-24-025894 (187,710)   2024-03-31 0001752724-24-113156 (235,050)   2024-06-30 0001752724-24-176065 (2,085,740 post 10:1)
//   2024-09-30 0001752724-24-264134 (2,407,300) 2024-12-31 0001752724-25-025590 (2,489,420) 2025-03-31 0001752724-25-124912 (2,233,390)
//   2025-06-30 0001752724-25-193295 (2,349,040) 2025-09-30 0001410368-25-030526 (2,185,040) 2025-12-31 0001410368-26-013322 (1,948,760)
//   2026-03-31 0001410368-26-055301 (1,461,420) 2026-06-30 0001410368-26-080429 (1,304,410; latest filing, weight 14.0% of net assets)
//   Share counts below are split-adjusted to today's share basis (x40 before Jul-2021, x10 before Jun-2024).
//   Round trip VERIFIED: sold to zero in 2022Q3 (avg of quarter-end prices $13.65; 2022 closing low $11.23 on 2022-10-14),
//   re-bought 2023Q2 (avg $35.04) = ~2.6x on the average-price basis; 6/30/22 -> 6/30/23 quarter-end closes $15.16 -> $42.30 = 2.8x.
//   Note: the separate William Blair Growth Fund (S000008594) held NVDA continuously through this period; this case uses LCG only.
// Prices: Yahoo Finance split-adjusted closes (match N-PORT value/shares). Financials: NVIDIA quarterly press releases.
// AI judgments are pre-computed for the replay.
const NV = s => `https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-${s}`;
const LCG = a => `https://www.sec.gov/Archives/edgar/data/822632/${a}/primary_doc.xml`;

(window.CASES = window.CASES || {}).nvda = {
  ticker: "NVDA",
  name: "NVIDIA",
  holder: "William Blair Large Cap Growth Fund · Bought Q2 2021 → sold out Q3 2022 → re-bought Q2 2023",
  holderShort: "William Blair (sold, then bought back)",
  thesis: "As AI use spreads, demand for NVIDIA's products keeps accelerating, led by data center GPUs. (The fund wrote this rationale at the 2023 re-buy. No reason was published for the first 2021 buy or the 2022 sale.)",
  start: "2021-06-30",
  end: "2026-11-13",
  kinds: { earnings: "Earnings", company: "Company", peer: "Industry", macro: "Macro", policy: "Policy", fund: "Fund trade" },
  claims: [
    { id: "dc",   label: "Data center demand keeps growing",          short: "Data center demand", kpi: "Data center revenue YoY, new records", start: 72 },
    { id: "ai",   label: "Wider AI use accelerates GPU demand",            short: "AI demand accelerates",       kpi: "Company outlook, customer AI capex", start: 66 },
    // AI-added risk, based on what was public in mid-2021: the 2018-19 crypto/gaming inventory correction at NVIDIA.
    { id: "game", label: "Gaming demand swings stay temporary (added by AI)", short: "Gaming swings",         kpi: "Gaming revenue YoY, channel inventory", start: 64 }
  ],
  timer: {
    label: "Data center revenue doubles",
    claimId: "dc",
    deadline: "2023-06-30",
    metric: "Quarterly data center revenue of $2.05bn in the last report before entry (May 2021) doubles to over $4.1bn within two years (\"demand keeps growing\" set as doubling in two years)",
    metAt: "2023-05-24",
    expiredTitle: "Checkpoint expired: data center revenue did not double",
    expiredText: "By the deadline, data center revenue did not reach twice its level at entry. Review the demand premise."
  },
  signal: { date: "2022-09-30" },
  holdingsLabel: "William Blair LCG actual shares held (SEC N-PORT, split-adjusted)",
  holdings: [
    { date: "2021-06-30", shares: 633200 }, { date: "2021-09-30", shares: 754900 }, { date: "2021-12-31", shares: 1120100 },
    { date: "2022-03-31", shares: 1600700 }, { date: "2022-06-30", shares: 1848400, label: "1.85M" }, { date: "2022-09-30", shares: 0, label: "0" },
    { date: "2022-12-31", shares: 0 }, { date: "2023-03-31", shares: 0 }, { date: "2023-06-30", shares: 1130000, label: "Re-bought" },
    { date: "2023-09-30", shares: 1832000 }, { date: "2023-12-31", shares: 1877100 }, { date: "2024-03-31", shares: 2350500 },
    { date: "2024-06-30", shares: 2085740 }, { date: "2024-09-30", shares: 2407300 }, { date: "2024-12-31", shares: 2489420, label: "2.49M" },
    { date: "2025-03-31", shares: 2233390 }, { date: "2025-06-30", shares: 2349040 }, { date: "2025-09-30", shares: 2185040 },
    { date: "2025-12-31", shares: 1948760 }, { date: "2026-03-31", shares: 1461420 }, { date: "2026-06-30", shares: 1304410 }
  ],
  // First step: 633,200 shares bought at the 2021-06-30 quarter-end close ($20.00). Later changes traded at the average of the two quarter-end closes.
  // Est. result at 2026-11-13 ($162.85): P&L +$273M, +128% on cost. Flow-matched S&P 500 (same dollars in/out at the average S&P levels): +$50M, +24%.
  //   (The S&P mirror goes slightly short, about -$11M, after the 2026Q2 sale, because NVDA proceeds exceed the mirror's balance.
  //    Kaplan-Schoar PME as a check: 1.66.) First round trip alone: cost $43.2M, proceeds $25.2M, about -42% (-$18M) realized.
  fund: { name: "William Blair LCG", steps: [
    {date:"2021-06-30",shares:633200,cost:12664000,proceeds:0},
    {date:"2021-09-30",shares:754900,cost:15141812,proceeds:0},
    {date:"2021-12-31",shares:1120100,cost:24295550,proceeds:0},
    {date:"2022-03-31",shares:1600700,cost:37920560,proceeds:0},
    {date:"2022-06-30",shares:1848400,cost:43177992,proceeds:0},
    {date:"2022-09-30",shares:0,cost:43177992,proceeds:25230660},
    {date:"2023-06-30",shares:1130000,cost:82773192,proceeds:25230660},
    {date:"2023-09-30",shares:1832000,cost:112888992,proceeds:25230660},
    {date:"2023-12-31",shares:1877100,cost:114986594,proceeds:25230660},
    {date:"2024-03-31",shares:2350500,cost:148096190,proceeds:25230660},
    {date:"2024-06-30",shares:2085740,cost:148096190,proceeds:53546742},
    {date:"2024-09-30",shares:2407300,cost:187484074,proceeds:53546742},
    {date:"2024-12-31",shares:2489420,cost:197984348,proceeds:53546742},
    {date:"2025-03-31",shares:2233390,cost:197984348,proceeds:84612142},
    {date:"2025-06-30",shares:2349040,cost:213387193,proceeds:84612142},
    {date:"2025-09-30",shares:2185040,cost:213387193,proceeds:112866882},
    {date:"2025-12-31",shares:1948760,cost:213387193,proceeds:156942553},
    {date:"2026-03-31",shares:1461420,cost:213387193,proceeds:244883056},
    {date:"2026-06-30",shares:1304410,cost:213387193,proceeds:274282394}
  ] },
  series: [
    {"date":"2021-06-30","price":20.00,"spx":4297.50},{"date":"2021-09-30","price":20.72,"spx":4307.54},{"date":"2021-12-31","price":29.41,"spx":4766.18},
    {"date":"2022-03-31","price":27.29,"spx":4530.41},{"date":"2022-06-30","price":15.16,"spx":3785.38},{"date":"2022-09-30","price":12.14,"spx":3585.62},
    {"date":"2022-10-14","price":11.23,"spx":3583.07},{"date":"2022-12-31","price":14.61,"spx":3839.5},{"date":"2023-03-31","price":27.78,"spx":4109.31},
    {"date":"2023-05-25","price":37.98,"spx":4151.28},{"date":"2023-06-30","price":42.30,"spx":4450.38},{"date":"2023-09-30","price":43.50,"spx":4288.05},
    {"date":"2023-12-31","price":49.52,"spx":4769.83},{"date":"2024-03-31","price":90.36,"spx":5254.35},{"date":"2024-06-30","price":123.54,"spx":5460.48},
    {"date":"2024-09-30","price":121.44,"spx":5762.48},{"date":"2024-12-31","price":134.29,"spx":5881.63},{"date":"2025-03-31","price":108.38,"spx":5611.85},
    {"date":"2025-06-30","price":157.99,"spx":6204.95},{"date":"2025-09-30","price":186.58,"spx":6688.46},{"date":"2025-12-31","price":186.50,"spx":6845.5},
    {"date":"2026-03-31","price":174.40,"spx":6528.52},{"date":"2026-06-30","price":200.09,"spx":7499.36},{"date":"2026-09-30","price":228.38,"spx":7651.54},
    {"date":"2026-10-06","price":239.24,"spx":7818.93},{"date":"2026-11-13","price":162.85,"spx":7561.67}
  ],
  // dc = data-center revenue ($B); game_yoy is null from FY2027, when NVIDIA replaced Gaming with an "Edge Computing" platform.
  reports: [
    {"date":"2021-05-26","q":"FY22 Q1","dc":2.05,"dc_yoy":79,"game_yoy":106,"rev_yoy":84},
    {"date":"2021-08-18","q":"FY22 Q2","dc":2.37,"dc_yoy":35,"game_yoy":85,"rev_yoy":68},
    {"date":"2021-11-17","q":"FY22 Q3","dc":2.94,"dc_yoy":55,"game_yoy":42,"rev_yoy":50},
    {"date":"2022-02-16","q":"FY22 Q4","dc":3.26,"dc_yoy":71,"game_yoy":37,"rev_yoy":53},
    {"date":"2022-05-25","q":"FY23 Q1","dc":3.75,"dc_yoy":83,"game_yoy":31,"rev_yoy":46},
    {"date":"2022-08-24","q":"FY23 Q2","dc":3.81,"dc_yoy":61,"game_yoy":-33,"rev_yoy":3},
    {"date":"2022-11-16","q":"FY23 Q3","dc":3.83,"dc_yoy":31,"game_yoy":-51,"rev_yoy":-17},
    {"date":"2023-02-22","q":"FY23 Q4","dc":3.62,"dc_yoy":11,"game_yoy":-46,"rev_yoy":-21},
    {"date":"2023-05-24","q":"FY24 Q1","dc":4.28,"dc_yoy":14,"game_yoy":-38,"rev_yoy":-13},
    {"date":"2023-08-23","q":"FY24 Q2","dc":10.32,"dc_yoy":171,"game_yoy":22,"rev_yoy":101},
    {"date":"2023-11-21","q":"FY24 Q3","dc":14.51,"dc_yoy":279,"game_yoy":81,"rev_yoy":206},
    {"date":"2024-02-21","q":"FY24 Q4","dc":18.4,"dc_yoy":409,"game_yoy":56,"rev_yoy":265},
    {"date":"2024-05-22","q":"FY25 Q1","dc":22.6,"dc_yoy":427,"game_yoy":18,"rev_yoy":262},
    {"date":"2024-08-28","q":"FY25 Q2","dc":26.3,"dc_yoy":154,"game_yoy":16,"rev_yoy":122},
    {"date":"2024-11-20","q":"FY25 Q3","dc":30.8,"dc_yoy":112,"game_yoy":15,"rev_yoy":94},
    {"date":"2025-02-26","q":"FY25 Q4","dc":35.6,"dc_yoy":93,"game_yoy":-11,"rev_yoy":78},
    {"date":"2025-05-28","q":"FY26 Q1","dc":39.1,"dc_yoy":73,"game_yoy":42,"rev_yoy":69},
    {"date":"2025-08-27","q":"FY26 Q2","dc":41.1,"dc_yoy":56,"game_yoy":49,"rev_yoy":56},
    {"date":"2025-11-19","q":"FY26 Q3","dc":51.2,"dc_yoy":66,"game_yoy":30,"rev_yoy":62},
    {"date":"2026-02-25","q":"FY26 Q4","dc":62.3,"dc_yoy":75,"game_yoy":47,"rev_yoy":73},
    {"date":"2026-05-20","q":"FY27 Q1","dc":75.2,"dc_yoy":92,"game_yoy":null,"rev_yoy":85},
    {"date":"2026-08-26","q":"FY27 Q2","dc":89.0,"dc_yoy":117,"game_yoy":null,"rev_yoy":106}
  ],
  kpiCards: [
    { key: "dc", label: "Data center revenue (quarterly)", fmt: v => "$" + v.toFixed(v >= 10 ? 1 : 2) + "bn", judge: v => v >= 4.1 ? "pos" : "" },
    { key: "dc_yoy", label: "Data center YoY", fmt: v => (v > 0 ? "+" : "") + v + "%", judge: v => v >= 20 ? "pos" : v >= 0 ? "wrn" : "neg" },
    { key: "game_yoy", label: "Gaming YoY", fmt: v => (v > 0 ? "+" : "") + v + "%", judge: v => v >= 0 ? "pos" : "neg" },
    { key: "rev_yoy", label: "Revenue YoY", fmt: v => (v > 0 ? "+" : "") + v + "%", judge: v => v >= 0 ? "pos" : "neg" }
  ],
  events: [
    { date: "2021-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "William Blair LCG: new position in NVIDIA (0.63M shares, split-adjusted)",
      ai: "The first buy. No rationale was published. The prior report showed record data center revenue of $2.05bn.",
      source: LCG("000175272421172685") },
    { date: "2021-08-18", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 3, game: 2 },
      title: "NVIDIA May–Jul: data center +35%, gaming +85%. Both records",
      short: "Data center +35%",
      ai: "Demand is growing as the thesis expects. Gaming growth is large, and we note it may include crypto mining demand.",
      source: NV("second-quarter-fiscal-2022") },
    { date: "2021-11-17", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 4, ai: 3 },
      title: "NVIDIA Aug–Oct: data center revenue +55% to a record $2.94bn",
      short: "Data center +55%",
      ai: "Data center growth accelerated. AI demand is becoming the main driver.",
      source: NV("third-quarter-fiscal-2022") },
    { date: "2022-02-16", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 4 },
      title: "NVIDIA Nov–Jan: data center +71% to a record $3.26bn",
      short: "Data center +71%",
      ai: "Data center has set records four quarters running. The stock has started to fall, but the claim is getting stronger.",
      source: NV("fourth-quarter-and-fiscal-2022") },
    { date: "2022-03-22", kind: "company", claim: "ai", verdict: "support", impact: { ai: 4 },
      title: "Next-gen \"H100\" GPU (Hopper) unveiled; speeds up training of large AI models",
      short: "H100 unveiled",
      ai: "A new generation of AI products. Supports \"AI demand accelerates\" as supply-side readiness.",
      source: "https://nvidianews.nvidia.com/news/nvidia-announces-hopper-architecture-the-next-generation-of-accelerated-computing" },
    { date: "2022-05-25", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 3 },
      title: "NVIDIA Feb–Apr: data center +83% to $3.75bn. Next-quarter guide reflects Russia and China lockdowns",
      short: "Data center +83%",
      ai: "Data center accelerated further. The soft guide is mainly gaming and outside factors.",
      source: NV("first-quarter-fiscal-2023") },
    { date: "2022-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "William Blair LCG: position peaks at 1.85M shares (end of Q2 2022)",
      ai: "The fund kept adding even as the stock roughly halved from the start of the year. Its share count has about tripled.",
      source: LCG("000175272422198268") },
    { date: "2022-08-08", kind: "earnings", claim: "game", verdict: "contradict", impact: { game: -16 },
      title: "NVIDIA pre-announces lower May–Jul revenue ($6.7bn vs $8.1bn guide). Gaming −44% QoQ",
      short: "Gaming −44% QoQ",
      ai: "Gaming is what broke, with about $1.3bn in inventory charges. This is the risk AI added, outside the fund's thesis.",
      source: "https://nvidianews.nvidia.com/news/nvidia-announces-preliminary-financial-resultsfor-second-quarter-fiscal-2023" },
    { date: "2022-08-24", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 2, game: -6 },
      title: "NVIDIA May–Jul: data center +61% to $3.81bn. Gaming −33% YoY",
      short: "Data center +61%",
      ai: "Total revenue is weak, but data center keeps growing. The core of the thesis is sound.",
      source: NV("second-quarter-fiscal-2023") },
    { date: "2022-08-31", kind: "policy", claim: "dc", verdict: "contradict", impact: { dc: -6 },
      title: "US requires licenses for A100 and H100 exports to China; about $400M of sales could be affected",
      short: "Export curbs on AI chips to China",
      ai: "A new headwind for data center demand. But it hits one region and does not undercut demand itself.",
      source: "https://www.sec.gov/Archives/edgar/data/1045810/000104581022000146/nvda-20220826.htm" },
    { date: "2022-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "William Blair LCG: sold all 1.85M shares in Jul–Sep (est. avg $13.65)",
      ai: "Sale logged. The thesis claims (data center, AI) are still Intact. Only gaming, outside the thesis, broke.",
      alert: "warn", alertTitle: "Sale logged: thesis claims are not broken",
      alertText: "Data center revenue is up 61% YoY. Which claim broke? If none, record the reason for selling and the conditions to buy back. We keep tracking the stock after the sale.",
      cue: "The fund sold out, but the claims on the left are still green. It locked in a 42% loss. Here the app asks which claim broke.",
      source: LCG("000175272422258179") },
    { date: "2022-11-16", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 2, game: -6 },
      title: "NVIDIA Aug–Oct: data center +31% to a record $3.83bn. Gaming −51%",
      short: "Data center +31%, record",
      ai: "After the sale, data center set another record. The gaming inventory correction continues.",
      source: NV("third-quarter-fiscal-2023") },
    { date: "2023-01-23", kind: "peer", claim: "ai", verdict: "support", impact: { ai: 6 },
      title: "Microsoft expands OpenAI partnership with a multibillion-dollar investment",
      short: "Microsoft invests more in OpenAI",
      ai: "Big cloud players are investing heavily in AI. Evidence for AI GPU demand.",
      source: "https://blogs.microsoft.com/blog/2023/01/23/microsoftandopenaiextendpartnership/" },
    { date: "2023-02-22", kind: "earnings", claim: "ai", verdict: "support", impact: { ai: 6, dc: -2, game: 4 },
      title: "NVIDIA Nov–Jan: data center slows to +11%. CEO: AI is at an \"inflection point.\" Gaming starts to recover",
      short: "\"AI at an inflection point\"",
      ai: "Data center growth slowed, but the company points to surging interest in generative AI. We also confirm gaming has bottomed.",
      source: NV("fourth-quarter-and-fiscal-2023") },
    { date: "2023-05-24", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 10, ai: 12 },
      title: "NVIDIA Feb–Apr: record data center revenue of $4.28bn. Next-quarter revenue guide $11bn",
      short: "Data center record, $11bn guide",
      ai: "Checkpoint met. Data center revenue is more than double its level at entry. The company says it is raising supply to meet \"surging demand.\"",
      alert: "warn", alertTitle: "Checkpoint met: the fund holds zero",
      alertText: "Data center revenue passed twice its entry level ($4.1bn). The thesis is right. Check this against the sale record and decide whether to buy back.",
      cue: "A month before the deadline, the checkpoint is met: data center revenue hits $4.28bn, double the entry level. The fund holds zero shares.",
      source: NV("first-quarter-fiscal-2024") },
    { date: "2023-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "William Blair LCG: re-bought 1.13M shares in Apr–Jun (est. avg $35.04). Fund says AI demand will accelerate",
      ai: "Buying back at about 2.6x the sale price. Only now is the fund's thesis put in writing.",
      cue: "The fund buys back at about 2.6x its average sale price. Rebuying the same share count would have cost about $40M more.",
      source: LCG("000175272423173641") },
    { date: "2023-08-23", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 6, ai: 6 },
      title: "NVIDIA May–Jul: data center revenue +171% to $10.3bn",
      short: "Data center +171%",
      ai: "The demand acceleration shows up in the numbers. Both thesis claims are getting stronger.",
      source: NV("second-quarter-fiscal-2024") },
    { date: "2024-02-21", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 4, ai: 4 },
      title: "NVIDIA Nov–Jan: data center revenue +409% to $18.4bn",
      short: "Data center +409%",
      ai: "Quarterly data center revenue is now about 9x its level at entry.",
      source: NV("fourth-quarter-and-fiscal-2024") },
    { date: "2024-12-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "William Blair LCG: position peaks at 2.49M shares (end of Q4 2024)",
      ai: "A year and a half after the re-buy, the position is about 12% of fund assets.",
      source: LCG("000175272425025590") },
    { date: "2025-01-27", kind: "peer", claim: "ai", verdict: "contradict", impact: { ai: -8 },
      title: "China's DeepSeek low-cost AI model makes waves. NVIDIA falls 17% in a day",
      short: "DeepSeek shock, −17%",
      ai: "A question emerges: will AI need less compute? We log it as Contradicts for the demand claim and check at the next earnings.",
      source: "https://www.cnbc.com/2025/01/27/nvidia-sheds-almost-600-billion-in-market-cap-biggest-drop-ever.html" },
    { date: "2025-04-15", kind: "policy", claim: "dc", verdict: "contradict", impact: { dc: -6 },
      title: "US requires export licenses for H20 sales to China too. NVIDIA to take up to $5.5bn in charges",
      short: "H20 export curbs, $5.5bn",
      ai: "China data center revenue can no longer be counted on. The demand claim now carries a regional limit.",
      source: "https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidia-writes-off-usd5-5-billion-in-gpus-as-us-govt-chokes-off-supply-of-h20s-to-china" },
    { date: "2025-11-19", kind: "earnings", claim: "dc", verdict: "support", impact: { dc: 4, ai: 4 },
      title: "NVIDIA Aug–Oct: data center revenue +66% to $51.2bn",
      short: "Data center +66%",
      ai: "Even without China, data center keeps growing. The numbers do not confirm the DeepSeek worry.",
      source: NV("third-quarter-fiscal-2026") },
    { date: "2026-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "William Blair LCG: position cut to 1.30M shares (about half of peak). Weight in fund steady at about 14%",
      ai: "Fewer shares, but a nearly constant weight. This looks like an adjustment for lower fund assets; nothing shows the thesis changed.",
      source: LCG("000141036826080429") },
    { date: "2026-08-26", kind: "earnings", claim: "ai", verdict: "support", impact: { ai: 4, dc: 4 },
      title: "NVIDIA May–Jul: data center revenue +117% to $89bn. CEO: \"demand is accelerating\"",
      short: "Data center +117%",
      ai: "The fund's 2023 call that demand would accelerate still holds three years later.",
      source: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027" },
    { date: "2026-11-12", kind: "company", claim: null, verdict: "neutral", impact: {},
      title: "Jensen Huang steps down as CEO and director. CFO Colette Kress named interim CEO",
      short: "CEO steps down",
      ai: "A point not in the thesis. Apart from the demand claim, we add leadership as a new watchlist item. The stock is down about 30% from its October high.",
      source: "https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition" }
  ],
  summaryHTML: `
    <h3>Replay complete: NVDA (Jun 2021 → Nov 2026)</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">The fund sold out while the thesis claims were sound, then bought back at about 2.6x the price. Neither the reason to sell nor the conditions to buy back were recorded.</p>
    <div class="grid">
      <div><div class="v pos">+638pt</div><div class="l">Held from the first buy (stock +714%, S&amp;P 500 +76%)</div></div>
      <div><div class="v pos">+128%</div><div class="l">William Blair LCG's actual P&amp;L (est. about $270M). Trading the S&amp;P on the same dates: +24%</div></div>
      <div><div class="v neg">−23pt</div><div class="l">vs S&amp;P 500 at the sale (review signal, Sep 2022). The stock lagged, but the thesis was sound</div></div>
    </div>
    <ul>
      <li><b>When the fund sold, the thesis claims had not broken.</b> Data center revenue was up 61% YoY. What broke was gaming demand, outside the thesis.</li>
      <li><b>The checkpoint was met while the fund held zero.</b> Data center revenue doubled within two years. The re-buy was at about 2.6x the sale price, costing about $40M more for the same share count. The first round trip locked in an est. −42% (about −$18M).</li>
      <li><b>In the end it still beat the market by a wide margin.</b> The thesis was about demand, and demand came through. This tool makes the PM record which claim broke at the sale and keeps tracking the thesis afterward.</li>
    </ul>
    <p class="foot">Prices are approximate, linearly interpolated between split-adjusted closes. Excludes dividends. Fund P&amp;L is estimated from quarterly share counts (SEC N-PORT, William Blair Large Cap Growth Fund), assuming trades at each quarter's average price. The first buy uses the end-Jun 2021 close. The S&amp;P comparison trades the same dollars on the same dates; after the 2026 sale the S&amp;P balance turns slightly negative. AI reads are pre-computed for the replay.</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">Close</button><button type="button" onclick="document.getElementById('reset').click()">Replay</button></div>`
};
