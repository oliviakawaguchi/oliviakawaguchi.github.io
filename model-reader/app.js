(function () {
  "use strict";
  const E = window.ModelEngine, $ = s => document.querySelector(s);
  const SAMPLE = "sample/MKSI_Public_Model.xlsx";
  const SAMPLE_OUTS = [
    ["Valuation!E23", "Upside to today's price, our case (Theses 1 and 2)"],
    ["Valuation!D23", "12-month target price, our case"],
    ["Valuation!B16", "FY2028 adjusted EBITDA with theses"],
    ["Valuation!E21", "Upside, baseline roll with deleveraging"],
  ];
  let M = null, M2 = null, name1 = "", name2 = "", outKey = null, isSample = true, sheet = null, selKey = null, openRow = null, withActuals = false;

  /* ---------- formatting ---------- */
  function isPct(k) { const c = M && M.cell(k); return !!(c && c.z && /%/.test(c.z)); }
  function isMoney(k) { const c = M && M.cell(k); return !!(c && c.z && /\$/.test(c.z)); }
  function fmt(k, v) {
    if (v === null || v === undefined) return "–";
    if (v instanceof E.XlErr) return v.code;
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v !== "number") return String(v);
    if (isPct(k)) return (v * 100).toFixed(Math.abs(v) < 0.1 ? 2 : 1) + "%";
    const a = Math.abs(v);
    const d = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 1 ? 2 : 4;
    const s = v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
    return (isMoney(k) ? "$" : "") + s;
  }
  const PCTLAB = /growth|q\/q|y\/y|qoq|yoy|margin|rate|%|change|attach|ramp|retention|share of/i;
  function fmtA(m, k, v, name) {
    const c = m.cell(k);
    if (typeof v === "number" && !(c && c.z && /%/.test(c.z)) && Math.abs(v) <= 1.5 && PCTLAB.test(name || "")) return (v * 100).toFixed(Math.abs(v) < 0.1 ? 1 : 1) + "%";
    const keep = M; M = m; try { return fmt(k, v); } finally { M = keep; }
  }
  const useInput = k => withActuals || M.inputKind(k) === "forecast";
  function label(k) {
    const r = M.rowLabel(k), h = M.colHeader(k);
    return h && h !== r && !/^(value|item|unit|source)$/i.test(h) ? (r ? r + " · " + h : h) : (r || k);
  }
  function tagOf(note) {
    if (/^PUBLIC/i.test(note)) return ["pub", "public"];
    if (/ILLUSTRATIVE/i.test(note)) return ["illu", "illustrative"];
    if (/ASSUMPTION/i.test(note)) return ["asm", "assumption"];
    return note ? ["", "sourced"] : ["", "typed in"];
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- loading ---------- */
  async function loadBuffer(buf, name, sample) {
    $("#fname").textContent = "Reading " + name + "…";
    await new Promise(r => setTimeout(r, 20));
    try {
      const wb = XLSX.read(buf, { type: "array", cellFormula: true, cellNF: true, sheetStubs: true });
      M = new E.Model(wb, XLSX); isSample = sample;
    } catch (e) { $("#fname").textContent = "Could not read " + name; $("#fsub").textContent = String(e.message || e); return; }
    const nIn = [...M.cells.keys()].filter(k => M.isInput(k) && M.dep.has(k)).length;
    $("#fname").textContent = name; name1 = name;
    $("#fsub").textContent = `${M.sheets.length} sheets · ${M.ast.size.toLocaleString()} formulas · ${nIn.toLocaleString()} typed inputs in use` +
      (M.unsupported.size ? ` · ${M.unsupported.size} formulas use functions this reader can't recompute (their saved values are still shown)` : "");
    $("#sample").hidden = sample; $("#samplebar").hidden = !sample;
    sheet = M.sheets.find(s => /valuation/i.test(s)) || M.sheets[0];
    setupOutputs(); renderSheets(); renderAssumes();
  }
  function readFile2(f) {
    if (!f) return; const fr = new FileReader();
    fr.onload = () => { try { M2 = new E.Model(XLSX.read(fr.result, { type: "array", cellFormula: true, cellNF: true, sheetStubs: true }), XLSX); name2 = f.name;
        $("#f2sub").hidden = false; $("#f2sub").textContent = "Comparing with: " + f.name; } catch (e) { $("#f2sub").hidden = false; $("#f2sub").textContent = "Could not read " + f.name; M2 = null; }
      renderAssumes(); document.querySelector('.tab[data-p="assumes"]').click(); };
    fr.readAsArrayBuffer(f);
  }
  async function loadSample() {
    const r = await fetch(SAMPLE); const b = await r.arrayBuffer();
    await loadBuffer(b, "MKSI model, public-data version", true);
  }
  function readFile(f) { if (!f) return; const fr = new FileReader(); fr.onload = () => loadBuffer(fr.result, f.name, false); fr.readAsArrayBuffer(f); }

  /* ---------- answer cell ---------- */
  function guessOutputs() {
    const TGT = /(price target|target price|fair value per share|implied (share )?price|value per share|upside|\bPT\b|12.?month target)/i;
    const EARN = /^(adj(usted)?\.?\s*|pro ?forma\s*|non-gaap\s*|diluted\s*|operating\s*)?(EBITDA|EPS|earnings per share)\b/i;
    const cand = new Map(); // key -> {tgt, earn}
    const add = (k, tgt, earn) => { const c = M.cell(k); if (!c || !c.f) return; const v = M.safeValue(k); if (typeof v !== "number") return; const o = cand.get(k) || { tgt: 0, earn: 0 }; o.tgt = Math.max(o.tgt, tgt); o.earn = Math.max(o.earn, earn); cand.set(k, o); };
    const ALT = /probab|weight|bear|bull|downside|sensitiv|scenario \d|low case|high case/i;
    const pref = (txt, base) => base + (/price/i.test(txt) ? 0.1 : 0);
    for (const k of M.ast.keys()) {                      // rows labelled as a target or upside: strongest signal
      const l = M.rowLabel(k); if (TGT.test(l) && !/guid|consensus|street|conver/i.test(l)) add(k, ALT.test(l) ? 0.5 : pref(l, 2), 0);
    }
    for (const [k, c] of M.cells) {                      // column headers labelled as a target or upside
      if (c.f || typeof c.v !== "string" || !TGT.test(c.v)) continue;
      const [sn, a] = k.split("!"), A = E.splitAddr(a);
      for (let r = A.r + 1; r <= A.r + 40; r++) { const kk = E.key(sn, E.numToCol(A.c) + r); add(kk, ALT.test(M.rowLabel(kk)) ? 0.5 : pref(c.v, 1), 0); }
    }
    const rows = new Map();                              // earnings rows: furthest-out forecast in each
    for (const k of M.ast.keys()) {
      const l = M.rowLabel(k); if (!EARN.test(l) || /guid|consensus|street/i.test(l)) continue;
      const [sn, a] = k.split("!"), A = E.splitAddr(a), rk = sn + "|" + A.r;
      if (typeof M.cell(k).v !== "number" && typeof M.safeValue(k) !== "number") continue;
      if (!rows.has(rk) || E.splitAddr(rows.get(rk).split("!")[1]).c < A.c) rows.set(rk, k);
    }
    for (const k of rows.values()) { const l = M.rowLabel(k); add(k, 0, (/EPS|earnings per share/i.test(l) ? 2 : 1) + (/oper|adj|pro ?forma|non-gaap/i.test(l) ? 0.5 : 0)); }
    let list = [...cand.entries()].slice(0, 120).map(([k, o]) => ({ k, ...o, n: M.inputsOf(k).inputs.length }));
    list = list.filter(x => x.n >= 3);
    const maxN = Math.max(0, ...list.filter(x => x.tgt > 0).map(x => x.n));
    for (const x of list) if (x.tgt > 0 && x.n < 0.3 * maxN) x.tgt = 0.3; // a "target" fed by a handful of inputs is a side calculation
    if (!list.length) { // last resort: the formula cells nothing else depends on, biggest cones first
      list = [...M.ast.keys()].filter(k => !M.dep.has(k)).slice(0, 300).map(k => ({ k, tgt: 0, earn: 0, n: M.inputsOf(k).inputs.length }));
    }
    list.sort((x, y) => (y.tgt - x.tgt) || (y.earn - x.earn) || (y.n - x.n));
    // within the best class, the cell with the most inputs behind it is the model's real answer
    const best = list.filter(x => x.tgt === (list[0] || {}).tgt && x.earn === (list[0] || {}).earn).sort((x, y) => y.n - x.n);
    const rest = list.filter(x => !best.includes(x));
    return [...best, ...rest].slice(0, 12).map(x => [x.k, label(x.k)]);
  }
  function setupOutputs() {
    const opts = isSample ? SAMPLE_OUTS : guessOutputs();
    $("#outSel").innerHTML = opts.map(([k, l]) => `<option value="${esc(k)}">${esc(l)} (${esc(k)})</option>`).join("");
    $("#answerBox").hidden = false;
    setOutput(opts.length ? opts[0][0] : null);
  }
  function setOutput(k) {
    if (!k || !M.cell(k)) { outKey = null; $("#outVal").textContent = "Pick an answer cell"; $("#outLab").textContent = "Tap a cell in “Cell by cell” and choose “Use as the answer”."; renderRank(); renderInputs(); return; }
    outKey = k; openRow = null;
    const v = M.safeValue(k);
    $("#outVal").textContent = fmt(k, v);
    $("#outLab").textContent = label(k) + " · " + k;
    if ([...$("#outSel").options].every(o => o.value !== k)) $("#outSel").insertAdjacentHTML("afterbegin", `<option value="${esc(k)}">${esc(label(k))} (${esc(k)})</option>`);
    $("#outSel").value = k;
    renderRank(); renderInputs(); renderAssumes(); if (sheet) renderGrid();
  }

  /* ---------- ranking ---------- */
  function impact(k, mult) {
    const base = M.safeValue(outKey), v = M.cell(k).v;
    const nv = M.recompute(new Map([[k, v * mult]]), outKey);
    return isPct(outKey) ? (nv - base) : (base ? nv / base - 1 : 0);
  }
  function fmtImp(x) { if (x === null || isNaN(x)) return "n/a"; const s = (x >= 0 ? "+" : "−") + Math.abs(x * 100).toFixed(1); return s + (isPct(outKey) ? "pt" : "%"); }
  function renderRank() {
    const box = $("#rank"); if (!outKey) { box.innerHTML = ""; return; }
    const all = M.inputsOf(outKey).inputs, inputs = all.filter(useInput), hidden = all.length - inputs.length;
    const rows = [];
    for (const k of inputs.slice(0, 600)) {
      let up = null, dn = null, err = null;
      try { up = impact(k, 1.1); dn = impact(k, 0.9); } catch (e) { err = e.message || String(e); }
      rows.push({ k, up, dn, err, m: Math.max(Math.abs(up || 0), Math.abs(dn || 0)) });
    }
    const moving = rows.filter(r => r.err || r.m > 1e-9).sort((a, b) => b.m - a.m);
    const still = rows.length - moving.length;
    const max = Math.max(1e-9, ...moving.map(r => r.m));
    $("#rankHint").textContent = `${inputs.length} forecast assumptions feed this answer. Each moved 10% up (teal) and down (grey), ranked by how far the answer moves` +
      (isPct(outKey) ? " in percentage points." : ".") + (still ? ` ${still} more feed it without moving it.` : "") + (hidden ? ` ${hidden} reported actuals and facts are left out.` : "") + " Tap one to drag it.";
    box.innerHTML = moving.slice(0, 60).map((r, i) => {
      const c = M.cell(r.k), note = M.note(r.k), [tc, tl] = tagOf(note);
      const w = x => Math.min(50, Math.abs(x || 0) / max * 50);
      const bar = x => x === null ? "" : `<i style="${x >= 0 ? "left:50%" : `left:${50 - w(x)}%`};width:${w(x)}%;background:${x === r.up ? "var(--accent)" : "var(--faint)"}"></i>`;
      return `<div class="ri" data-k="${esc(r.k)}" tabindex="0">
        <div class="top"><span class="lab">${i + 1}. ${esc(M.assumptionName(r.k))}${M.periodOf(r.k) ? " · " + esc(M.periodOf(r.k).label) : ""}</span><span class="imp">${r.err ? "n/a" : fmtImp(r.up) + " / " + fmtImp(r.dn)}</span></div>
        <div class="meta"><span>${esc(r.k)}</span><span>now ${esc(fmtA(M, r.k, c.v, M.assumptionName(r.k)))}</span><span class="tag ${tc}">${tl}</span></div>
        ${r.err ? `<div class="err">Can't recompute through this one (${esc(r.err)}).</div>` : `<div class="bars"><span class="mid"></span>${bar(r.up)}${bar(r.dn)}</div>`}
        ${note ? `<div class="note">${esc(note)}</div>` : ""}
        <div class="whatif" hidden></div></div>`;
    }).join("") || `<p class="hint">Nothing typed moves this cell.</p>`;
  }
  function openWhatIf(row) {
    const k = row.dataset.k, wi = row.querySelector(".whatif"); if (!wi) return;
    if (openRow && openRow !== row) { const o = openRow.querySelector(".whatif"); o.hidden = true; o.innerHTML = ""; }
    if (!wi.hidden) { wi.hidden = true; wi.innerHTML = ""; openRow = null; return; }
    openRow = row; const v0 = M.cell(k).v, base = M.safeValue(outKey);
    wi.hidden = false;
    wi.innerHTML = `<input type="range" min="-50" max="50" step="1" value="0" aria-label="Change ${esc(label(k))}">
      <div class="wv"><span>−50%</span><span class="cur">${esc(fmt(k, v0))}</span><span>+50%</span></div>
      <div class="res">Answer: <span class="nv">${esc(fmt(outKey, base))}</span> <span class="delta"></span></div>`;
    const rng = wi.querySelector("input");
    rng.addEventListener("click", e => e.stopPropagation());
    rng.addEventListener("input", () => {
      const nvIn = v0 * (1 + rng.value / 100);
      wi.querySelector(".cur").textContent = fmt(k, nvIn) + (rng.value != 0 ? ` (${rng.value > 0 ? "+" : ""}${rng.value}%)` : "");
      let nv; try { nv = M.recompute(new Map([[k, nvIn]]), outKey); } catch (e) { wi.querySelector(".nv").textContent = "can't recompute"; return; }
      wi.querySelector(".nv").textContent = fmt(outKey, nv);
      const d = isPct(outKey) ? nv - base : (base ? nv / base - 1 : 0);
      const de = wi.querySelector(".delta"); de.textContent = Math.abs(d) < 1e-12 ? "" : fmtImp(d); de.className = "delta " + (d > 0 ? "pos" : d < 0 ? "neg" : "");
    });
  }

  /* ---------- assumptions ---------- */
  function renderInputs() {
    const cone = outKey ? M.inputsOf(outKey).cone : new Set();
    const list = [...M.cells.keys()].filter(k => M.isInput(k) && M.dep.has(k) && !M.isHeaderCell(k) && useInput(k));
    list.sort((a, b) => (cone.has(b) - cone.has(a)) || a.localeCompare(b, "en", { numeric: true }));
    const rows = list.slice(0, 800).map(k => {
      const note = M.note(k), [tc, tl] = tagOf(note);
      return `<tr><td class="k">${esc(k)}</td><td>${esc(M.assumptionName(k))}${M.periodOf(k) ? " · " + esc(M.periodOf(k).label) : ""}${note ? `<div class="note">${esc(note)}</div>` : ""}</td><td class="v">${esc(fmtA(M, k, M.cell(k).v, M.assumptionName(k)))}</td><td><span class="tag ${tc}">${M.inputKind(k) === "forecast" ? "forecast" : M.inputKind(k)}</span>${tl !== "typed in" ? ` <span class="tag ${tc}">${tl}</span>` : ""}</td><td class="k">${cone.has(k) ? "✓ feeds answer" : ""}</td></tr>`;
    }).join("");
    $("#alist").innerHTML = `<thead><tr><th>Cell</th><th>What it is</th><th>Value</th><th>Kind</th><th></th></tr></thead><tbody>${rows}</tbody>` +
      (list.length > 800 ? `<tfoot><tr><td colspan="5" class="note">Showing 800 of ${list.length}.</td></tr></tfoot>` : "");
  }

  /* ---------- sheets ---------- */
  function renderSheets() {
    $("#sheetsel").innerHTML = M.sheets.map(s => `<button type="button" class="${s === sheet ? "on" : ""}" data-s="${esc(s)}">${esc(s)}</button>`).join("");
    renderGrid();
  }
  function renderGrid() {
    const bd = M.bounds[sheet]; const g = $("#grid");
    if (!bd) { g.innerHTML = "<tr><td>Empty sheet</td></tr>"; return; }
    const cone = outKey ? M.inputsOf(outKey).cone : new Set();
    const r1 = Math.min(bd.r1, bd.r0 + 199), c1 = Math.min(bd.c1, bd.c0 + 39);
    let h = "<thead><tr><th></th>"; for (let c = bd.c0; c <= c1; c++) h += `<th>${E.numToCol(c)}</th>`; h += "</tr></thead><tbody>";
    for (let r = bd.r0; r <= r1; r++) {
      h += `<tr><th>${r}</th>`;
      for (let c = bd.c0; c <= c1; c++) {
        const a = E.numToCol(c) + r, k = E.key(sheet, a), cell = M.cell(k);
        if (!cell) { h += "<td></td>"; continue; }
        let cls = cell.f ? (/!/.test(cell.f) ? "xs" : "fx") : (typeof cell.v === "number" ? "in" : "tx");
        if (cone.has(k)) cls += " cone"; if (k === selKey) cls += " sel";
        const v = cell.f ? M.safeValue(k) : cell.v;
        h += `<td class="${cls}" data-k="${esc(k)}" title="${esc(k)}">${esc(cell.f || typeof v === "number" ? fmt(k, v) : (v ?? ""))}</td>`;
      }
      h += "</tr>";
    }
    g.innerHTML = h + "</tbody>";
  }
  function showDetail(k) {
    selKey = k; const c = M.cell(k), d = $("#detail");
    if (k.split("!")[0] !== sheet) { sheet = k.split("!")[0]; renderSheets(); } else renderGrid();
    if (!c) { d.hidden = true; return; }
    const prec = [...(M.prec.get(k) || [])].slice(0, 60), dep = [...(M.dep.get(k) || [])].slice(0, 60);
    const v = c.f ? M.safeValue(k) : c.v;
    const kind = c.f ? "Formula" : typeof c.v === "number" ? "Typed input" : "Text";
    d.hidden = false;
    d.innerHTML = `<div class="addr">${esc(k)} · ${kind}</div><div>${esc(label(k))}</div>
      ${c.f ? `<code>=${esc(c.f)}</code>` : ""}<div>Value: <b class="mono">${esc(fmt(k, v))}</b>${c.f && c.hasCache ? ' <span class="note">(saved in the file)</span>' : ""}</div>
      ${M.unsupported.has(k) ? `<div class="err">Can't recompute: ${esc(M.unsupported.get(k))}</div>` : ""}
      ${M.note(k) ? `<div class="note">${esc(M.note(k))}</div>` : ""}
      ${prec.length ? `<div class="note" style="margin-top:8px">Reads from</div><div class="refs">${prec.map(x => `<button type="button" data-go="${esc(x)}">${esc(x)}</button>`).join("")}</div>` : ""}
      ${dep.length ? `<div class="note" style="margin-top:8px">Feeds into</div><div class="refs">${dep.map(x => `<button type="button" data-go="${esc(x)}">${esc(x)}</button>`).join("")}</div>` : ""}
      ${c.f ? `<div style="margin-top:10px"><button class="btn" type="button" data-out="${esc(k)}">Use as the answer</button></div>` : ""}`;
    d.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ---------- what it assumes ---------- */
  function impliedTable() {
    const A = M.impliedMetrics(), B = M2 ? M2.impliedMetrics() : null;
    if (!A && !B) return null;
    const base = A || B, years = [...new Set([...(A ? A.years : []), ...(B ? B.years : [])].map(y => y.year))].sort();
    const yinfo = y => (A && A.years.find(x => x.year === y)) || (B && B.years.find(x => x.year === y));
    const f = (r, v) => v === null || v === undefined ? "–" : r.kind === "pct" ? (v * 100).toFixed(1) + "%" : r.kind === "eps" ? "$" + v.toFixed(2) : Math.round(v).toLocaleString("en-US");
    const get = (X, key, y) => { if (!X) return undefined; const r = X.rows.find(r => r.key === key); if (!r) return undefined; const i = X.years.findIndex(x => x.year === y); return i < 0 ? undefined : r.values[i]; };
    const keys = []; for (const X of [A, B]) if (X) for (const r of X.rows) if (!keys.find(k => k.key === r.key)) keys.push(r);
    let h = `<div class="imp-wrap"><table class="imp"><thead><tr><th></th>${years.map(y => `<th class="${yinfo(y).forecast ? "fc" : ""}">FY${y}${yinfo(y).forecast ? "E" : "A"}</th>`).join("")}</tr></thead><tbody>`;
    for (const r of keys) {
      h += `<tr><td class="m">${esc(r.name)}${B ? '<span class="who">A</span>' : ""}</td>${years.map(y => `<td>${f(r, get(A, r.key, y))}</td>`).join("")}</tr>`;
      if (B) h += `<tr class="b"><td class="m"><span class="who">B</span></td>${years.map(y => `<td>${f(r, get(B, r.key, y))}</td>`).join("")}</tr>`;
    }
    h += `</tbody></table></div>`;
    if (B) h += `<p class="hint" style="margin-top:6px">A = ${esc(name1)} · B = ${esc(name2)}</p>`;
    return h;
  }
  function rowImpact(cells) {
    if (!outKey) return null;
    try { const base = M.safeValue(outKey), ov = new Map(cells.map(k => [k, M.cell(k).v * 1.1])), nv = M.recompute(ov, outKey); return isPct(outKey) ? nv - base : (base ? nv / base - 1 : 0); } catch (e) { return null; }
  }
  function assumptionList(m, withImpact) {
    const allRows = m.forecastRows(), zero = allRows.filter(g => g.cells.every(k => m.cell(k).v === 0));
    const rows = allRows.filter(g => !zero.includes(g)).map(g => ({ g, name: m.assumptionName(g.cells[0]), imp: withImpact ? rowImpact(g.cells) : null }));
    if (withImpact) rows.sort((a, b) => Math.abs(b.imp || 0) - Math.abs(a.imp || 0)); else rows.sort((a, b) => a.g.id.localeCompare(b.g.id, "en", { numeric: true }));
    const out = rows.slice(0, 80).map(({ g, name, imp }) => {
      const chips = g.cells.slice(0, 16).map(k => { const p = m.periodOf(k); return `<span class="chip">${p ? `<b>${esc(p.label)}</b>` : ""}${esc(fmtA(m, k, m.cell(k).v, name))}</span>`; }).join("") + (g.cells.length > 16 ? `<span class="chip">+${g.cells.length - 16} more</span>` : "");
      const note = m.note(g.cells[0]);
      return `<div class="arow"><div class="top"><span class="nm">${esc(name)}</span>${imp !== null && withImpact ? `<span class="ix">${Math.abs(imp) < 1e-12 ? "" : "+10% → " + fmtImp(imp)}</span>` : ""}</div>
        <div class="where">${esc(g.id)}</div><div class="chips">${chips}</div>${note ? `<div class="note">${esc(note)}</div>` : ""}</div>`;
    }).join("");
    const z = zero.length ? `<p class="hint">Set to zero in every forecast period (${zero.length}): ${zero.map(g => esc(m.assumptionName(g.cells[0]))).join(", ")}.</p>` : "";
    return (out || `<p class="hint">No typed forecast assumptions found.</p>`) + z;
  }
  function constantList(m) {
    const gs = m.formulaConstants().sort((a, b) => b.cells.length - a.cells.length);
    if (!gs.length) return `<p class="hint">None. Every forecast number in this model sits in its own cell.</p>`;
    return gs.slice(0, 40).map(g => {
      const k = g.cells[0], periods = g.cells.map(x => m.periodOf(x)).filter(Boolean).map(p => p.label);
      return `<div class="arow"><div class="top"><span class="nm">${esc(m.niceLabel(k) || k)}</span><span class="ix">${esc(String(g.value))}</span></div>
        <div class="where">${esc(g.sheet + "!" + g.row)} · ${g.cells.length} cell${g.cells.length > 1 ? "s" : ""}${periods.length ? " · " + esc(periods.slice(0, 6).join(", ")) + (periods.length > 6 ? "…" : "") : ""}</div>
        <div class="chips"><span class="chip k">=${esc(m.cell(k).f.length > 90 ? m.cell(k).f.slice(0, 90) + "…" : m.cell(k).f)}</span></div></div>`;
    }).join("");
  }
  function renderAssumes() {
    if (!M) return;
    const two = !!M2;
    const it = impliedTable();
    let h = it ? `<h2 class="sec">What the forecast adds up to</h2><p class="hint">Backed out of the model's own statement rows, by fiscal year. Nobody typed these; they are what the assumptions below produce.</p>${it}` : "";
    h += `<h2 class="sec">Typed into the forecast</h2><p class="hint">Numbers someone typed into forecast periods, one line per row. ${outKey ? "Ranked by how far the answer moves if the whole row is 10% higher." : ""} Reported actuals are left out.</p>`;
    h += `<div class="two ${two ? "on" : ""}"><div>${two ? `<p class="colh">A · ${esc(name1)}</p>` : ""}${assumptionList(M, true)}</div>${two ? `<div><p class="colh">B · ${esc(name2)}</p>${assumptionList(M2, false)}</div>` : ""}</div>`;
    h += `<h2 class="sec">Written inside formulas</h2><p class="hint">Numbers hard-coded into forecast formulas rather than kept in their own cell. Easy to miss, and you can't change them without editing the formula.</p>`;
    h += `<div class="two ${two ? "on" : ""}"><div>${two ? `<p class="colh">A · ${esc(name1)}</p>` : ""}${constantList(M)}</div>${two ? `<div><p class="colh">B · ${esc(name2)}</p>${constantList(M2)}</div>` : ""}</div>`;
    $("#assumes").innerHTML = h;
  }

  /* ---------- events ---------- */
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === t));
    ["assumes", "rank", "inputs", "sheets"].forEach(p => $("#p-" + p).hidden = p !== t.dataset.p);
  }));
  $("#rank").addEventListener("click", e => { const r = e.target.closest(".ri"); if (r && !e.target.closest(".whatif")) openWhatIf(r); });
  $("#rank").addEventListener("keydown", e => { if (e.key === "Enter") { const r = e.target.closest(".ri"); if (r) openWhatIf(r); } });
  $("#sheetsel").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; sheet = b.dataset.s; renderSheets(); });
  $("#grid").addEventListener("click", e => { const td = e.target.closest("td[data-k]"); if (td) showDetail(td.dataset.k); });
  $("#detail").addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) return showDetail(g.dataset.go); const o = e.target.closest("[data-out]"); if (o) { setOutput(o.dataset.out); window.scrollTo({ top: 0, behavior: "smooth" }); } });
  $("#outSel").addEventListener("change", e => setOutput(e.target.value));
  $("#outAddr").addEventListener("change", e => { let v = e.target.value.trim().replace(/\$/g, ""); if (!v) return; if (!v.includes("!")) v = sheet + "!" + v.toUpperCase(); else { const [s, a] = v.split("!"); v = s.replace(/^'|'$/g, "") + "!" + a.toUpperCase(); } setOutput(v); });
  $("#file").addEventListener("change", e => readFile(e.target.files[0]));
  $("#file2").addEventListener("change", e => readFile2(e.target.files[0]));
  document.querySelectorAll(".withActuals").forEach(cb => cb.addEventListener("change", e => { withActuals = e.target.checked; document.querySelectorAll(".withActuals").forEach(x => x.checked = withActuals); renderRank(); renderInputs(); }));
  $("#sample").addEventListener("click", loadSample);
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("on"); }));
  ["dragleave", "drop"].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); if (ev === "drop" || e.target === drop) drop.classList.remove("on"); }));
  document.addEventListener("drop", e => readFile(e.dataTransfer.files[0]));

  // ?model=/path.xlsx&compare=/path2.xlsx (same-site paths only) for opening files hosted next to the page
  (async () => {
    const q = new URLSearchParams(location.search), safe = u => u && /^\/?[A-Za-z0-9_\-./ %]+\.xls[xm]?$/.test(u) && !u.includes("//") && !u.includes("..");
    const m = q.get("model"), c = q.get("compare");
    if (safe(m)) { const r = await fetch(m); await loadBuffer(await r.arrayBuffer(), decodeURIComponent(m.split("/").pop()), false); } else await loadSample();
    if (safe(c)) { const r = await fetch(c); const f = new File([await r.arrayBuffer()], decodeURIComponent(c.split("/").pop())); readFile2(f); }
  })();
})();
