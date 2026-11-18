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
  holder: "Oakmark Fund（Harris Associates）· 2022年Q3に新規組み入れ",
  holderShort: "Oakmark（買い増して保有）",
  thesis: "水回り（Moen）などで首位の住宅関連メーカー。景気減速と金利上昇で足元の業績は圧迫されるが、それは短期的。人口動態と長年の過少投資で、住宅需要は長期に強い。来期予想利益の約9倍は割安。",
  start: "2022-09-30",
  end: "2026-11-13",
  kinds: { earnings: "決算", housing: "住宅市場", macro: "マクロ", company: "会社", peer: "同業", policy: "政策", activist: "アクティビスト", fund: "ファンドの実際の売買" },
  claims: [
    { id: "moat",    label: "水回りなどの首位企業で、補修・リフォームに強い", short: "事業の強さ", kpi: "オーガニック成長率、利益率", start: 74 },
    { id: "temp",    label: "金利と景気の逆風は短期的",                     short: "逆風は短期的", kpi: "R&R市場の前提、住宅ローン金利", start: 70 },
    { id: "housing", label: "住宅需要は長期に強い",                         short: "住宅需要", kpi: "中古住宅販売、新築着工", start: 72 },
    { id: "cheap",   label: "来期予想利益の約9倍は割安",                     short: "割安", kpi: "調整後EPSの推移", start: 68 }
  ],
  timer: {
    label: "逆風は短期的",
    claimId: "temp",
    deadline: "2024-01-30",
    metric: "2023年度中にオーガニック成長が前年比プラスに戻る（元の仮説の「短期的」を1年と置いた）",
    metAt: null,
    cue: "ここが分かれ道です。期限の2023年度決算で、オーガニック成長はまだマイナス。会社は2024年もリフォーム市場が −2〜−4% と、3年連続の縮小を見込んでいます。ところが株価はS&P 500に +35pt 勝っている。NXPIと同じ場面です。",
    expiredTitle: "逆風タイマー期限切れ：オーガニック成長はまだマイナス",
    expiredText: "期限の2023年度決算でも、オーガニック成長は前年比 −3%。会社は2024年もリフォーム市場の縮小を見込んでいます。株価は市場に勝っていますが、「短期的」の前提は崩れています。仮説の見直しを推奨します。"
  },
  signal: { date: "2024-01-30" },
  holdingsLabel: "Oakmark の実際の保有株数（SEC N-PORT）",
  holdings: [
    { date: "2022-09-30", shares: 2500000 }, { date: "2022-12-31", shares: 3154500 }, { date: "2023-03-31", shares: 3254500 },
    { date: "2023-06-30", shares: 3654500 }, { date: "2023-09-30", shares: 3654500 }, { date: "2023-12-31", shares: 3654500 },
    { date: "2024-03-31", shares: 3254500 }, { date: "2024-06-30", shares: 4031300 }, { date: "2024-09-30", shares: 4593400 },
    { date: "2024-12-31", shares: 4743400 }, { date: "2025-03-31", shares: 4993300 }, { date: "2025-06-30", shares: 5498300 },
    { date: "2025-09-30", shares: 5673300, label: "567万株" }, { date: "2025-12-31", shares: 5673300 }, { date: "2026-03-31", shares: 5673300 },
    { date: "2026-06-30", shares: 5673300 }
  ],
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
    { key: "sales_yoy", label: "売上 前年比（買収含む）", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v >= 0 ? "pos" : "neg" },
    { key: "organic", label: "オーガニック成長", fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", judge: v => v > 0 ? "pos" : v === 0 ? "wrn" : "neg" },
    { key: "eps", label: "四半期 調整後EPS", fmt: v => "$" + v.toFixed(2), judge: () => "" },
    { key: "mort", label: "30年住宅ローン金利", fmt: v => v.toFixed(2) + "%", judge: v => v >= 7 ? "neg" : v >= 6.5 ? "wrn" : "" }
  ],
  events: [
    { date: "2022-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark：250万株を新規に購入（2022年Q3）",
      ai: "金利上昇で住宅株が売られた局面での新規購入です。仮説は「逆風は短期的、住宅需要は長期に強い」。",
      cue: "Oakmarkは住宅株が売られた局面で250万株を買いました。仮説は「逆風は短期的」。NXPIと同じ型の仮説です。",
      source: NP("000175272422265402") },
    { date: "2022-10-26", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -4, moat: 2 },
      title: "FBIN 7〜9月期：売上 +3.4%。通期EPS見通しを引き下げ。住宅需要は「想定どおり」軟化",
      short: "EPS見通しを引き下げ",
      ai: "会社は軟化を想定内と説明しています。仮説と矛盾はしませんが、逆風の始まりとして記録します。",
      source: FB("2022Q3") },
    { date: "2022-12-14", kind: "company", claim: null, verdict: "neutral", impact: {},
      title: "キャビネット事業MasterBrandを分離。社名をFortune Brands Innovationsに変更",
      ai: "事業構成が変わりました。水回りとセキュリティが中心になり、補修・リフォーム（R&R）への依存が高まります。",
      source: "https://www.businesswire.com/news/home/20221215005057/en/MasterBrand-Completes-Separation-from-Fortune-Brands" },
    { date: "2023-02-16", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6, moat: 4 },
      title: "FBIN 2023年見通し：売上 −5〜−7%、市場全体は −6.5〜−8.5% を想定。「急速な利上げが購入意欲を直撃」",
      short: "2023年は売上 −5〜−7%",
      ai: "逆風は1年以上続く前提になりました。利益率は守れているので「事業の強さ」は支持、「短期的」には反証です。",
      source: FB("2022Q4") },
    { date: "2023-07-27", kind: "earnings", claim: "housing", verdict: "support", impact: { housing: 6, temp: 4 },
      title: "FBIN 4〜6月期：新築が想定より強く、通期見通しを引き上げ",
      short: "新築が想定より強い",
      ai: "初めて仮説を支える材料です。ただし強いのは新築で、会社の中心であるリフォーム市場は −4〜−6% の想定のままです。",
      source: FB("2023Q2") },
    { date: "2023-10-26", kind: "housing", claim: "temp", verdict: "contradict", impact: { temp: -8, housing: -6 },
      title: "30年住宅ローン金利が7.79%に。2000年以来の高水準",
      short: "住宅ローン金利7.79%",
      ai: "「短期的」とした金利の逆風が、むしろ強まっています。中古住宅の取引が止まると、リフォーム需要も戻りにくくなります。",
      alert: "warn", alertTitle: "要注意：金利の逆風が23年ぶりの水準に",
      alertText: "住宅ローン金利が7.79%に達しました。仮説が「短期的」とした逆風は、弱まるどころか強まっています。",
      source: "https://www.freddiemac.com/pmms/docs/PMMS_history.csv" },
    { date: "2024-01-30", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -8 },
      title: "FBIN 2023年度決算：オーガニック成長 −3%。2024年もリフォーム市場は −2〜−4% を想定",
      short: "2024年もR&R −2〜−4%",
      ai: "期限の決算です。会社自身が、3年連続でリフォーム市場の縮小を見込んでいます。「短期的」の前提は成り立たなくなりました。",
      source: FB("2023Q4") },
    { date: "2024-03-31", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark：40万株を売却し、325万株に（2024年Q1。保有期間中で唯一の売り）",
      ai: "見直しシグナルの直後、ファンドは一部を売りました。しかし次の四半期から、再び買い増しに転じます。",
      source: NP("000175272424122371") },
    { date: "2024-07-25", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6, moat: -4 },
      title: "FBIN 4〜6月期：リフォーム市場の前提をさらに引き下げ、中国も大きく悪化",
      short: "R&R前提を引き下げ",
      ai: "回復の時期がまた後ずれしました。中国の悪化は、仮説に書かれていなかった新しいリスクです。",
      source: FB("2024Q2") },
    { date: "2024-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark：4〜9月に134万株を買い増し、459万株に",
      ai: "期限切れの後、ファンドは売った直後の325万株から4割増やしました。仮説が書き換えられた記録は、公開レターにはありません。",
      cue: "NXPIとの違いがここです。T. Roweは売りましたが、Oakmarkは期限切れの後に買い増して、保有を4割増やしました。",
      source: NP("000175272424266112") },
    { date: "2024-11-06", kind: "earnings", claim: "cheap", verdict: "contradict", impact: { cheap: -8, temp: -6 },
      title: "FBIN 7〜9月期：オーガニック −5%。通期EPS見通しを引き下げ（在庫調整、店頭販売の弱さ）",
      short: "EPS見通しを引き下げ",
      ai: "「割安」の前提だった利益そのものが下がり始めました。PERが低いのは、利益が減る前の数字で計算していたからかもしれません。",
      source: FB("2024Q3") },
    { date: "2025-05-06", kind: "policy", claim: "moat", verdict: "contradict", impact: { moat: -6, temp: -6 },
      title: "関税の発表を受け、FBINが2025年の詳細な業績見通しを取り下げ",
      short: "関税で見通しを取り下げ",
      ai: "仮説に書かれていなかった逆風が加わりました。消費者の購入意欲の低下も重なっています。",
      source: FB("2025Q1") },
    { date: "2025-07-31", kind: "earnings", claim: "cheap", verdict: "contradict", impact: { cheap: -16, temp: -6 },
      title: "FBIN 2025年のEPS見通しを $3.75〜3.95 に引き下げ（2月は $4.15〜4.45）。リフォーム市場もマイナス想定に",
      short: "EPS見通しを大幅引き下げ",
      ai: "利益の見通しが1割下がりました。買った時点の「9倍」は、今の利益で見るともう割安ではありません。典型的なバリュートラップの形です。",
      source: FB("2025Q2") },
    { date: "2025-09-30", kind: "fund", claim: null, verdict: "neutral", impact: {},
      title: "Oakmark：保有が567万株で最大に（2025年Q3末）",
      ai: "利益見通しが下がる中でも、ファンドは買い増しを続けました。最初の購入の2.3倍の株数です。",
      cue: "利益の見通しが下がっても、ファンドは買い続け、保有は最大の567万株になりました。最初の2.3倍です。",
      source: NP("000141036825030052") },
    { date: "2026-01-14", kind: "housing", claim: "housing", verdict: "contradict", impact: { housing: -12 },
      title: "2025年の中古住宅販売は406万戸。1995年以来の最低水準で、4年連続の減少",
      short: "中古住宅販売が30年ぶりの低水準",
      ai: "「住宅需要は長期に強い」の前提に、最も直接的な反証です。需要はあっても、金利が高く取引が成立していません。",
      source: "https://www.rismedia.com/2026/01/14/existing-home-sales-december-2025/" },
    { date: "2026-02-12", kind: "company", claim: "moat", verdict: "contradict", impact: { moat: -10, cheap: -12 },
      title: "FBIN 2026年見通しが市場予想を下回り、CEOの退任を発表。株価は翌日 約−18%",
      short: "弱い見通しとCEO退任",
      ai: "経営陣の交代は、仮説に書かれていない論点です。会社は「市場の回復は見込まない」と明言しました。",
      alert: "bad", alertTitle: "反証：会社が「2026年も回復を見込まない」と明言",
      alertText: "見通しは市場予想を下回り、CEOは退任。買ってから3年半、逆風は終わっていません。",
      cue: "買ってから3年半。会社は「2026年も回復は見込まない」と明言し、CEOも退任しました。株価は1日で約18%下落です。",
      source: "https://www.businesswire.com/news/home/20260212410314/en/Fortune-Brands-Innovations-Announces-Fourth-Quarter-and-Full-Year-2025-Results" },
    { date: "2026-03-16", kind: "activist", claim: "moat", verdict: "contradict", impact: { moat: -4 },
      title: "アクティビストのEd Garden氏が取締役に。後任CEOの計画は撤回、CFOも退任",
      short: "アクティビストが取締役に",
      ai: "経営の混乱が続いています。仮説の前提だった経営陣は、もういません。",
      source: "https://www.businesswire.com/news/home/20260316077727/en/" },
    { date: "2026-06-29", kind: "company", claim: null, verdict: "neutral", impact: {},
      title: "Jesse Singh氏（AZEK元CEO）が新CEOに就任",
      ai: "新しい経営陣による立て直しは、元の仮説とは別の新しい仮説です。改めて記録し直す必要があります。",
      source: "https://secure.businesswire.com/news/home/20260629296039/en/Fortune-Brands-Innovations-Appoints-Jesse-Singh-as-Chief-Executive-Officer" },
    { date: "2026-11-03", kind: "earnings", claim: "temp", verdict: "contradict", impact: { temp: -6, housing: -6 },
      title: "FBIN 7〜9月期：EPS見通しを再び引き下げ。事業売却と中国撤退を含む立て直し策を発表",
      short: "立て直し策と見通し引き下げ",
      ai: "4年たっても逆風は終わっていません。2026年も新築は1桁後半の減少、リフォームも減少の見通しです。",
      cue: "4年たった今も、会社は立て直しの最中です。「短期的」とされた逆風は、まだ終わっていません。",
      source: FB("2026Q3") }
  ],
  summaryHTML: `
    <h3>再生終了：FBIN（2022年9月 → 2026年11月）</h3>
    <p style="color:var(--muted);font-size:.9rem;margin:0">期限が切れた後、Oakmarkは売らずに買い増しました。NXPIで売ったT. Roweとは逆の判断です。</p>
    <div class="grid">
      <div><div class="v neg">−106pt</div><div class="l">最初の買値から持ち続けた場合（対S&amp;P 500）</div></div>
      <div><div class="v neg">−12%</div><div class="l">Oakmarkの実際の損益（推定、保有中）。同じタイミングでS&amp;Pを売買した場合は +63%（差 −75pt）</div></div>
      <div><div class="v pos">+35pt</div><div class="l">見直しシグナル（2024年1月）時点の対S&amp;P 500（概算）</div></div>
    </div>
    <ul>
      <li><b>シグナルが出たとき、株価はまだ市場に勝っていた。</b>NXPIと同じく、リターンだけでは警告が出ない場面でした。</li>
      <li><b>期限切れの後、保有を約1.5倍に増やした。</b>365万株から567万株へ。その間に利益の見通しは下がり続け、「割安」の前提も崩れました。</li>
      <li><b>同じ「一時的な逆風」の仮説でも、見直した側と買い増した側で結果が分かれた。</b>このツールが防ぎたいのは、仮説が検証されないまま買い増すことです。</li>
    </ul>
    <p class="foot">株価は分割調整済みの四半期末終値の間を直線で補間した概算。配当を含まない。Oakmarkの損益は四半期ごとの保有株数（SEC N-PORT）から、各四半期の平均株価で売買したと仮定した推定で、MasterBrand株の扱いを含む。AIの判定は再生用にあらかじめ計算したもの。</p>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="primary" type="button" onclick="document.getElementById('summary').hidden=true">閉じる</button><button type="button" onclick="document.getElementById('reset').click()">もう一度再生</button></div>`
};
