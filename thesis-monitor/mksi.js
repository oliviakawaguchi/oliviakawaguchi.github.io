// MKSI pitch diagnosis + monitoring plan.
// Source: team pitch deck "MKSI_Master_2.pptx" (44 slides, Nov 2026). Pattern base rates: 59-stock audit of 2026 Alpha Challenge judge funds.
// Diagnosis text was produced by Claude from the deck; it is pre-computed here so the demo runs without an API key.
window.MKSI = {
  file: "MKSI_Master_2.pptx",
  slides: 44,
  ticker: "MKSI", name: "MKS Inc.",
  call: { side: "LONG", price: 215.65, priceDate: "2026-11-13", target: 305, upside: 41, pw: 297, bull: 375, bear: 205 },
  steps: [
    "Read 44 slides",
    "Split claims into Fundamentals, Multiple, Catalyst",
    "Match against 59 past cases (6 judge funds)",
    "Apply latest monitoring (27 news items)",
    "Surface unwritten risks",
    "Draft fixes and kill criteria",
    "Build the watchlist"
  ],
  theses: [
    { id: "T1", title: "Chemistry deserves a chemicals multiple", pts: "+8pt",
      claims: [
        { layer: "Fund.", text: "Chemistry is 24% of EBITDA ($316M, ~38% margin). New plating lines turn into chemistry revenue in 18-24 months" },
        { layer: "Multiple", text: "Valuing chemistry at the peer ~15x lifts the target multiple from 8.9x to 9.4x (+7pt)" },
        { layer: "Catalyst", text: "Dec 14 Investor Day makes chemistry revenue and margin visible" }
      ] },
    { id: "T2", title: "2028 is not the peak (fabs under construction set demand)", pts: "+30pt",
      claims: [
        { layer: "Fund.", text: "2028 WFE +19% (SEMI and consensus: +14%). 2028 EBITDA +10% vs consensus" },
        { layer: "Multiple", text: "If the market believes 2028, today's 8.9x applies to 2028 (roll-forward +22.7pt)" },
        { layer: "Catalyst", text: "TSMC capex plan in Jan, hyperscaler capex plans in Jan-Feb, Q4 earnings in Feb" }
      ] },
    { id: "T3", title: "NAND recovery brings share back", pts: "+3pt",
      claims: [
        { layer: "Fund.", text: "NAND capex recovery and higher layer counts drive RF power upgrades. WFE share 1.90% in 2028 (consensus 1.84%)" },
        { layer: "Catalyst", text: "Kioxia BiCS10 volume production (~2027), SK hynix move to 321 layers" }
      ] }
  ],
  checklist: [
    { ok: true,  label: "States the multiple assumption", note: "8.9x to 9.4x, backed by SOTP" },
    { ok: true,  label: "Catalysts have dates", note: "Dec 14 Investor Day, Jan TSMC, Feb Q4 earnings" },
    { ok: true,  label: "Lists key risks", note: "Theses that listed risks won 9 of 18; those that didn't won 10 of 41" },
    { ok: true,  label: "KPIs in numbers", note: "WFE +19%, share 1.90%, chemistry +13.5%" },
    { ok: false, label: "A deadline: \"if it hasn't happened by X, revisit\"", note: "0 of 59 theses set a deadline" },
    { ok: false, label: "Kill criteria (what proves it wrong)", note: "Risk table has mitigants but no exit conditions" },
    { ok: "warn", label: "Is the bear case realistic?", note: "Bear still assumes +5% growth in 2028" },
    { ok: "warn", label: "Are appendix risks in the monitoring plan?", note: "China 24% and customer concentration 35% only in appendix. Check converts too" }
  ],
  flags: [
    { sev: "red", title: "Over half the upside depends on the market re-rating the multiple",
      pattern: "Fundamentals were right, the multiple didn't move", base: "2 wins of 14",
      why: "Of the +41% target, +22.7pt is a roll-forward: today's 8.9x applied to consensus 2028 estimates. Even if your own estimate (+10%) is right, this piece disappears if the market doesn't believe 2028. Slide 9 says it too: \"the risk is the multiple, not the fundamentals.\"",
      cases: ["PINS · Oakmark · −88pt", "WMG · Cooke & Bieler · −105pt", "CBRE · Cooke & Bieler · −14pt"],
      fix: "Decide up front what evidence shows the market has started to believe 2028. Example: by Q4 earnings in Feb 2027, the multiple on 2028 EBITDA recovers from 7.3x to 8.0x or higher. If not, drop the +22.7pt and recompute the target.",
      update: { date: "2026-11-05", verdict: "contradict", text: "Q3 beat on revenue and guidance, yet the stock fell ~9%. Right on fundamentals, no re-rating: it is already happening. Prepare a Q&A answer for \"why did it fall on a beat?\"", source: "https://finviz.com/news/417344/mks-blows-past-guidance-as-semiconductor-growth-hits-54-but-the-stock-is-still-trading-like-the-cycle-is-ending" } },
    { sev: "red", title: "The bear case assumes slower growth, not a decline",
      pattern: "Bought at the top of the cycle", base: "0 wins of 9 in energy",
      why: "Even the bear case ($205, −5%) has 2028 EBITDA at $2.1bn, above 2027 ($1.99bn). A semiconductor inventory correction could cut revenue −9% YoY as at NXPI, hitting fundamentals and the multiple at the same time.",
      cases: ["NXPI · T. Rowe · −21pt", "QRVO · Brandes · −75pt", "TXN · T. Rowe · −2pt"],
      stress: { label: "Stress test suggested by the diagnosis (approx.)", text: "2028 EBITDA −20% vs 2027 (~$1.6bn), 7.0x multiple (UCT level), $1.8bn net debt, 68M shares → ~$137/share (−36%)" },
      fix: "Add a decline bear case and reweight the probabilities. State that the drawdown could be in the −30%s, not −5%, then give the reasons to buy anyway (fabs under construction, prepaid long-term contracts)." },
    { sev: "yellow", title: "The cycle thesis has no review deadline",
      pattern: "A \"temporary headwind\" lasted 3+ years", base: "7 wins of 23 · median −53pt",
      why: "The claim that \"market fear about AI capex is overdone\" has the same structure as NXPI's \"concerns are temporary.\" Your evidence is stronger (satellite imagery, import data, prepaid long-term contracts). To show the difference, state what must happen by when.",
      cases: ["NXPI · T. Rowe · 3y 7m", "EFX · Oakmark · −68pt", "CTSH · Brandes · −87pt"],
      fix: "Set a headwind timer. Deadline: Feb 2027 (Q4 earnings and 2027 outlook). Test: TSMC and major memory makers' 2027 capex exceeds 2026, and MKS semi revenue keeps growing QoQ.",
      update: { date: "2026-11-12", verdict: "support", text: "Lam, KLA and TEL all see 2027 WFE above $200bn. Samsung and SK hynix plan sharply higher 2027 capex; Applied Materials will double capacity by 2028. MKS's CEO sees 2028 WFE near $300bn. TSMC, though, is planning 2027 \"prudently\"; January's number is the first test.", source: "https://www.tradingkey.com/news/transcripts/262288981-" } },
    { sev: "yellow", title: "The chemistry re-rating hinges on a single event",
      pattern: "Catalysts tied to a person or one deal fell apart", base: "0 wins of 6",
      why: "Chemistry's +7pt assumes Investor Day discloses chemistry numbers. If the company doesn't break chemistry out, the market keeps valuing it under the current \"components maker\" label.",
      cases: ["CRM · Oakmark · −64pt", "OTEX · Brandes · −134pt"],
      fix: "Write alternate paths: (1) disclosure at Investor Day, (2) ongoing chemistry growth disclosure in quarterly results, (3) analysts model chemistry as a separate line. If (1) doesn't happen on Dec 14, judge whether (2) or (3) drives the re-rating.",
      update: { date: "2026-11-05", verdict: "support", text: "On the earnings call, the company cited chemistry revenue +26% (ex-FX and palladium), chemistry equipment sold out through 2027, and committed to show margins and a long-term outlook at Investor Day. The catalyst is on track.", source: "https://www.tradingkey.com/news/transcripts/262288981-" } },
    { sev: "yellow", title: "Appendix risks are missing from the risk table and monitoring plan",
      pattern: "Lost on a risk that wasn't written down", base: "1 win of 11 · median −76pt",
      why: "China is ~24% of revenue (appendix 38) and the top 10 customers are 35% (appendix 20). Neither is in the slide 13 risk table. In past cases, losses from factors missing in the risk table stand out, like QRVO's Apple dependence.",
      cases: ["QRVO · Brandes · Apple dependence", "KMX · Cooke & Bieler · new competitors", "ABEV · Brandes · FX"],
      fix: "Add \"tighter China export controls\" and \"toolmaker order cuts\" to the risk table and the watchlist. In chemistry, also track Chinese rivals' growth (Tiancheng).",
      update: { date: "2026-11-05", verdict: "neutral", text: "Commerce delayed the China \"affiliates rule\" to Jan 10, 2027. It is a delay, not a withdrawal, so the new deadline is now on the monitoring calendar.", source: "https://www.thompsonhinesmartrade.com/2026/11/bis-extends-affiliates-rule-until-january-2027/" } },
    { sev: "yellow", title: "New issue from monitoring: the converts are now convertible",
      pattern: "Lost on a risk that wasn't written down", base: "1 win of 11",
      why: "November results disclosed that $1.4bn of convertible notes are now convertible at holders' option (the stock met the trigger). Your risk table says \"dilution only above $237\"; recheck that assumption. Debt paydown is on track: net leverage is down to 2.4x (3.7x at last year-end).",
      cases: ["Watchlist: net debt and convertible notes"],
      fix: "Confirm the conversion price and whether the company can settle in cash (e.g. net share settlement), and add the dilution impact to the price-target footnote.",
      update: { date: "2026-11-04", verdict: "contradict", text: "Found in the Q3 filing. The converts were reclassified to current liabilities.", source: "https://www.sec.gov/Archives/edgar/data/0001049502/000119312526447410/mksi-ex99_1.htm" } },
    { sev: "yellow", title: "New issue from monitoring: gross margin in the pitch looks off vs reported",
      pattern: "Metric definition mismatch", base: "Risk of a Q&A challenge",
      why: "The pitch's \"50.2%\" is MSD segment gross margin; Q3 company-wide gross margin was 47.7%, with 47.5% guided for Q4. Different metrics, so no contradiction, but a judge who read the release may say \"the numbers don't match.\" The company blames lower-margin equipment shipping first, the same logic as your pitch.",
      cases: ["Watchlist: MSD gross margin"],
      fix: "Label it \"MSD segment\" on the slide and note the gap to the 47.7% company-wide figure. Update if Investor Day (Dec 14) gives segment numbers.",
      update: { date: "2026-11-04", verdict: "contradict", text: "Company-wide gross margin 47.7% (incl. ~0.3pt one-time tariff refund), Q4 guided at 47.5% ±1pt.", source: "https://www.tradingkey.com/news/transcripts/262288981-" } },
    { sev: "green", title: "Some elements resemble past winners",
      pattern: "Temporary cycle fear around a long-term winner", base: "All 7 won, incl. TSM, MU",
      why: "MU and TSM won big by buying on structural (AI) demand while the market sold on cycle fear. MKSI's \"the AI wave arrives in sequence (AI capex → fab construction → equipment)\" is the same pattern. The difference: MU was bought at trough earnings; MKSI is valued on record earnings estimates.",
      cases: ["MU · Brandes · +1360pt", "TSM · Brandes · +338pt", "FTI · William Blair · +572pt"],
      fix: "Prepare one Q&A slide on how this differs from the winners (trough vs peak earnings)." }
  ],
  killCriteria: [
    "TSMC, or 2 of the 3 major memory makers, cut 2027 capex below 2026 → revisit T2",
    "MKS semi revenue down QoQ two quarters in a row → consider exiting",
    "Consensus 2028 WFE growth falls below +5% (BMO's bear level) → treat as bear case",
    "No chemistry disclosure at Investor Day and MSD gross margin below 50% for two quarters → drop T1's +7pt"
  ],
  timers: [
    { label: "Chemistry disclosure (T1)", deadline: "2026-12-14", metric: "Chemistry revenue and margin disclosed at Investor Day" },
    { label: "Market prices in 2028 (T2)", deadline: "2027-02-15", metric: "Multiple on 2028 EBITDA at 8.0x+ by Q4 earnings" },
    { label: "NAND share recovery (T3)", deadline: "2027-07-31", metric: "1H27 WFE share at 1.81%+" }
  ],
  watch: [
    { thesis: "T2", item: "TSMC 2027 capex guidance", when: "mid-Jan 2027", rule: "Up vs 2026 → Supports / flat or lower → Contradicts", source: "TSMC earnings call", status: "pending" },
    { thesis: "T2", item: "Hyperscaler 2027 capex plans", when: "Jan-Feb 2027", rule: "Up → Supports / down or flat → Contradicts", source: "Company earnings", status: "pending" },
    { thesis: "T2", item: "Toolmakers' (Lam, KLA, TEL, AMAT) 2027-28 WFE outlook", when: "Quarterly", rule: "\"2028 still grows\" → Supports / \"2028 slows\" → Contradicts", source: "Earnings calls", status: "ok", now: "TEL sees no 2028 slowdown; Lam: \"demand would be higher without constraints\" (from pitch)" },
    { thesis: "T2", item: "SEMI WFE forecast revision", when: "Dec (SEMICON Japan)", rule: "2028 holds +14%+ → Neutral / nears +19% → Supports", source: "SEMI", status: "pending" },
    { thesis: "T2", item: "New fab progress (TSMC Arizona P2, Micron ID1, SK hynix M17)", when: "Monthly", rule: "Delays or scaled-back plans → Contradicts", source: "News, satellite imagery", status: "ok", now: "2027 fabs: shells complete; 2028: frames and foundations (Oct-Nov satellite imagery)" },
    { thesis: "T2", item: "MKS semi revenue (QoQ) and orders", when: "Quarterly earnings", rule: "Down two quarters in a row → consider exiting", source: "MKS 10-Q", status: "ok", now: "Q3 semi revenue +54% YoY" },
    { thesis: "T1", item: "Chemistry disclosure at Investor Day", when: "2026-12-14", rule: "Revenue and margin disclosed → Supports / none → revisit T1", source: "MKS IR", status: "pending" },
    { thesis: "T1", item: "Taiwan PCB makers' monthly sales", when: "Around the 10th, monthly", rule: "+20%+ YoY → Supports / negative → Contradicts", source: "Taiwan listed-company monthly filings", status: "ok", now: "Latest +46% YoY (from pitch)" },
    { thesis: "T1", item: "MSD gross margin", when: "Quarterly earnings", rule: "Below 50% two quarters in a row → Contradicts", source: "MKS 10-Q", status: "watch", now: "Q3 at 50.2%, near the floor (team: equipment ships first)" },
    { thesis: "T3", item: "NAND capex (Kioxia, SK hynix, Samsung, Micron)", when: "As it happens", rule: "Capex raised → Supports / cut → Contradicts", source: "Company announcements", status: "ok", now: "Kioxia plans FY2027 at ¥450bn, flat with FY2026" },
    { thesis: "T3", item: "NAND contract prices", when: "Monthly", rule: "Down two months in a row → At risk", source: "TrendForce", status: "pending" },
    { thesis: "Risk", item: "China export controls", when: "As it happens", rule: "New rules announced → Contradicts", source: "Commerce Dept., news", status: "pending" },
    { thesis: "Risk", item: "Net debt and converts (dilution above $237)", when: "Quarterly earnings", rule: "Paydown slows → At risk", source: "MKS 10-Q", status: "ok", now: "Net debt $3.2bn → $1.8bn expected by end-2027" },
    { thesis: "Market", item: "Multiple on 2028 EBITDA (does the market believe 2028?)", when: "Daily", rule: "Back to 8.0x+ → Supports / below 7.0x → Contradicts", source: "Stock price, consensus", status: "watch", now: "7.3x (at pitch)" }
  ],
  calendar: [
    { date: "2026-12-14", label: "MKS Investor Day", thesis: "T1" },
    { date: "2027-01-10", label: "China export rule (affiliates rule) delay ends", thesis: "Risk" },
    { date: "2027-01-15", label: "TSMC Q4 earnings, 2027 capex", thesis: "T2" },
    { date: "2027-02-01", label: "Hyperscaler earnings (2027 capex plans)", thesis: "T2" },
    { date: "2027-02-15", label: "MKS Q4 earnings, 2027 outlook", thesis: "All" }
  ]
};
