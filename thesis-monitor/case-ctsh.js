// Time Machine case: Cognizant (CTSH), thesis from Brandes Global Equity Fund Q4 2022 commentary
//   https://web.archive.org/web/20230326142935/https://www.brandes.com/docs/librariesprovider6/default-library/publication/commentary/brandes-global-equity-fund-quarterly-commentary-mutual-funds.pdf?sfvrsn=8f38109d_12
// Financials: CTSH quarterly results (SEC 8-K Ex.99.1, CIK 1058290). AI risk-factor wording: CTSH 10-K filings (FY2022 has none; FY2023 first).
// Prices: Yahoo Finance daily closes (quarter-end closes match N-PORT value/shares). AI judgments are pre-computed for the replay.
// Fund holdings: Brandes Global Equity Fund quarter-end N-PORT-P (mutual fund, series level).
//   Series S000023589 (Brandes Investment Trust, CIK 926678) through 2024Q2 -> S000084887 (Datum One Series Trust, CIK 1806095) from 2024Q3, same adviser.
//   2022Q3 (0 sh)  https://www.sec.gov/Archives/edgar/data/926678/000114554922067555/primary_doc.xml
//   2022Q4 https://www.sec.gov/Archives/edgar/data/926678/000114554923010309/primary_doc.xml
//   2023Q1 https://www.sec.gov/Archives/edgar/data/926678/000114554923027645/primary_doc.xml
//   2023Q2 https://www.sec.gov/Archives/edgar/data/926678/000114554923049721/primary_doc.xml
//   2023Q3 https://www.sec.gov/Archives/edgar/data/926678/000114554923068250/primary_doc.xml
//   2023Q4 https://www.sec.gov/Archives/edgar/data/926678/000114554924007700/primary_doc.xml
//   2024Q1 https://www.sec.gov/Archives/edgar/data/926678/000114554924030982/primary_doc.xml
//   2024Q2 https://www.sec.gov/Archives/edgar/data/926678/000114554924051717/primary_doc.xml
//   2024Q3 https://www.sec.gov/Archives/edgar/data/1806095/000114554924070091/primary_doc.xml
//   2024Q4 https://www.sec.gov/Archives/edgar/data/1806095/000114554925008995/primary_doc.xml
//   2025Q1 https://www.sec.gov/Archives/edgar/data/1806095/000114554925032660/primary_doc.xml
//   2025Q2 https://www.sec.gov/Archives/edgar/data/1806095/000206657825000260/primary_doc.xml
//   2025Q3 https://www.sec.gov/Archives/edgar/data/1806095/000206657825001126/primary_doc.xml
//   2025Q4 https://www.sec.gov/Archives/edgar/data/1806095/000206657826000591/primary_doc.xml
//   2026Q1 https://www.sec.gov/Archives/edgar/data/1806095/000206657826001542/primary_doc.xml
//   2026Q2 https://www.sec.gov/Archives/edgar/data/1806095/000206657826002671/primary_doc.xml  (latest available; 2026Q3 not yet filed)
// Note: Brandes also held small CTSH positions in the U.S. Value Fund (2021Q4-2023Q3, liquidated); this case uses the Global Equity Fund only.
// AI-added claim: based only on what was public at entry (ChatGPT released 2022-11-30). CTSH's FY2022 10-K (filed 2023-02-15) has no AI-substitution risk factor.
const CT = q => ({
  "2022Q4":"https://www.sec.gov/Archives/edgar/data/1058290/000105829023000019/exhibit99112312022.htm",
  "2023Q1":"https://www.sec.gov/Archives/edgar/data/1058290/000105829023000132/exhibit9913312023.htm",
  "2023Q2":"https://www.sec.gov/Archives/edgar/data/1058290/000105829023000255/exhibit9916302023.htm",
  "2023Q3":"https://www.sec.gov/Archives/edgar/data/1058290/000105829023000329/exhibit9919302023.htm",
  "2023Q4":"https://www.sec.gov/Archives/edgar/data/1058290/000105829024000013/exhibit99112312023.htm",
  "2024Q3":"https://www.sec.gov/Archives/edgar/data/1058290/000105829024000325/exhibit9919302024.htm",
  "2025Q2":"https://www.sec.gov/Archives/edgar/data/1058290/000105829025000266/exhibit9916302025.htm",
  "2025Q4":"https://www.sec.gov/Archives/edgar/data/1058290/000105829026000003/exhibit99112312025.htm",
  "2026Q1":"https://www.sec.gov/Archives/edgar/data/1058290/000105829026000015/exhibit9913312026.htm",
  "2026Q2":"https://www.sec.gov/Archives/edgar/data/1058290/000105829026000030/exhibit9916302026.htm",
  "2026Q3":"https://www.sec.gov/Archives/edgar/data/1058290/000105829026000039/exhibit9919302026.htm"
}[q]);
const BNP = (cik, id) => `https://www.sec.gov/Archives/edgar/data/${cik}/${id}/primary_doc.xml`;

(window.CASES = window.CASES || {}).ctsh = {
  ticker: "CTSH",
  name: "Cognizant",
  holder: "Brandes Global Equity Fund (Brandes Investment Partners) · New position in Q4 2022",
  holderShort: "Brandes (added amid AI worries)",
  thesis: "Large IT services firm. The stock fell on worries about the economy, staff attrition, rising costs and slowing IT spend. Its digital focus and ability to help clients cut costs keep long-term growth going through short-term headwinds. A wider margin of safety prompted a new buy.",
  start: "2022-12-31",
  end: "2026-11-13",
  kinds: { earnings: "Earnings", company: "Company", peer: "Peer", macro: "AI & Macro", policy: "Policy", fund: "Fund trade" },
  claims: [
    { id: "temp",    label: "IT spend slowdown, attrition and cost headwinds are temporary",          short: "Headwinds temporary", kpi: "Revenue growth (constant currency), FY guidance", start: 70 },
    { id: "digital", label: "Digital focus and cost-cutting help sustain long-term growth",      short: "Long-term growth",     kpi: "TTM bookings growth, large deals", start: 72 },
    { id: "mos",     label: "Wider margin of safety; bought cheap",                    short: "Margin of safety",     kpi: "Stock vs S&P, adjusted EPS", start: 68 },
    { id: "ai",      label: "Low risk that generative AI shrinks billable work or pricing (added by AI)", short: "AI resilience", kpi: "Peer and company AI comments, deal pricing, bookings growth", start: 60 }
  ],
  timer: {
    label: "Headwinds temporary",
    claimId: "temp",
    deadline: "2024-02-06",
    metric: "Quarterly revenue returns to positive YoY in constant currency, ex-acquisitions (\"short-term headwinds\" in the original thesis set at one year, with FY2023 results as the deadline)",
    metAt: "2024-10-30",
    expiredTitle: "Headwind timer expired: FY2023 revenue −0.3% in constant currency",
    expiredText: "At the FY2023 deadline print, revenue was still below the prior year. The company sees −2% to +2% for 2024. The \"temporary\" premise is not yet confirmed."
  },
  signal: { date: "2024-02-14" },
  holdingsLabel: "Brandes Global Equity Fund actual shares held (SEC N-PORT)",
  holdings: [
    { date: "2022-12-31", shares: 6436 }, { date: "2023-03-31", shares: 6518 }, { date: "2023-06-30", shares: 6422 },
    { date: "2023-09-30", shares: 6422 }, { date: "2023-12-31", shares: 6255 }, { date: "2024-03-31", shares: 6255 },
    { date: "2024-06-30", shares: 11301, label: "11.3K" }, { date: "2024-09-30", shares: 11301 }, { date: "2024-12-31", shares: 10419 },
    { date: "2025-03-31", shares: 10215 }, { date: "2025-06-30", shares: 10995 }, { date: "2025-09-30", shares: 11257 },
    { date: "2025-12-31", shares: 12316 }, { date: "2026-03-31", shares: 17721, label: "17.7K" }, { date: "2026-06-30", shares: 17332 }
  ],
  // Each quarter's share change is traded at the average of the two quarter-end prices.
  // First step: 6,436 sh bought at the 2022Q4 average ($57.44 on 2022-09-30 and $57.19 on 2022-12-30 → $57.31).
  // Mark: 17,332 sh (2026-06-30, latest N-PORT) at $63.01 (2026-11-13). Result: cost $1,279,040, proceeds $121,083, P&L −$65,868 (−5.1%).
  // Flow-matched S&P 500 (same dollars in/out at the average of the same quarter-end S&P levels, residual marked at 7561.67): +$574,574 (+44.9%).
  fund: { name: "Brandes", steps: [
    {date:"2022-12-31",shares:6436,cost:368879,proceeds:0},
    {date:"2023-03-31",shares:6518,cost:373722,proceeds:0},
    {date:"2023-06-30",shares:6422,cost:373722,proceeds:6058},
    {date:"2023-12-31",shares:6255,cost:373722,proceeds:18021},
    {date:"2024-06-30",shares:11301,cost:730197,proceeds:18021},
    {date:"2024-12-31",shares:10419,cost:730197,proceeds:85970},
    {date:"2025-03-31",shares:10215,cost:730197,proceeds:101617},
    {date:"2025-06-30",shares:10995,cost:790464,proceeds:101617},
    {date:"2025-09-30",shares:11257,cost:809472,proceeds:101617},
    {date:"2025-12-31",shares:12316,cost:888934,proceeds:101617},
    {date:"2026-03-31",shares:17721,cost:1279040,proceeds:101617},
    {date:"2026-06-30",shares:17332,cost:1279040,proceeds:121083}
  ] },
  // Quarter-end closes plus a few intra-quarter points (actual CTSH and S&P 500 closes, Yahoo Finance).
  series: [
    {"date":"2022-12-31","price":57.19,"spx":3839.5},{"date":"2023-03-31","price":60.93,"spx":4109.31},{"date":"2023-06-30","price":65.28,"spx":4450.38},
    {"date":"2023-08-03","price":70.47,"spx":4501.89},{"date":"2023-09-30","price":67.74,"spx":4288.05},{"date":"2023-12-31","price":75.53,"spx":4769.83},
    {"date":"2024-02-14","price":76.74,"spx":5000.62},{"date":"2024-03-31","price":73.29,"spx":5254.35},{"date":"2024-06-30","price":68.0,"spx":5460.48},
    {"date":"2024-09-30","price":77.18,"spx":5762.48},{"date":"2024-12-31","price":76.9,"spx":5881.63},{"date":"2025-02-12","price":88.08,"spx":6051.97},
    {"date":"2025-03-31","price":76.5,"spx":5611.85},{"date":"2025-06-30","price":78.03,"spx":6204.95},{"date":"2025-09-30","price":67.07,"spx":6688.46},
    {"date":"2025-12-31","price":83.0,"spx":6845.5},{"date":"2026-01-14","price":86.7,"spx":6926.6},{"date":"2026-02-03","price":74.5,"spx":6917.81},
    {"date":"2026-02-23","price":61.13,"spx":6837.75},{"date":"2026-03-31","price":61.35,"spx":6528.52},{"date":"2026-06-18","price":43.7,"spx":7500.58},
    {"date":"2026-06-30","price":38.73,"spx":7499.36},{"date":"2026-07-29","price":55.97,"spx":7316.15},{"date":"2026-09-30","price":57.44,"spx":7651.54},
    {"date":"2026-11-13","price":63.01,"spx":7561.67}
  ],
  // cc = quarterly revenue YoY in constant currency (incl. acquisitions); guide = midpoint of full-year cc guidance (Q4'22 gave only Q1 guidance);
  // book = trailing-12-month bookings YoY; eps = adjusted diluted EPS.
  reports: [
    {"date":"2023-02-02","q":"2022Q4","cc":4.1,"guide":null,"book":4,"eps":1.01},{"date":"2023-05-03","q":"2023Q1","cc":1.5,"guide":0.0,"book":9,"eps":1.11},
    {"date":"2023-08-02","q":"2023Q2","cc":-0.1,"guide":0.0,"book":14,"eps":1.10},{"date":"2023-11-01","q":"2023Q3","cc":-0.2,"guide":-0.35,"book":16,"eps":1.16},
    {"date":"2024-02-06","q":"2023Q4","cc":-2.4,"guide":0.0,"book":9,"eps":1.18},{"date":"2024-05-01","q":"2024Q1","cc":-1.2,"guide":0.0,"book":1,"eps":1.12},
    {"date":"2024-07-31","q":"2024Q2","cc":-0.5,"guide":0.25,"book":-1,"eps":1.17},{"date":"2024-10-30","q":"2024Q3","cc":2.7,"guide":1.65,"book":-2,"eps":1.25},
    {"date":"2025-02-05","q":"2024Q4","cc":6.7,"guide":4.75,"book":3,"eps":1.21},{"date":"2025-04-30","q":"2025Q1","cc":8.2,"guide":4.75,"book":3,"eps":1.23},
    {"date":"2025-07-30","q":"2025Q2","cc":7.2,"guide":5.0,"book":6,"eps":1.31},{"date":"2025-10-29","q":"2025Q3","cc":6.5,"guide":6.15,"book":5,"eps":1.39},
    {"date":"2026-02-04","q":"2025Q4","cc":3.8,"guide":5.25,"book":5,"eps":1.35},{"date":"2026-04-29","q":"2026Q1","cc":3.9,"guide":5.25,"book":11,"eps":1.40},
    {"date":"2026-07-29","q":"2026Q2","cc":4.1,"guide":4.75,"book":5,"eps":1.37},{"date":"2026-10-29","q":"2026Q3","cc":4.8,"guide":4.2,"book":4,"eps":1.49}
  ],
  kpiCards: [
    { key: "cc", label: "Revenue YoY (constant currency)", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v > 0 ? "pos" : "neg" },
    { key: "guide", label: "FY guidance (midpoint)", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v >= 3 ? "pos" : v > 0 ? "wrn" : "neg" },
    { key: "book", label: "TTM bookings YoY", fmt: v => (v > 0 ? "+" : "") + v + "%", judge: v => v >= 5 ? "pos" : v >= 0 ? "wrn" : "neg" },
    { key: "eps", label: "Quarterly adj. EPS", fmt: v => "$" + v.toFixed(2), judge: () => "" }
  ],
  events: [
    { date: "2022-12-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Brandes Global Equity Fund: new position of 6,436 shares (Q4 2022)",
      ai: "A new buy after the stock sold off on slowing IT spend. ChatGPT launched a month earlier, but the thesis has no AI item. AI adds it as a fourth claim, starting at a lower score.",
      source: BNP(926678, "000114554923010309") },
    { date: "2023-02-02", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -4 },
      title: "CTSH Q4: revenue +4.1% in constant currency. Q1 guided −1.0% to 0%. New CEO started in January",
      short: "Q1 seen below last year",
      ai: "The headwind is expected to last another quarter. A growth reset begins under the new CEO.",
      source: CT("2022Q4") },
    { date: "2023-05-03", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -4, digital: 3 },
      title: "CTSH 2023 revenue guide: −1% to +1% in constant currency. Q1 bookings +28% YoY",
      short: "2023 seen flat",
      ai: "Bookings are strong, so Supports long-term growth. But revenue is not expected to grow all year.",
      source: CT("2023Q1") },
    { date: "2023-06-13", kind: "peer", claim: "ai", verdict: "contradict", impact: { ai: -4 },
      title: "Accenture: $3bn into data and AI over 3 years; plans to double AI staff to 80,000",
      short: "Accenture invests $3bn",
      ai: "The industry leader has put AI at the center of its business. The view that AI changes how IT services are delivered is becoming consensus.",
      source: "https://newsroom.accenture.com/news/2023/accenture-to-invest-3-billion-in-ai-to-accelerate-clients-reinvention" },
    { date: "2023-08-02", kind: "earnings", claim: "digital", verdict: "support", impact: { digital: 3 },
      title: "CTSH Q2: bookings +17% YoY. Over 100 early projects on its \"Neuro AI\" generative AI platform",
      short: "Bookings +17%, GenAI deals",
      ai: "Digital and AI deals are growing. Evidence for the long-term growth claim.",
      source: CT("2023Q2") },
    { date: "2023-08-03", kind: "company", claim: "ai", verdict: "contradict", impact: { ai: -6 },
      title: "CTSH to invest about $1bn in generative AI over 3 years and train 25,000 staff (CEO internal memo)",
      short: "$1bn into GenAI",
      ai: "The company itself judged it needs a large generative AI investment. The risk that AI changes the work becomes concrete here.",
      cue: "Look at the fourth claim on the right, the one AI added. The company commits $1bn to generative AI. The risk is now concrete.",
      source: "https://www.cxodigitalpulse.com/cognizant-to-invest-1-billion-in-generative-ai-capabilities/" },
    { date: "2023-11-01", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6 },
      title: "CTSH Q3: FY guide narrowed to −0.7% to 0%. \"Pressure on discretionary spend\"",
      short: "Guide trending lower",
      ai: "The IT spend slowdown is continuing. \"Temporary\" cannot be confirmed yet.",
      source: CT("2023Q3") },
    { date: "2024-02-06", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6 },
      title: "CTSH FY2023: revenue −0.3% in constant currency. 2024 guided −2% to +2%",
      short: "FY2023 below last year",
      ai: "The deadline print. The headwind is in its second year. The company signals 2024 may not grow either.",
      source: CT("2023Q4") },
    { date: "2024-02-14", kind: "company", claim: "ai", verdict: "contradict", impact: { ai: -12, mos: -4 },
      title: "CTSH 10-K: first lists as a risk factor that \"some services may be replaced by AI and automation\"",
      short: "10-K flags AI substitution",
      ai: "This was not in the prior year's 10-K. The company wrote it could reduce demand and hurt pricing. A new risk not in the thesis; we recommend a review.",
      alert: "bad", alertTitle: "Review signal: company lists \"AI substitution\" as a risk",
      alertText: "The headwind timer expired 8 days ago. Now the 10-K says some services may be replaced by AI, which could hit demand and pricing. This is not in the original thesis.",
      cue: "The timer expired 8 days ago, and the 10-K now says AI may replace some services. The stock still leads the S&P by 4pt. This is the review signal.",
      source: "https://www.sec.gov/Archives/edgar/data/1058290/000105829024000017/ctsh-20231231.htm" },
    { date: "2024-06-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Brandes: added 5,046 shares in Apr–Jun, up to 11,301 (nearly doubled)",
      ai: "Four months after the review signal, the fund nearly doubled the position. The original thesis still has no AI item.",
      source: BNP(926678, "000114554924051717") },
    { date: "2024-10-30", kind: "earnings", claim: "temp", verdict: "support", impact: { temp: 10, digital: 3 },
      title: "CTSH Q3: revenue +2.7% in constant currency (about 2pt from acquisitions). 19 large deals year to date",
      short: "Back to positive YoY",
      ai: "Revenue is back above last year even ex-acquisitions. About 9 months past the deadline, but the \"temporary\" claim has recovered.",
      source: CT("2024Q3") },
    { date: "2025-02-12", kind: "company", claim: "ai", verdict: "contradict", impact: { ai: -8 },
      title: "CTSH 10-K: wording shifts from \"may be replaced by AI\" to \"has been replaced and will continue to be\"",
      short: "AI substitution \"already happening\"",
      ai: "AI substitution moved from a forecast to a statement of fact. Results are recovering, but the AI risk has not gone away.",
      source: "https://www.sec.gov/Archives/edgar/data/1058290/000105829025000017/ctsh-20241231.htm" },
    { date: "2025-07-30", kind: "earnings", claim: "digital", verdict: "support", impact: { digital: 5 },
      title: "CTSH Q2: revenue +7.2% in constant currency. Two deals over $1bn; FY guide +4 to 6%",
      short: "Two $1bn deals",
      ai: "Strong evidence for the long-term growth claim. It is still winning large outsourcing deals.",
      source: CT("2025Q2") },
    { date: "2025-09-25", kind: "peer", claim: "ai", verdict: "contradict", impact: { ai: -5 },
      title: "Accenture: $865M restructuring. Staff who cannot be retrained for AI to \"exit\"",
      short: "Accenture restructures",
      ai: "The industry leader says AI changes the talent mix it needs. Pressure on the headcount-billing model is now showing up in peer comments.",
      source: "https://www.irishtimes.com/business/2025/09/26/accenture-to-exit-staff-who-cannot-be-retrained-for-age-of-ai" },
    { date: "2026-02-03", kind: "macro", claim: "ai", verdict: "contradict", impact: { ai: -8, mos: -6 },
      title: "Anthropic adds work-automation plugins to Claude Cowork. CTSH and Accenture fall about 9–10% in a day",
      short: "Sell-off on AI automation tool",
      ai: "Fear that AI will take over whole workflows hit the stocks. A risk not in the thesis became a market-wide issue.",
      alert: "warn", alertTitle: "At risk: IT services stocks drop on AI substitution fears",
      alertText: "CTSH fell about 10% in a day after the launch of an AI tool that automates business tasks. A risk not in the thesis is starting to move the stock.",
      source: "https://www.businesstoday.in/technology/news/story/explained-why-anthropics-new-ai-tool-is-spooking-indias-it-services-industry-514521-2026-02-04" },
    { date: "2026-02-04", kind: "earnings", claim: "digital", verdict: "support", impact: { digital: 3, temp: 6 },
      title: "CTSH FY2025: revenue +6.4% in constant currency. 2026 guided +4.0 to 6.5%",
      short: "FY2025 +6.4%",
      ai: "On fundamentals, the headwind is over. But AI worries, not results, are driving the stock.",
      source: CT("2025Q4") },
    { date: "2026-02-23", kind: "peer", claim: "ai", verdict: "contradict", impact: { ai: -6, mos: -4 },
      title: "Anthropic: AI cuts COBOL modernization from years to quarters. IBM −13%, CTSH −6%",
      short: "AI for COBOL modernization too",
      ai: "Legacy system modernization is a big revenue source for IT services. The view spread that AI will shrink that work.",
      source: "https://www.thestar.com.my/tech/tech-news/2026/02/24/ibm-posts-steepest-daily-drop-since-2000-after-anthropic-says-ai-can-modernize-cobol" },
    { date: "2026-03-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Brandes: added 5,405 shares in Jan–Mar, peaking at 17,721 (Q1 2026)",
      ai: "In a quarter when AI worries pushed the stock down, the fund grew the position 1.4x. The claim AI added is still Broken.",
      cue: "The claim AI added is Broken. Still, the fund put in about $390K more. The bars at the bottom hit a record 17.7K shares.",
      source: BNP(1806095, "000206657826001542") },
    { date: "2026-04-23", kind: "peer", claim: "ai", verdict: "contradict", impact: { ai: -4 },
      title: "Infosys: new FY revenue guide +1.5 to 3.5%. CEO concedes AI-driven \"compression\"",
      short: "Infosys admits AI compression",
      ai: "A peer admits AI will shrink revenue from existing work. Whether new work can fill the gap is the next question.",
      source: "https://analyticsindiamag.com/it-services/muted-guidance-overshadows-infosys-20-billion-revenue-milestone" },
    { date: "2026-04-29", kind: "earnings", claim: "digital", verdict: "support", impact: { digital: 2 },
      title: "CTSH Q1: bookings +21% YoY, 7 large deals. FY revenue guide unchanged",
      short: "Bookings +21%",
      ai: "Bookings remain strong. The long-term growth claim is Intact.",
      source: CT("2026Q1") },
    { date: "2026-06-02", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Brandes annual report: CTSH a top detractor. IT services fell on \"fears of AI disruption\"",
      ai: "The fund itself named AI worries as the reason for the drop. A point missing from the thesis appears in its report for the first time.",
      source: "https://www.sec.gov/Archives/edgar/data/1806095/000206657826001981/8debcfa2d2be83e.htm" },
    { date: "2026-06-18", kind: "peer", claim: "mos", verdict: "contradict", impact: { mos: -10, ai: -3 },
      title: "Accenture cuts FY guide and falls about 18% in a day. CTSH drops about 10% to a 52-week low",
      short: "Peer shock, 52-week low",
      ai: "The premise that cheap stocks fall less is breaking. When AI fears are strong, the stock keeps falling even at a low P/E.",
      alert: "bad", alertTitle: "Contradicts: IT services stocks fall together, CTSH at 52-week low",
      alertText: "Accenture's guide cut triggered a sector-wide sell-off. CTSH is now well below its purchase price.",
      source: "https://www.fool.com/investing/2026/06/21/wall-street-just-sold-off-these-it-services-stocks/" },
    { date: "2026-07-29", kind: "earnings", claim: "digital", verdict: "contradict", impact: { digital: -3 },
      title: "CTSH Q2: top of revenue guide cut to +5.5%. EPS guide raised; $1.1bn buyback",
      short: "Top of revenue guide cut",
      ai: "Profits and buybacks are strong, but revenue growth is slowing. The stock rebounded 11% that day.",
      source: CT("2026Q2") },
    { date: "2026-10-29", kind: "earnings", claim: "ai", verdict: "contradict", impact: { ai: -3 },
      title: "CTSH Q3: FY guide set at +4.0 to 4.4%. Over 50% of internal code now AI-assisted",
      short: "Over half of code AI-assisted",
      ai: "The company is using AI to raise its own productivity. If it passes those gains to clients, billable hours fall.",
      source: CT("2026Q3") }
  ],
  summaryHTML: `
    <h3>Replay complete: CTSH (Dec 2022 → Nov 2026)</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">The "temporary headwind" in the thesis recovered late. What pushed the stock down was the AI risk the thesis never mentioned.</p>
    <div class="grid">
      <div><div class="v neg">−87pt</div><div class="l">Held from the first purchase price (CTSH +10%, S&amp;P 500 +97%)</div></div>
      <div><div class="v neg">−5%</div><div class="l">Brandes' actual P&amp;L (est., still held). Trading the S&amp;P on the same dates: +45% (gap −50pt)</div></div>
      <div><div class="v pos">+4pt</div><div class="l">vs S&amp;P 500 at the review signal (Feb 2024)</div></div>
    </div>
    <ul>
      <li><b>The original "temporary headwind" call was broadly right.</b> Revenue turned positive YoY about 9 months after the deadline, and FY2025 grew 6.4%.</li>
      <li><b>The AI risk missing from the thesis pushed the stock down.</b> The company itself flagged it in its Feb 2024 10-K. At the signal, the stock was still beating the market.</li>
      <li><b>The main adds came while the claim AI added was weak.</b> The position roughly doubled in Q2 2024 and hit a record in Q1 2026. This is where a tool that writes the risk into the thesis and forces a check helps.</li>
    </ul>
    <p class="foot">Prices are approximate, linearly interpolated between quarter-end and selected daily closes. Excludes dividends. Brandes P&amp;L is estimated from the Global Equity Fund's quarterly share counts (SEC N-PORT, latest end of Jun 2026), assuming trades at each quarter's average price, marked at the Nov 13, 2026 price of $63.01. The S&amp;P comparison moves the same dollars into and out of the S&amp;P 500 on the same dates. The fund is small, so minor share changes may reflect fund flows. AI reads are pre-computed for the replay.</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">Close</button><button type="button" onclick="document.getElementById('reset').click()">Replay</button></div>`
};
