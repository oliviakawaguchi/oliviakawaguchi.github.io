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
  let M = null, outKey = null, isSample = true, sheet = null, selKey = null, openRow = null;

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
    $("#fname").textContent = name;
    $("#fsub").textContent = `${M.sheets.length} sheets · ${M.ast.size.toLocaleString()} formulas · ${nIn.toLocaleString()} typed inputs in use` +
      (M.unsupported.size ? ` · ${M.unsupported.size} formulas use functions this reader can't recompute (their saved values are still shown)` : "");
    $("#sample").hidden = sample;
    sheet = M.sheets.find(s => /valuation/i.test(s)) || M.sheets[0];
    setupOutputs(); renderSheets();
  }
  async function loadSample() {
    const r = await fetch(SAMPLE); const b = await r.arrayBuffer();
    await loadBuffer(b, "MKSI model, public-data version", true);
  }
  function readFile(f) { if (!f) return; const fr = new FileReader(); fr.onload = () => loadBuffer(fr.result, f.name, false); fr.readAsArrayBuffer(f); }

  /* ---------- answer cell ---------- */
  function guessOutputs() {
    const re = /(price target|target price|fair value|implied (share )?price|value per share|upside|\bPT\b)/i, out = [];
    for (const k of M.ast.keys()) { const l = M.rowLabel(k); if (re.test(l)) out.push([k, label(k)]); if (out.length > 30) break; }
    if (!out.length) { // sell-side models label earnings rows, not a target: take the furthest-out forecasts
      const re2 = /^(adj(usted)?\.?\s*)?(EBITDA|EPS|diluted EPS|earnings per share)\b/i, rows = new Map();
      for (const k of M.ast.keys()) {
        const l = M.rowLabel(k); if (!re2.test(l)) continue;
        const [s, a] = k.split("!"), A = E.splitAddr(a), rk = s + "|" + A.r;
        const v = M.cell(k).v; if (typeof v !== "number") continue;
        if (!rows.has(rk) || E.splitAddr(rows.get(rk).split("!")[1]).c < A.c) rows.set(rk, k);
      }
      for (const k of [...rows.values()].slice(0, 10)) out.push([k, label(k)]);
    }
    if (!out.length) { // fall back to the formula cells nothing else depends on, biggest cones first
      const sinks = [...M.ast.keys()].filter(k => !M.dep.has(k)).slice(0, 300)
        .map(k => [k, M.inputsOf(k).inputs.length]).sort((a, b) => b[1] - a[1]).slice(0, 8);
      for (const [k] of sinks) out.push([k, label(k)]);
    }
    return out.slice(0, 12);
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
    renderRank(); renderInputs(); if (sheet) renderGrid();
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
    const { inputs } = M.inputsOf(outKey);
    const rows = [];
    for (const k of inputs.slice(0, 600)) {
      let up = null, dn = null, err = null;
      try { up = impact(k, 1.1); dn = impact(k, 0.9); } catch (e) { err = e.message || String(e); }
      rows.push({ k, up, dn, err, m: Math.max(Math.abs(up || 0), Math.abs(dn || 0)) });
    }
    const moving = rows.filter(r => r.err || r.m > 1e-9).sort((a, b) => b.m - a.m);
    const still = rows.length - moving.length;
    const max = Math.max(1e-9, ...moving.map(r => r.m));
    $("#rankHint").textContent = `${inputs.length} typed inputs feed this answer. Each moved 10% up (teal) and down (grey), ranked by how far the answer moves` +
      (isPct(outKey) ? " in percentage points." : ".") + (still ? ` ${still} more feed it without moving it.` : "") + " Tap one to drag it.";
    box.innerHTML = moving.slice(0, 60).map((r, i) => {
      const c = M.cell(r.k), note = M.note(r.k), [tc, tl] = tagOf(note);
      const w = x => Math.min(50, Math.abs(x || 0) / max * 50);
      const bar = x => x === null ? "" : `<i style="${x >= 0 ? "left:50%" : `left:${50 - w(x)}%`};width:${w(x)}%;background:${x === r.up ? "var(--accent)" : "var(--faint)"}"></i>`;
      return `<div class="ri" data-k="${esc(r.k)}" tabindex="0">
        <div class="top"><span class="lab">${i + 1}. ${esc(label(r.k))}</span><span class="imp">${r.err ? "n/a" : fmtImp(r.up) + " / " + fmtImp(r.dn)}</span></div>
        <div class="meta"><span>${esc(r.k)}</span><span>now ${esc(fmt(r.k, c.v))}</span><span class="tag ${tc}">${tl}</span></div>
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
    const list = [...M.cells.keys()].filter(k => M.isInput(k) && M.dep.has(k));
    list.sort((a, b) => (cone.has(b) - cone.has(a)) || a.localeCompare(b, "en", { numeric: true }));
    const rows = list.slice(0, 800).map(k => {
      const note = M.note(k), [tc, tl] = tagOf(note);
      return `<tr><td class="k">${esc(k)}</td><td>${esc(label(k))}${note ? `<div class="note">${esc(note)}</div>` : ""}</td><td class="v">${esc(fmt(k, M.cell(k).v))}</td><td><span class="tag ${tc}">${tl}</span></td><td class="k">${cone.has(k) ? "✓ feeds answer" : ""}</td></tr>`;
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

  /* ---------- events ---------- */
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === t));
    ["rank", "inputs", "sheets"].forEach(p => $("#p-" + p).hidden = p !== t.dataset.p);
  }));
  $("#rank").addEventListener("click", e => { const r = e.target.closest(".ri"); if (r && !e.target.closest(".whatif")) openWhatIf(r); });
  $("#rank").addEventListener("keydown", e => { if (e.key === "Enter") { const r = e.target.closest(".ri"); if (r) openWhatIf(r); } });
  $("#sheetsel").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; sheet = b.dataset.s; renderSheets(); });
  $("#grid").addEventListener("click", e => { const td = e.target.closest("td[data-k]"); if (td) showDetail(td.dataset.k); });
  $("#detail").addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) return showDetail(g.dataset.go); const o = e.target.closest("[data-out]"); if (o) { setOutput(o.dataset.out); window.scrollTo({ top: 0, behavior: "smooth" }); } });
  $("#outSel").addEventListener("change", e => setOutput(e.target.value));
  $("#outAddr").addEventListener("change", e => { let v = e.target.value.trim().replace(/\$/g, ""); if (!v) return; if (!v.includes("!")) v = sheet + "!" + v.toUpperCase(); else { const [s, a] = v.split("!"); v = s.replace(/^'|'$/g, "") + "!" + a.toUpperCase(); } setOutput(v); });
  $("#file").addEventListener("change", e => readFile(e.target.files[0]));
  $("#sample").addEventListener("click", loadSample);
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("on"); }));
  ["dragleave", "drop"].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); if (ev === "drop" || e.target === drop) drop.classList.remove("on"); }));
  document.addEventListener("drop", e => readFile(e.dataTransfer.files[0]));

  loadSample();
})();
