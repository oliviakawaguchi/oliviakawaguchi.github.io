// MKSI pitch diagnosis + monitoring plan.
// Source: team pitch deck "MKSI_Master_2.pptx" (44 slides, Nov 2026). Pattern base rates: 59-stock audit of 2026 Alpha Challenge judge funds.
// Diagnosis text was produced by Claude from the deck; it is pre-computed here so the demo runs without an API key.
window.MKSI = {
  file: "MKSI_Master_2.pptx",
  slides: 44,
  ticker: "MKSI", name: "MKS Inc.",
  call: { side: "LONG", price: 215.65, priceDate: "2026-11-13", target: 305, upside: 41, pw: 297, bull: 375, bear: 205 },
  steps: [
    "44枚のスライドを読み込み",
    "主張を「業績・評価倍率・触媒」に分解",
    "59件の過去事例（ジャッジ6社）と照合",
    "書かれていないリスクを洗い出し",
    "改善案と撤退条件を作成",
    "監視リストを生成"
  ],
  theses: [
    { id: "T1", title: "化学事業は化学の倍率に値する", pts: "+8pt",
      claims: [
        { layer: "業績", text: "化学はEBITDAの24%（3億1600万ドル、マージン約38%）。新しいめっきラインが18〜24か月後に化学の売上になる" },
        { layer: "倍率", text: "化学を同業並みの約15倍で評価すれば、目標倍率は8.9倍→9.4倍（+7pt）" },
        { layer: "触媒", text: "12月14日のInvestor Dayで化学の売上・マージンが見えるようになる" }
      ] },
    { id: "T2", title: "2028年はピークではない（建設中の工場が需要を決める）", pts: "+30pt",
      claims: [
        { layer: "業績", text: "2028年の装置投資（WFE）は +19%（SEMI・コンセンサスは +14%）。2028年のEBITDAはコンセンサス比 +10%" },
        { layer: "倍率", text: "市場が2028年を信じれば、今の8.9倍を2028年に適用できる（ロールフォワード +22.7pt）" },
        { layer: "触媒", text: "1月のTSMC設備投資計画、1〜2月のハイパースケーラー投資計画、2月のQ4決算" }
      ] },
    { id: "T3", title: "NANDの回復でシェアが戻る", pts: "+3pt",
      claims: [
        { layer: "業績", text: "NAND投資の回復と多層化でRF電源の更新需要。WFEシェアは2028年に1.90%（コンセンサス1.84%）" },
        { layer: "触媒", text: "Kioxia BiCS10の量産（2027年頃）、SK hynixの321層移行" }
      ] }
  ],
  checklist: [
    { ok: true,  label: "評価倍率の前提を書いている", note: "8.9倍→9.4倍、SOTPの根拠つき" },
    { ok: true,  label: "触媒に日付がある", note: "12/14 Investor Day、1月TSMC、2月Q4決算" },
    { ok: true,  label: "主要リスクを書いている", note: "書いた仮説は18件中9勝、書かなかった仮説は41件中10勝" },
    { ok: true,  label: "KPIを数字で書いている", note: "WFE +19%、シェア1.90%、化学 +13.5%" },
    { ok: false, label: "「いつまでに起きなければ見直すか」の期限", note: "59件中、期限を書いた仮説は0件" },
    { ok: false, label: "撤退条件（何が起きたら間違いか）", note: "リスク表に対策はあるが、撤退の条件はない" },
    { ok: "warn", label: "ベアケースが現実的か", note: "ベアでも2028年は +5%成長の想定" },
    { ok: "warn", label: "付録のリスクが監視計画に入っているか", note: "中国24%、顧客集中35%が付録だけ" }
  ],
  flags: [
    { sev: "red", title: "アップサイドの半分以上が「市場が倍率を戻すこと」に依存",
      pattern: "業績は当たったのに、評価倍率が上がらなかった", base: "14件中2勝",
      why: "目標+41%のうち+22.7ptは、コンセンサスの2028年予想に今の8.9倍を当てる「ロールフォワード」です。皆さん独自の業績予想（+10%）が当たっても、市場が2028年を信じなければこの部分は消えます。スライド9でも「リスクは倍率で、業績ではない」と書いています。",
      cases: ["PINS · Oakmark · −88pt", "WMG · Cooke & Bieler · −105pt", "CBRE · Cooke & Bieler · −14pt"],
      fix: "「市場が2028年を信じ始めた」と判断する証拠を先に決める。例：2027年2月のQ4決算までに、2028年EBITDAに対する倍率が7.3倍から8.0倍以上に戻る。戻らなければ+22.7ptを外して目標を再計算する。" },
    { sev: "red", title: "ベアケースが「成長鈍化」で、「減少」を想定していない",
      pattern: "サイクルの天井で買った", base: "エネルギー9件で0勝",
      why: "ベアケース（$205、−5%）でも、2028年のEBITDAは21億ドルと2027年（19.9億ドル）より大きい前提です。半導体の在庫調整が来れば、NXPIのように売上が前年比 −9% まで落ち、業績と倍率が同時に下がります。",
      cases: ["NXPI · T. Rowe · −21pt", "QRVO · Brandes · −75pt", "TXN · T. Rowe · −2pt"],
      stress: { label: "診断が提案するストレステスト（概算）", text: "2028年EBITDAが2027年比 −20%（約16億ドル）、倍率7.0倍（UCT並み）、純有利子負債18億ドル、株数6,800万株 → 1株約$137（−36%）" },
      fix: "「減少」のベアケースを1本足し、確率の重みを見直す。下落幅が−5%ではなく−30%台になりうることを明示した上で、それでも買う理由（建設中の工場、前払いの長期契約）を書く。" },
    { sev: "yellow", title: "サイクルの仮説に、見直しの期限がない",
      pattern: "「一時的な逆風」が3年以上続いた", base: "23件で7勝・中央値 −53pt",
      why: "「市場のAI投資への不安は行き過ぎ」という主張は、NXPIの「懸念は一時的」と同じ構造です。ただし、根拠の質は皆さんのほうが高い（衛星画像、輸入データ、前払いの長期契約）。違いを示すには、いつまでに何が起きるかを書く必要があります。",
      cases: ["NXPI · T. Rowe · 3年7か月", "EFX · Oakmark · −68pt", "CTSH · Brandes · −87pt"],
      fix: "逆風タイマーを設定する。期限：2027年2月（Q4決算と2027年見通し）。基準：TSMCとメモリ大手の2027年設備投資が2026年を上回り、MKSの半導体売上が前期比で増え続けている。" },
    { sev: "yellow", title: "化学の再評価が、1つのイベントに依存している",
      pattern: "人物や個別案件に頼った触媒が崩れた", base: "6件で0勝",
      why: "化学の+7ptは、Investor Dayで化学の数字が開示されることが前提です。会社が化学を独立して開示しなければ、市場は今の「部品メーカー」のラベルのまま評価し続けます。",
      cases: ["CRM · Oakmark · −64pt", "OTEX · Brandes · −134pt"],
      fix: "代わりの経路を書く：①Investor Dayで開示、②四半期決算で化学の成長率を継続的に開示、③アナリストが化学を別ラインでモデル化。12月14日に①が起きなければ、②③のどちらで再評価されるかを判断する。" },
    { sev: "yellow", title: "付録に書いたリスクが、リスク表と監視計画に入っていない",
      pattern: "書いていなかったリスクで負けた", base: "11件で1勝・中央値 −76pt",
      why: "中国向けが売上の約24%（付録38）、上位10社への集中が35%（付録20）です。どちらもスライド13のリスク表にありません。過去の事例では、QRVOのApple依存のように、リスク表から漏れた要因で負けたケースが目立ちます。",
      cases: ["QRVO · Brandes · Apple依存", "KMX · Cooke & Bieler · 新興の競合", "ABEV · Brandes · 為替"],
      fix: "リスク表に「中国の輸出規制強化」と「装置大手の発注調整」を加え、監視リストに入れる。化学では中国勢（Tiancheng）の伸びも監視する。" },
    { sev: "green", title: "過去の勝ちパターンに近い要素もある",
      pattern: "長期の勝者に対する、一時的なサイクル懸念", base: "TSM、MUなど7件すべて勝ち",
      why: "MUとTSMは、市場がサイクルを恐れて売った局面で、構造的な需要（AI）を根拠に買って大きく勝ちました。MKSIの「AIの波は順番に届く（AI投資 → 工場建設 → 装置）」は同じ型です。違いは、MUは業績の底で買ったのに対し、MKSIは過去最高の業績予想の上で評価している点です。",
      cases: ["MU · Brandes · +1360pt", "TSM · Brandes · +338pt", "FTI · William Blair · +572pt"],
      fix: "勝った事例との違い（業績の底か、天井か）を、Q&A用に1枚で説明できるようにしておく。" }
  ],
  killCriteria: [
    "TSMC、またはメモリ大手3社のうち2社が、2027年の設備投資を2026年より減らす → T2を見直す",
    "MKSの半導体売上が2四半期連続で前期比マイナス → 撤退を検討",
    "コンセンサスの2028年WFE成長率が +5%未満になる（BMOのベア水準） → ベアケースとして扱う",
    "Investor Dayで化学を開示せず、MSDの粗利率が2四半期続けて50%を下回る → T1の+7ptを外す"
  ],
  timers: [
    { label: "化学の開示（T1）", deadline: "2026-12-14", metric: "Investor Dayで化学の売上とマージンを開示" },
    { label: "2028年を市場が織り込む（T2）", deadline: "2027-02-15", metric: "Q4決算までに、2028年EBITDAに対する倍率が8.0倍以上" },
    { label: "NANDシェアの回復（T3）", deadline: "2027-07-31", metric: "2027年上期のWFEシェアが1.81%以上" }
  ],
  watch: [
    { thesis: "T2", item: "TSMCの2027年設備投資ガイダンス", when: "2027年1月中旬", rule: "2026年比で増加 → 支持 ／ 横ばい以下 → 反証", source: "TSMC決算説明会", status: "pending" },
    { thesis: "T2", item: "ハイパースケーラー各社の2027年設備投資計画", when: "2027年1〜2月", rule: "増加 → 支持 ／ 減少・据え置き → 反証", source: "各社決算", status: "pending" },
    { thesis: "T2", item: "装置大手（Lam、KLA、TEL、AMAT）の2027〜28年WFE見通し", when: "毎四半期", rule: "「2028年も成長」→ 支持 ／ 「2028年は減速」→ 反証", source: "決算説明会", status: "ok", now: "TELは2028年の減速を見ていない、Lamは「制約がなければ需要はさらに高い」（ピッチより）" },
    { thesis: "T2", item: "SEMIのWFE予測の改定", when: "12月（SEMICON Japan）", rule: "2028年 +14%以上を維持 → 中立 ／ +19%に接近 → 支持", source: "SEMI", status: "pending" },
    { thesis: "T2", item: "新工場の建設進捗（TSMCアリゾナ第2、Micron ID1、SK hynix M17）", when: "毎月", rule: "工期の遅れ・計画縮小 → 反証", source: "ニュース、衛星画像", status: "ok", now: "2027年の工場は建屋完成、2028年は骨組み・基礎（10〜11月の衛星画像）" },
    { thesis: "T2", item: "MKSの半導体売上（前期比）と受注", when: "四半期決算", rule: "2四半期連続で減少 → 撤退検討", source: "MKS 10-Q", status: "ok", now: "Q3の半導体売上は前年比 +54%" },
    { thesis: "T1", item: "Investor Dayでの化学の開示", when: "2026-12-14", rule: "売上とマージンを開示 → 支持 ／ 開示なし → T1を見直す", source: "MKS IR", status: "pending" },
    { thesis: "T1", item: "台湾の基板メーカーの月次売上", when: "毎月10日頃", rule: "前年比 +20%以上 → 支持 ／ マイナス → 反証", source: "台湾上場企業の月次開示", status: "ok", now: "直近で前年比 +46%（ピッチより）" },
    { thesis: "T1", item: "MSD部門の粗利率", when: "四半期決算", rule: "2四半期続けて50%未満 → 反証", source: "MKS 10-Q", status: "watch", now: "Q3は50.2%と下限に接近（装置の出荷が先行するため、とチームは説明）" },
    { thesis: "T3", item: "NANDの設備投資（Kioxia、SK hynix、Samsung、Micron）", when: "随時", rule: "投資計画の増額 → 支持 ／ 削減 → 反証", source: "各社発表", status: "ok", now: "KioxiaはFY2027もFY2026並みの4500億円を計画" },
    { thesis: "T3", item: "NANDの契約価格", when: "毎月", rule: "下落が2か月続く → 要注意", source: "TrendForce", status: "pending" },
    { thesis: "リスク", item: "中国向けの輸出規制", when: "随時", rule: "新しい規制の発表 → 反証", source: "米商務省、ニュース", status: "pending" },
    { thesis: "リスク", item: "純有利子負債と転換社債（希薄化は$237超）", when: "四半期決算", rule: "返済ペースの鈍化 → 要注意", source: "MKS 10-Q", status: "ok", now: "純有利子負債32億ドル → 2027年末18億ドルの見通し" },
    { thesis: "市場", item: "2028年EBITDAに対する倍率（市場が2028年を信じているか）", when: "毎日", rule: "8.0倍以上に回復 → 支持 ／ 7.0倍未満 → 反証", source: "株価、コンセンサス", status: "watch", now: "7.3倍（ピッチ時点）" }
  ],
  calendar: [
    { date: "2026-12-14", label: "MKS Investor Day", thesis: "T1" },
    { date: "2027-01-15", label: "TSMC Q4決算・2027年設備投資", thesis: "T2" },
    { date: "2027-02-01", label: "ハイパースケーラーの決算（2027年投資計画）", thesis: "T2" },
    { date: "2027-02-15", label: "MKS Q4決算・2027年見通し", thesis: "全体" }
  ]
};
