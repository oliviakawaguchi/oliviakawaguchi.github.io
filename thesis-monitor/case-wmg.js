// Time Machine case: Warner Music Group (WMG), thesis from Cooke & Bieler Large Cap Value 4Q2022 commentary ("Initiations").
//   https://www.cooke-bieler.com/uploads/pdf/large-cap-value-4Q2022-commentary.pdf
// Financials: WMG quarterly results (SEC 8-K Ex.99.1, CIK 1319161). Fiscal year ends Sep 30; quarters below are labelled by calendar quarter of period end.
// Prices: Yahoo Finance daily closes (match the 13F implied prices). AI judgments are pre-computed for the replay.
// Fund holdings: Cooke & Bieler LP FIRM-LEVEL 13F-HR (CIK 24386, CUSIP 934550203), all WMG lines summed. Firm-wide across all strategies, not the LCV sleeve alone.
//   2022Q3 (0 sh) https://www.sec.gov/Archives/edgar/data/24386/000002438622000006/inftable.xml
//   2022Q4 https://www.sec.gov/Archives/edgar/data/24386/000002438623000002/inftable.xml
//   2023Q1 https://www.sec.gov/Archives/edgar/data/24386/000002438623000003/inftable.xml
//   2023Q2 https://www.sec.gov/Archives/edgar/data/24386/000002438623000004/inftable.xml
//   2023Q3 https://www.sec.gov/Archives/edgar/data/24386/000002438623000005/inftable.xml
//   2023Q4 https://www.sec.gov/Archives/edgar/data/24386/000002438624000001/inftable.xml
//   2024Q1 https://www.sec.gov/Archives/edgar/data/24386/000002438624000003/inftable.xml
//   2024Q2 https://www.sec.gov/Archives/edgar/data/24386/000002438624000004/inftable.xml
//   2024Q3 https://www.sec.gov/Archives/edgar/data/24386/000002438624000014/inftable.xml
//   2024Q4 https://www.sec.gov/Archives/edgar/data/24386/000002438625000001/inftable.xml
//   2025Q1 https://www.sec.gov/Archives/edgar/data/24386/000002438625000003/inftable.xml
//   2025Q2 https://www.sec.gov/Archives/edgar/data/24386/000002438625000004/inftable.xml
//   2025Q3 https://www.sec.gov/Archives/edgar/data/24386/000002438625000009/inftable.xml
//   2025Q4 https://www.sec.gov/Archives/edgar/data/24386/000002438626000002/inftable.xml
//   2026Q1 https://www.sec.gov/Archives/edgar/data/24386/000002438626000005/inftable.xml
//   2026Q2 https://www.sec.gov/Archives/edgar/data/24386/000002438626000006/inftable.xml
//   2026Q3 https://www.sec.gov/Archives/edgar/data/24386/000002438626000009/inftable.xml (latest 13F)
// Valuation multiple (ev_oibda, APPROXIMATE): EV = close on the release date x ~520M Class A+B shares (approx.) + net debt as disclosed in that release,
//   divided by trailing-12-month Adjusted OIBDA from the releases. At entry (2022-12-30 close $35.02, FY22 adj. OIBDA $1,149M, net debt $3.148B) ~18.6x, shown as "about 19x".
// Fund P&L: each quarter's share change traded at the average of the two quarter-end closes. First step = 2,336,194 sh bought at the 2022Q4 average
//   of quarter-end closes ((23.21+35.02)/2 = 29.115); C&B's commentary lists WMG as a top Q4 contributor, so the buy was made during the quarter.
//   Result at 2026-11-13 ($32.30): cost $210.0M, proceeds $110.6M, 3,306,697 sh left -> P&L about +$7M (+4%). Flow-matched S&P 500: about +$126M (+60%). Dividends excluded.
const WX = q => ({
  "2022Q3":"https://www.sec.gov/Archives/edgar/data/1319161/000131916122000033/q42022ex991.htm",
  "2022Q4":"https://www.sec.gov/Archives/edgar/data/1319161/000131916123000007/q12023ex991.htm",
  "2023Q1":"https://www.sec.gov/Archives/edgar/data/1319161/000131916123000017/q22023ex991.htm",
  "2023Q2":"https://www.sec.gov/Archives/edgar/data/1319161/000131916123000025/q32023ex991.htm",
  "2023Q3":"https://www.sec.gov/Archives/edgar/data/1319161/000131916123000032/q42023ex991.htm",
  "2023Q4":"https://www.sec.gov/Archives/edgar/data/1319161/000131916124000007/q12024ex991.htm",
  "2024Q1":"https://www.sec.gov/Archives/edgar/data/1319161/000131916124000018/q22024ex991.htm",
  "2024Q2":"https://www.sec.gov/Archives/edgar/data/1319161/000131916124000025/q32024ex991.htm",
  "2024Q3":"https://www.sec.gov/Archives/edgar/data/1319161/000131916124000037/q42024ex991.htm",
  "2024Q4":"https://www.sec.gov/Archives/edgar/data/1319161/000131916125000005/q12025ex991wspot.htm",
  "2025Q1":"https://www.sec.gov/Archives/edgar/data/1319161/000131916125000014/q22025ex991.htm",
  "2025Q2":"https://www.sec.gov/Archives/edgar/data/1319161/000131916125000022/q32025ex991.htm",
  "2025Q3":"https://www.sec.gov/Archives/edgar/data/1319161/000131916125000032/q42025ex991.htm",
  "2025Q4":"https://www.sec.gov/Archives/edgar/data/1319161/000131916126000007/q12026ex991.htm",
  "2026Q1":"https://www.sec.gov/Archives/edgar/data/1319161/000131916126000021/q22026ex991.htm",
  "2026Q2":"https://www.sec.gov/Archives/edgar/data/1319161/000131916126000031/q32026ex991.htm"
}[q]);
const CB13F = id => `https://www.sec.gov/Archives/edgar/data/24386/${id}/inftable.xml`;

(window.CASES = window.CASES || {}).wmg = {
  ticker: "WMG",
  name: "Warner Music Group",
  holder: "Cooke & Bieler (Large Cap Value) · New position in Q4 2022",
  holderShort: "C&B (held, trimmed in 2026)",
  thesis: "Streaming makes it easier for labels to monetize song IP. An early finisher of the digital shift, its large catalog and distribution reach form a high barrier to entry. The 2022 sell-off was a market overreaction to poorly explained, temporary hits to revenue and margins, an opening for long-term investors.",
  start: "2022-12-31",
  end: "2026-11-13",
  kinds: { earnings: "Earnings", company: "Company", peer: "Peer", analyst: "Analyst", policy: "Policy & legal", macro: "Macro", fund: "Fund trade" },
  claims: [
    { id: "stream", label: "Streaming drives monetization of song IP",           short: "Streaming monetization", kpi: "Recorded Music streaming revenue YoY", start: 72 },
    { id: "temp",   label: "Hits to revenue and margins are temporary",                 short: "Hits temporary",       kpi: "Adj. OIBDA YoY, adj. OIBDA margin", start: 66 },
    { id: "moat",   label: "A large catalog is a high barrier to entry",             short: "Barrier to entry",             kpi: "Deals with major platforms, response to AI music", start: 70 },
    { id: "rerate", label: "When results recover, the multiple recovers too (added by AI)", short: "Multiple recovers",         kpi: "EV/adj. OIBDA (TTM). About 19x at purchase", start: 66 }
  ],
  timer: {
    label: "Overreaction temporary (rerating)",
    claimId: "rerate",
    deadline: "2024-11-21",
    metric: "By FY2024 results, EV/adj. OIBDA returns to about 19x at purchase as results recover (\"overreaction to temporary hits\" set to resolve within two fiscal years)",
    metAt: null,
    cue: "The KPIs stay green; FY2024 adj. OIBDA is up 16%. But the multiple fell from about 19x to 14x. Here the app asks the PM to write down why the market won't rerate it.",
    expiredTitle: "Rerating timer expired: results recovered, multiple about 19x → about 14x",
    expiredText: "FY2024 adj. OIBDA rose 16% and margins improved. Yet EV/adj. OIBDA is about 14x, short of about 19x at purchase. The fundamentals claims are Intact, but the \"multiple recovers\" premise has broken. We recommend recording why the market won't rerate the stock and rewriting the case for holding."
  },
  signal: { date: "2024-11-21" },
  holdingsLabel: "Cooke & Bieler actual shares held (SEC 13F, firm-wide)",
  holdings: [
    { date: "2022-12-31", shares: 2336194 }, { date: "2023-03-31", shares: 1930583 }, { date: "2023-06-30", shares: 4818606 },
    { date: "2023-09-30", shares: 4757699 }, { date: "2023-12-31", shares: 4638781 }, { date: "2024-03-31", shares: 4229979 },
    { date: "2024-06-30", shares: 5061093 }, { date: "2024-09-30", shares: 6017387, label: "6.02M" }, { date: "2024-12-31", shares: 5891179 },
    { date: "2025-03-31", shares: 5751655 }, { date: "2025-06-30", shares: 5640604 }, { date: "2025-09-30", shares: 5255091 },
    { date: "2025-12-31", shares: 5243498 }, { date: "2026-03-31", shares: 4770594 }, { date: "2026-06-30", shares: 4620824 },
    { date: "2026-09-30", shares: 3306697, label: "3.31M" }
  ],
  fund: { name: "C&B", steps: [
    {date:"2022-12-31",shares:2336194,cost:68018288,proceeds:0},
    {date:"2023-03-31",shares:1930583,cost:68018288,proceeds:13869868},
    {date:"2023-06-30",shares:4818606,cost:153879212,proceeds:13869868},
    {date:"2023-09-30",shares:4757699,cost:153879212,proceeds:15620640},
    {date:"2023-12-31",shares:4638781,cost:153879212,proceeds:19615690},
    {date:"2024-03-31",shares:4229979,cost:153879212,proceeds:33680523},
    {date:"2024-06-30",shares:5061093,cost:180337726,proceeds:33680523},
    {date:"2024-09-30",shares:6017387,cost:209958933,proceeds:33680523},
    {date:"2024-12-31",shares:5891179,cost:209958933,proceeds:37611902},
    {date:"2025-03-31",shares:5751655,cost:209958933,proceeds:41961563},
    {date:"2025-06-30",shares:5640604,cost:209958933,proceeds:45214802},
    {date:"2025-09-30",shares:5255091,cost:209958933,proceeds:57030775},
    {date:"2025-12-31",shares:5243498,cost:209958933,proceeds:57405983},
    {date:"2026-03-31",shares:4770594,cost:209958933,proceeds:70696950},
    {date:"2026-06-30",shares:4620824,cost:209958933,proceeds:74636649},
    {date:"2026-09-30",shares:3306697,cost:209958933,proceeds:110564882}
  ] },
  // Intra-quarter points 2024-11-21 and 2026-05-22: WMG daily close; S&P 500 linearly interpolated between quarter-ends (approx.).
  series: [
    {"date":"2022-12-31","price":35.02,"spx":3839.5},{"date":"2023-03-31","price":33.37,"spx":4109.31},{"date":"2023-06-30","price":26.09,"spx":4450.38},
    {"date":"2023-09-30","price":31.40,"spx":4288.05},{"date":"2023-12-31","price":35.79,"spx":4769.83},{"date":"2024-03-31","price":33.02,"spx":5254.35},
    {"date":"2024-06-30","price":30.65,"spx":5460.48},{"date":"2024-09-30","price":31.30,"spx":5762.48},{"date":"2024-11-21","price":31.18,"spx":5830},
    {"date":"2024-12-31","price":31.00,"spx":5881.63},{"date":"2025-03-31","price":31.35,"spx":5611.85},{"date":"2025-06-30","price":27.24,"spx":6204.95},
    {"date":"2025-09-30","price":34.06,"spx":6688.46},{"date":"2025-12-31","price":30.67,"spx":6845.5},{"date":"2026-03-31","price":25.54,"spx":6528.52},
    {"date":"2026-05-22","price":34.72,"spx":7083},{"date":"2026-06-30","price":27.07,"spx":7499.36},{"date":"2026-09-30","price":27.61,"spx":7651.54},
    {"date":"2026-11-13","price":32.30,"spx":7561.67}
  ],
  // stream_yoy = Recorded Music streaming revenue y/y as reported; oibda_yoy / margin = Adjusted OIBDA as reported; ev_oibda = approximate (see header).
  // FY2026 Q4 (Jul–Sep 2026) results were not yet released as of 2026-11-13.
  reports: [
    {"date":"2022-11-22","q":"2022Q3","stream_yoy":-0.4,"oibda_yoy":22,"margin":17.7,"ev_oibda":16.8},
    {"date":"2023-02-09","q":"2022Q4","stream_yoy":0.5,"oibda_yoy":-6,"margin":22.5,"ev_oibda":19.0},
    {"date":"2023-05-09","q":"2023Q1","stream_yoy":-0.4,"oibda_yoy":4,"margin":20.4,"ev_oibda":14.7},
    {"date":"2023-08-08","q":"2023Q2","stream_yoy":6.3,"oibda_yoy":16,"margin":19.0,"ev_oibda":17.2},
    {"date":"2023-11-16","q":"2023Q3","stream_yoy":9.6,"oibda_yoy":20,"margin":20.0,"ev_oibda":15.8},
    {"date":"2024-02-07","q":"2023Q4","stream_yoy":13.7,"oibda_yoy":35,"margin":25.8,"ev_oibda":16.3},
    {"date":"2024-05-09","q":"2024Q1","stream_yoy":7.1,"oibda_yoy":9,"margin":20.9,"ev_oibda":14.8},
    {"date":"2024-08-07","q":"2024Q2","stream_yoy":5.0,"oibda_yoy":6,"margin":20.3,"ev_oibda":13.1},
    {"date":"2024-11-21","q":"2024Q3","stream_yoy":2.1,"oibda_yoy":11,"margin":21.7,"ev_oibda":13.6},
    {"date":"2025-02-06","q":"2024Q4","stream_yoy":-3.7,"oibda_yoy":-20,"margin":21.8,"ev_oibda":14.6},
    {"date":"2025-05-08","q":"2025Q1","stream_yoy":-0.4,"oibda_yoy":-3,"margin":20.4,"ev_oibda":13.5},
    {"date":"2025-08-07","q":"2025Q2","stream_yoy":3.7,"oibda_yoy":18,"margin":22.1,"ev_oibda":14.4},
    {"date":"2025-11-20","q":"2025Q3","stream_yoy":7.5,"oibda_yoy":15,"margin":21.7,"ev_oibda":13.3},
    {"date":"2026-02-05","q":"2025Q4","stream_yoy":12.4,"oibda_yoy":28,"margin":25.2,"ev_oibda":11.8},
    {"date":"2026-05-07","q":"2026Q1","stream_yoy":16.5,"oibda_yoy":31,"margin":22.9,"ev_oibda":12.3},
    {"date":"2026-08-05","q":"2026Q2","stream_yoy":11.8,"oibda_yoy":16,"margin":23.2,"ev_oibda":10.4}
  ],
  kpiCards: [
    { key: "stream_yoy", label: "Recorded Music streaming YoY", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v >= 5 ? "pos" : v >= 0 ? "wrn" : "neg" },
    { key: "oibda_yoy", label: "Adj. OIBDA YoY", fmt: v => (v > 0 ? "+" : "") + v.toFixed(0) + "%", judge: v => v >= 5 ? "pos" : v >= 0 ? "wrn" : "neg" },
    { key: "margin", label: "Adj. OIBDA margin", fmt: v => v.toFixed(1) + "%", judge: v => v >= 20 ? "pos" : "wrn" },
    { key: "ev_oibda", label: "EV/adj. OIBDA (approx.; about 19x at purchase)", fmt: v => v.toFixed(1) + "x", judge: v => v >= 17 ? "pos" : v >= 14 ? "wrn" : "neg" }
  ],
  events: [
    { date: "2022-12-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "C&B: new position of 2.34M shares (Q4 2022, firm-wide 13F)",
      ai: "A new buy after the stock sold off in the first half. The thesis: streaming drives monetization, and the drop was an overreaction to temporary hits. Entry multiple is about 19x EV/adj. OIBDA.",
      source: CB13F("000002438623000002") },
    { date: "2023-02-09", kind: "earnings", claim: "temp", verdict: "support", impact: { temp: 3, stream: -2 },
      title: "WMG Oct–Dec: revenue −8% (extra week in prior year, FX). Adj. OIBDA margin improves to 22.5%",
      short: "Margin up to 22.5%",
      ai: "The revenue drop is explained by the extra week and FX. Margins are up, a small Supports for \"hits temporary.\" First results under new CEO Robert Kyncl.",
      source: WX("2022Q4") },
    { date: "2023-04-18", kind: "peer", claim: "moat", verdict: "contradict", impact: { moat: -4, rerate: -3 },
      title: "AI-made fake \"Drake & The Weeknd\" song goes viral; pulled from platforms after UMG objects",
      short: "Fake AI song goes viral",
      ai: "A point not in the thesis. If AI can mimic established artists' voices, catalog scarcity comes into question. It is a peer event for now, but we log it because it could weigh on sector valuations.",
      source: "https://www.cbsnews.com/amp/news/ai-song-drake-the-weeknd-pulled-off-digital-platforms" },
    { date: "2023-05-09", kind: "earnings", claim: "stream", verdict: "contradict", impact: { stream: -6, rerate: -4 },
      title: "WMG Jan–Mar: Recorded Music streaming revenue −0.4% YoY. Stock about −10% on the day",
      short: "Streaming −0.4%",
      ai: "Streaming, the core of the thesis, is not growing. The company cites FX and a light release slate. Margins improved, so the weakness is limited to revenue.",
      source: WX("2023Q1") },
    { date: "2023-06-02", kind: "analyst", claim: "rerate", verdict: "contradict", impact: { rerate: -6, moat: -4 },
      title: "Atlantic Equities downgrades WMG: \"AI-generated music casts a big shadow over the whole industry\"",
      short: "Downgrade on AI",
      ai: "This Contradicts the valuation premise, not the fundamentals. AI worries hang over the whole industry, not just the company, so the multiple may not recover even if results do.",
      alert: "warn", alertTitle: "At risk: AI becomes a valuation issue",
      alertText: "The downgrade cites an industry-wide worry about AI music more than current results. The premise that the multiple recovers with results needs a separate yardstick.",
      source: "https://www.investing.com/news/stock-market-news/warner-music-group-cut-at-atlantic-equities-on-ai-concerns-432SI-3097258" },
    { date: "2023-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "C&B: added 2.89M shares in Apr–Jun, up to 4.82M",
      ai: "The fund grew the position 2.5x as the stock fell to the $26 range. In line with the thesis, it saw the drop as an opportunity.",
      source: CB13F("000002438623000004") },
    { date: "2023-08-08", kind: "earnings", claim: "stream", verdict: "support", impact: { stream: 6, temp: 5 },
      title: "WMG Apr–Jun: streaming +6.3%, adj. OIBDA +16%. Company sees momentum continuing into the second half",
      short: "Streaming +6.3%",
      ai: "Streaming is growing again. Profit grew double digits too, which Supports \"hits temporary.\"",
      source: WX("2023Q2") },
    { date: "2023-11-16", kind: "earnings", claim: "temp", verdict: "support", impact: { temp: 6, stream: 4, rerate: -3 },
      title: "WMG FY2023: revenue tops $6bn for the first time. Jul–Sep adj. OIBDA +20%. Stock about −5% on the day",
      short: "Revenue over $6bn, OIBDA +20%",
      ai: "The fundamentals claims are on track. But the stock fell on good results. We log that results and the stock are starting to diverge.",
      source: WX("2023Q3") },
    { date: "2024-02-07", kind: "earnings", claim: "temp", verdict: "support", impact: { temp: 6, stream: 6, rerate: -4 },
      title: "WMG Oct–Dec: revenue +17%, adj. OIBDA +35%, streaming +13.7%. Also a $200M annual cost-cut plan",
      short: "Adj. OIBDA +35%",
      ai: "Record quarterly revenue; every fundamentals claim gets a Supports. Still, the stock fell about 3% in two days. The multiple is about 16x vs about 19x at purchase. No rerating yet.",
      cue: "Look at the KPIs bottom right. Adj. OIBDA is up 35%. Yet the multiple has slipped from about 19x to about 16x.",
      source: WX("2023Q4") },
    { date: "2024-05-09", kind: "earnings", claim: "rerate", verdict: "contradict", impact: { rerate: -6, stream: -2 },
      title: "WMG Jan–Mar: adj. OIBDA +9%, streaming +7.1%, ad-supported +3.9%. Stock about −11% in two days",
      short: "Profit up, stock −11%",
      ai: "Profit is growing, but the stock fell sharply. The market cares more about how durable streaming growth is than about current earnings.",
      source: WX("2024Q1") },
    { date: "2024-06-24", kind: "policy", claim: "moat", verdict: "contradict", impact: { moat: -5 },
      title: "Major labels including WMG sue AI music services Suno and Udio for copyright infringement",
      short: "Labels sue AI music services",
      ai: "AI song generation has grown large enough to need lawsuits. A win would prove the barrier to entry, but until a ruling it may weigh on the multiple.",
      source: "https://www.news4jax.com/business/2024/06/24/music-record-labels-sue-ai-song-generators-suno-and-udio-for-copyright-infringement/" },
    { date: "2024-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "C&B: position peaks at 6.02M shares (end of Q3 2024)",
      ai: "The fund kept adding as the multiple fell. As value investors, it saw a stock getting cheaper on good results as an opportunity.",
      source: CB13F("000002438624000014") },
    { date: "2024-11-21", kind: "earnings", claim: "rerate", verdict: "contradict", impact: { rerate: -6, temp: 2 },
      title: "WMG FY2024: full-year adj. OIBDA +16% ($1.43bn). Stock about −7% on the day",
      short: "FY OIBDA +16%, stock −7%",
      ai: "The deadline print. The fundamentals claims held. Yet the multiple is about 14x, short of about 19x at purchase. Two years on, \"results recover, the multiple recovers\" has not happened.",
      source: WX("2024Q3") },
    { date: "2025-02-06", kind: "company", claim: "moat", verdict: "support", impact: { moat: 5, stream: -4 },
      title: "WMG and Spotify sign a new multi-year deal. Same-day Oct–Dec results: adj. OIBDA −20% (lapping a one-off gain)",
      short: "New Spotify deal",
      ai: "A new deal with its largest platform shows the catalog's bargaining power. The profit drop mainly reflects lapping last year's one-off income.",
      source: WX("2024Q4") },
    { date: "2025-05-08", kind: "earnings", claim: "stream", verdict: "contradict", impact: { stream: -6, rerate: -4 },
      title: "WMG Jan–Mar: streaming −0.4%, adj. OIBDA −3%. Stock about −8% on the day",
      short: "Streaming −0.4%",
      ai: "Amber for the fundamentals claims too. The company blames tough comps from last year. We watch whether growth returns over the next two quarters.",
      source: WX("2025Q1") },
    { date: "2025-11-20", kind: "earnings", claim: "stream", verdict: "support", impact: { stream: 5, temp: 3 },
      title: "WMG Jul–Sep: record quarterly revenue (+15%), streaming +7.5%. FY2026 margin seen up 1.5–2.0pt",
      short: "Record revenue",
      ai: "Results reaccelerated. The company also points to new revenue opportunities from AI. The multiple is about 13x, still not recovered.",
      source: WX("2025Q3") },
    { date: "2025-11-25", kind: "company", claim: "moat", verdict: "support", impact: { moat: 6 },
      title: "WMG settles with Suno and signs a license deal. Also signs with Udio and Stability AI",
      short: "License deals with AI firms",
      ai: "AI firms it was suing now pay to use the catalog. Supports the barrier-to-entry claim.",
      source: "https://www.musicbusinessworldwide.com/warner-music-group-settles-with-suno/" },
    { date: "2026-02-05", kind: "earnings", claim: "temp", verdict: "support", impact: { temp: 4, stream: 6, rerate: -6 },
      title: "WMG Oct–Dec: adj. OIBDA +28%, streaming +12.4%, margin 25.2%. Stock roughly flat",
      short: "OIBDA +28%, stock flat",
      ai: "All three fundamentals KPIs are in line with the thesis. Yet the multiple fell to about 12x. Three years after purchase, the gap between results and valuation keeps widening.",
      source: WX("2025Q4") },
    { date: "2026-02-24", kind: "analyst", claim: "rerate", verdict: "contradict", impact: { rerate: -8, moat: -4 },
      title: "Rothschild & Co Redburn: music rights holders are \"particularly exposed\" to the threat of AI-generated content",
      short: "AI \"exposure\" flagged",
      ai: "The market keeps citing AI as the reason the multiple won't recover. Results cannot rebut this kind of worry.",
      alert: "bad", alertTitle: "Contradicts: record results, multiple at about 60% of entry",
      alertText: "Adj. OIBDA is up 28%. Yet EV/adj. OIBDA is about 12x, roughly 60% of the about 19x at purchase. Unless AI worries clear, results alone may not bring the multiple back.",
      source: "https://www.musicbusinessworldwide.com/robert-kyncl-tells-wmg-shareholders-ai-is-musics-next-growth-engine-not-its-downfall/" },
    { date: "2026-05-07", kind: "earnings", claim: "rerate", verdict: "support", impact: { rerate: 6, stream: 5 },
      title: "WMG Jan–Mar: streaming +16.5%, adj. OIBDA +31%. Stock about +10% in two days",
      short: "Stock +10% in two days",
      ai: "For the first time, the stock clearly responded to good results. But the multiple is about 12x, still far from the entry level.",
      source: WX("2026Q1") },
    { date: "2026-07-31", kind: "peer", claim: "rerate", verdict: "contradict", impact: { rerate: -8 },
      title: "UMG plunges after results as AI-driven \"dilution\" becomes the issue. WMG CFO departs; stock about −11% in two days",
      short: "UMG plunges, WMG −11%",
      ai: "A peer's results reignited AI worries. May's gains are almost gone.",
      source: "https://www.digitalmusicnews.com/?p=350138" },
    { date: "2026-08-05", kind: "earnings", claim: "stream", verdict: "support", impact: { stream: 4, temp: 2, rerate: -4 },
      title: "WMG Apr–Jun: subscription streaming grows double digits, adj. OIBDA +16%. Multiple about 10x",
      short: "OIBDA +16%, about 10x",
      ai: "Results have met plan for five straight quarters. The multiple is about half of entry. What the market is pricing in needs to be put into words.",
      source: WX("2026Q2") },
    { date: "2026-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "C&B: sold 1.31M shares in Jul–Sep, down to 3.31M (45% below peak)",
      ai: "The fund cut the position sharply while results were strong. No reason was disclosed. The multiple's failure to recover may have played a part.",
      cue: "In 2026, adj. OIBDA grew 16–31%, but the multiple sank to about 10x and C&B cut 28%. Its est. P&L here is about −3%, vs about +61% in the S&P.",
      source: CB13F("000002438626000009") }
  ],
  summaryHTML: `
    <h3>Replay complete: WMG (Dec 2022 → Nov 2026)</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">The fundamentals claims were mostly right. Yet the stock is below its purchase price. What failed was an unwritten premise: that the multiple would recover.</p>
    <div class="grid">
      <div><div class="v neg">−105pt</div><div class="l">Held from the first purchase price (stock −8%, S&amp;P 500 +97%)</div></div>
      <div><div class="v">+4%</div><div class="l">C&amp;B's actual P&amp;L (est. about +$7M, still held). Trading the S&amp;P on the same dates: +60% (gap −56pt)</div></div>
      <div><div class="v neg">−63pt</div><div class="l">vs S&amp;P 500 at the review signal (Nov 2024, approx.)</div></div>
    </div>
    <ul>
      <li><b>KPIs stayed green; only the multiple kept falling.</b> Adj. OIBDA rose from $1.15bn in FY2022 to about $1.7bn TTM. Meanwhile EV/adj. OIBDA fell from about 19x to about 10x.</li>
      <li><b>AI worries, not results, drove the derating.</b> The worry hangs over the whole industry, so the company's strong results alone could not rebut it.</li>
      <li><b>A review that looks only at results raises no flag.</b> Making the PM write down, with a deadline, why the market won't rerate the stock makes the case for holding easier to test.</li>
    </ul>
    <p class="foot">Prices are approximate, linearly interpolated between quarter-end closes. Excludes dividends. C&amp;B P&amp;L is estimated from firm-wide 13F quarter-end share counts, assuming trades at each quarter's average price, and includes strategies other than Large Cap Value. EV/adj. OIBDA is approximate: release-date close × about 520M shares + company-disclosed net debt, divided by TTM adj. OIBDA. AI reads are pre-computed for the replay.</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">Close</button><button type="button" onclick="document.getElementById('reset').click()">Replay</button></div>`
};
