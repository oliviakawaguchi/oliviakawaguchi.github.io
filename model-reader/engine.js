/* Model Reader engine: reads an Excel workbook (via SheetJS), finds the typed
   inputs, traces the formula graph, and recomputes outputs when inputs change.
   Runs entirely in the browser. */
(function (global) {
  "use strict";

  /* ---------- addresses ---------- */
  function colToNum(c) { let n = 0; for (const ch of c) n = n * 26 + (ch.charCodeAt(0) - 64); return n; }
  function numToCol(n) { let s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function splitAddr(a) { const m = /^([A-Z]+)(\d+)$/.exec(a); return m ? { c: colToNum(m[1]), r: +m[2] } : null; }
  const key = (sheet, addr) => sheet + "!" + addr;

  /* ---------- tokenizer ---------- */
  const OPS = ["<>", "<=", ">=", "+", "-", "*", "/", "^", "&", "=", "<", ">", "%"];
  function tokenize(src) {
    const t = []; let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") { i++; continue; }
      if (ch === '"') { let j = i + 1, s = ""; while (j < src.length) { if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; } s += src[j++]; } t.push({ k: "str", v: s }); i = j + 1; continue; }
      if (ch === "(" || ch === ")" || ch === "," || ch === ";") { t.push({ k: ch === ";" ? "," : ch }); i++; continue; }
      if (ch === "{") throw new Unsupported("array constant");
      if (ch === "#") { const m = /^#[A-Z0-9\/!?]+/i.exec(src.slice(i)); t.push({ k: "err", v: m ? m[0] : "#ERR" }); i += m ? m[0].length : 1; continue; }
      const op = OPS.find(o => src.startsWith(o, i));
      if (op) { t.push({ k: "op", v: op }); i += op.length; continue; }
      // number
      let m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (m && !/^[A-Z]/i.test(src.slice(i + m[0].length, i + m[0].length + 1))) { t.push({ k: "num", v: parseFloat(m[0]) }); i += m[0].length; continue; }
      // reference with optional sheet: 'Sheet name'!A1 or Sheet!A1, ranges, whole columns
      m = /^(?:'((?:[^']|'')+)'|([A-Za-z0-9_.]+))!(\$?[A-Z]{1,3}\$?\d+|\$?[A-Z]{1,3})(?::(\$?[A-Z]{1,3}\$?\d+|\$?[A-Z]{1,3}))?/.exec(src.slice(i));
      if (m) {
        const sheet = (m[1] ? m[1].replace(/''/g, "'") : m[2]);
        t.push({ k: "ref", sheet, a: m[3].replace(/\$/g, ""), b: m[4] ? m[4].replace(/\$/g, "") : null }); i += m[0].length; continue;
      }
      m = /^(\$?[A-Z]{1,3}\$?\d+)(?::(\$?[A-Z]{1,3}\$?\d+))?(?![A-Za-z0-9_(])/.exec(src.slice(i));
      if (m) { t.push({ k: "ref", sheet: null, a: m[1].replace(/\$/g, ""), b: m[2] ? m[2].replace(/\$/g, "") : null }); i += m[0].length; continue; }
      m = /^(\$?[A-Z]{1,3}):(\$?[A-Z]{1,3})(?![A-Za-z0-9_(])/.exec(src.slice(i));
      if (m) { t.push({ k: "ref", sheet: null, a: m[1].replace(/\$/g, ""), b: m[2].replace(/\$/g, "") }); i += m[0].length; continue; }
      m = /^([A-Za-z_][A-Za-z0-9_.]*)\s*\(/.exec(src.slice(i));
      if (m) { t.push({ k: "fn", v: m[1].toUpperCase().replace(/^_XLFN\./, "") }); i += m[0].length; continue; }
      m = /^(TRUE|FALSE)(?![A-Za-z0-9_])/i.exec(src.slice(i));
      if (m) { t.push({ k: "bool", v: m[1].toUpperCase() === "TRUE" }); i += m[0].length; continue; }
      m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i));
      if (m) throw new Unsupported("named range " + m[0]);
      throw new Unsupported("character " + ch);
    }
    return t;
  }

  /* ---------- parser (precedence climbing) ---------- */
  const BIN = { "=": 1, "<>": 1, "<": 1, ">": 1, "<=": 1, ">=": 1, "&": 2, "+": 3, "-": 3, "*": 4, "/": 4, "^": 5 };
  function parse(src, sheet) {
    const t = tokenize(src); let p = 0;
    const peek = () => t[p], next = () => t[p++];
    function primary() {
      const tk = next(); if (!tk) throw new Unsupported("empty");
      if (tk.k === "num") return { k: "num", v: tk.v };
      if (tk.k === "str") return { k: "str", v: tk.v };
      if (tk.k === "bool") return { k: "bool", v: tk.v };
      if (tk.k === "err") return { k: "errv", v: tk.v };
      if (tk.k === "ref") return { k: "ref", sheet: tk.sheet || sheet, a: tk.a, b: tk.b };
      if (tk.k === "op" && (tk.v === "-" || tk.v === "+")) { const e = unary(); return tk.v === "-" ? { k: "neg", e } : e; }
      if (tk.k === "(") { const e = expr(0); if (!next() || t[p - 1].k !== ")") throw new Unsupported("paren"); return e; }
      if (tk.k === "fn") {
        const args = [];
        if (peek() && peek().k === ")") { next(); return { k: "fn", n: tk.v, args }; }
        for (;;) {
          if (peek() && (peek().k === "," || peek().k === ")")) args.push({ k: "blank" }); else args.push(expr(0));
          const s = next(); if (!s) throw new Unsupported("args"); if (s.k === ")") break; if (s.k !== ",") throw new Unsupported("args");
        }
        return { k: "fn", n: tk.v, args };
      }
      throw new Unsupported("token " + tk.k);
    }
    function unary() { let e = primary(); while (peek() && peek().k === "op" && peek().v === "%") { next(); e = { k: "pct", e }; } return e; }
    function expr(minP) {
      let lhs = unary();
      for (;;) {
        const tk = peek(); if (!tk || tk.k !== "op" || !(tk.v in BIN)) break;
        const pr = BIN[tk.v]; if (pr < minP) break; next();
        const rhs = expr(tk.v === "^" ? pr : pr + 1);
        lhs = { k: "bin", op: tk.v, l: lhs, r: rhs };
      }
      return lhs;
    }
    const e = expr(0); if (p < t.length) throw new Unsupported("trailing tokens"); return e;
  }

  function Unsupported(msg) { this.message = msg; }
  function XlErr(code) { this.code = code; }

  /* ---------- workbook model ---------- */
  function Model(wb, XLSX) {
    this.XLSX = XLSX; this.wb = wb; this.cells = new Map(); this.sheets = wb.SheetNames.slice();
    this.bounds = {};
    for (const sn of this.sheets) {
      const ws = wb.Sheets[sn]; if (!ws || !ws["!ref"]) { this.bounds[sn] = null; continue; }
      const rg = XLSX.utils.decode_range(ws["!ref"]); this.bounds[sn] = { r0: rg.s.r + 1, r1: rg.e.r + 1, c0: rg.s.c + 1, c1: rg.e.c + 1 };
      for (const a in ws) {
        if (a[0] === "!") continue; const c = ws[a];
        if (c.t === "z" && !c.f) continue; // empty stub
        const stub = c.t === "z";
        const cell = { sheet: sn, addr: a, f: c.f || null, v: stub ? undefined : c.v, t: c.t, z: c.z || null, w: stub ? null : (c.w || null), hasCache: !stub && c.v !== undefined && c.v !== null };
        if (c.t === "e") cell.v = new XlErr(c.w || "#ERR");
        if (cell.f && !cell.hasCache) cell.v = undefined;
        this.cells.set(key(sn, a), cell);
      }
    }
    this.ast = new Map(); this.prec = new Map(); this.dep = new Map(); this.unsupported = new Map();
    for (const [k, c] of this.cells) {
      if (!c.f) continue;
      try { const ast = parse(c.f, c.sheet); this.ast.set(k, ast); const refs = new Set(); this._collect(ast, refs); this.prec.set(k, refs);
        for (const r of refs) { if (!this.dep.has(r)) this.dep.set(r, new Set()); this.dep.get(r).add(k); } }
      catch (e) { this.unsupported.set(k, e.message || String(e)); this.prec.set(k, new Set()); }
    }
    this.base = new Map(); // computed base values for cells without cache
  }
  Model.prototype._expand = function (sheet, a, b) {
    const out = []; const bd = this.bounds[sheet]; if (!bd) return out;
    let A = splitAddr(a), B = b ? splitAddr(b) : null;
    if (!A) { A = { c: colToNum(a), r: bd.r0 }; B = { c: colToNum(b), r: bd.r1 }; }
    if (!B) return [key(sheet, a)];
    const r0 = Math.max(Math.min(A.r, B.r), bd.r0), r1 = Math.min(Math.max(A.r, B.r), bd.r1);
    const c0 = Math.max(Math.min(A.c, B.c), bd.c0), c1 = Math.min(Math.max(A.c, B.c), bd.c1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push(key(sheet, numToCol(c) + r));
    return out;
  };
  Model.prototype._collect = function (n, set) {
    if (!n) return;
    if (n.k === "ref") { for (const k of this._expand(n.sheet, n.a, n.b)) set.add(k); return; }
    if (n.k === "neg" || n.k === "pct") return this._collect(n.e, set);
    if (n.k === "bin") { this._collect(n.l, set); this._collect(n.r, set); return; }
    if (n.k === "fn") for (const a of n.args) this._collect(a, set);
  };
  Model.prototype.cell = function (k) { return this.cells.get(k); };
  Model.prototype.isInput = function (k) { const c = this.cells.get(k); return !!c && !c.f && typeof c.v === "number" && c.t !== "e"; };

  /* evaluation context: overrides + dirty set + memo */
  Model.prototype.value = function (k, ctx) {
    ctx = ctx || this._baseCtx || (this._baseCtx = { ov: new Map(), dirty: null, memo: this.base, stack: new Set() });
    if (ctx.ov.has(k)) return ctx.ov.get(k);
    const c = this.cells.get(k);
    if (!c) return null;
    if (!c.f) return c.v === undefined ? null : c.v;
    const useCache = c.hasCache && (!ctx.dirty || !ctx.dirty.has(k));
    if (useCache) return c.v;
    if (ctx.memo.has(k)) return ctx.memo.get(k);
    if (this.unsupported.has(k)) throw new Unsupported(this.unsupported.get(k));
    if (ctx.stack.has(k)) throw new Unsupported("circular reference at " + k);
    ctx.stack.add(k);
    let v; try { v = this._ev(this.ast.get(k), c.sheet, ctx); if (Array.isArray(v)) v = v[0][0]; } finally { ctx.stack.delete(k); }
    ctx.memo.set(k, v); return v;
  };
  Model.prototype.safeValue = function (k, ctx) { try { return this.value(k, ctx); } catch (e) { return e instanceof XlErr ? e.code : undefined; } };

  Model.prototype.recompute = function (overrides, outKey) {
    const dirty = new Set(); const q = [...overrides.keys()];
    while (q.length) { const k = q.pop(); const d = this.dep.get(k); if (!d) continue; for (const x of d) if (!dirty.has(x)) { dirty.add(x); q.push(x); } }
    const ctx = { ov: overrides, dirty, memo: new Map(), stack: new Set() };
    return this.value(outKey, ctx);
  };

  /* all typed inputs that feed a given output */
  Model.prototype.inputsOf = function (outKey) {
    const seen = new Set(), inputs = []; const q = [outKey];
    while (q.length) { const k = q.pop(); if (seen.has(k)) continue; seen.add(k);
      const c = this.cells.get(k); if (!c) continue;
      if (!c.f) { if (typeof c.v === "number" && k !== outKey) inputs.push(k); continue; }
      for (const p of this.prec.get(k) || []) q.push(p); }
    return { inputs, cone: seen };
  };

  /* ---------- operators & functions ---------- */
  function num(v) {
    if (v instanceof XlErr) throw v;
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v; if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "string") { const n = Number(v.replace(/,/g, "")); if (isNaN(n)) throw new XlErr("#VALUE!"); return n; }
    if (typeof v === "string" && v[0] === "#") throw new XlErr(v);
    throw new XlErr("#VALUE!");
  }
  function scalar(v) { return Array.isArray(v) ? v[0][0] : v; }
  function flat(args, model, sheet, ctx) {
    const out = [];
    for (const a of args) {
      if (a.k === "ref" && (a.b || false)) { for (const k of model._expand(a.sheet, a.a, a.b)) { const v = model.value(k, ctx); if (typeof v === "number") out.push(v); else if (v instanceof XlErr) throw v; } }
      else if (a.k === "ref") { const v = model.value(key(a.sheet, a.a), ctx); if (typeof v === "number") out.push(v); else if (typeof v === "boolean") out.push(v ? 1 : 0); }
      else { const v = scalar(model._ev(a, sheet, ctx)); out.push(num(v)); }
    }
    return out;
  }
  function roundTo(x, d) { const f = Math.pow(10, d); return Math.round((x + Math.sign(x) * 1e-12) * f) / f; }
  function textFmt(v, fmt) {
    v = num(v); fmt = String(fmt);
    if (/%/.test(fmt)) { const d = ((fmt.split(".")[1] || "").match(/0/g) || []).length; return (v * 100).toFixed(d) + "%"; }
    const d = ((fmt.split(".")[1] || "").match(/0/g) || []).length; const s = v.toFixed(d);
    return /,/.test(fmt) ? Number(s).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : s;
  }
  const FN = {
    SUM: (a, m, s, c) => flat(a, m, s, c).reduce((x, y) => x + y, 0),
    AVERAGE: (a, m, s, c) => { const f = flat(a, m, s, c); if (!f.length) throw new XlErr("#DIV/0!"); return f.reduce((x, y) => x + y, 0) / f.length; },
    MIN: (a, m, s, c) => { const f = flat(a, m, s, c); return f.length ? Math.min(...f) : 0; },
    MAX: (a, m, s, c) => { const f = flat(a, m, s, c); return f.length ? Math.max(...f) : 0; },
    COUNT: (a, m, s, c) => flat(a, m, s, c).length,
    ABS: (a, m, s, c) => Math.abs(num(ev1(a[0], m, s, c))),
    ROUND: (a, m, s, c) => roundTo(num(ev1(a[0], m, s, c)), num(ev1(a[1], m, s, c))),
    ROUNDUP: (a, m, s, c) => { const x = num(ev1(a[0], m, s, c)), f = Math.pow(10, num(ev1(a[1], m, s, c))); return Math.sign(x) * Math.ceil(Math.abs(x) * f - 1e-9) / f; },
    ROUNDDOWN: (a, m, s, c) => { const x = num(ev1(a[0], m, s, c)), f = Math.pow(10, num(ev1(a[1], m, s, c))); return Math.sign(x) * Math.floor(Math.abs(x) * f + 1e-9) / f; },
    INT: (a, m, s, c) => Math.floor(num(ev1(a[0], m, s, c))),
    MOD: (a, m, s, c) => { const x = num(ev1(a[0], m, s, c)), y = num(ev1(a[1], m, s, c)); return x - y * Math.floor(x / y); },
    POWER: (a, m, s, c) => Math.pow(num(ev1(a[0], m, s, c)), num(ev1(a[1], m, s, c))),
    SQRT: (a, m, s, c) => Math.sqrt(num(ev1(a[0], m, s, c))),
    EXP: (a, m, s, c) => Math.exp(num(ev1(a[0], m, s, c))),
    LN: (a, m, s, c) => Math.log(num(ev1(a[0], m, s, c))),
    SIGN: (a, m, s, c) => Math.sign(num(ev1(a[0], m, s, c))),
    IF: (a, m, s, c) => { const t = ev1(a[0], m, s, c); return truthy(t) ? (a[1] ? ev1(a[1], m, s, c) : true) : (a[2] && a[2].k !== "blank" ? ev1(a[2], m, s, c) : false); },
    IFERROR: (a, m, s, c) => { try { const v = ev1(a[0], m, s, c); if (v instanceof XlErr || (typeof v === "string" && v[0] === "#")) return ev1(a[1], m, s, c); return v; } catch (e) { if (e instanceof XlErr) return ev1(a[1], m, s, c); throw e; } },
    AND: (a, m, s, c) => a.every(x => truthy(ev1(x, m, s, c))),
    OR: (a, m, s, c) => a.some(x => truthy(ev1(x, m, s, c))),
    NOT: (a, m, s, c) => !truthy(ev1(a[0], m, s, c)),
    TEXT: (a, m, s, c) => textFmt(ev1(a[0], m, s, c), ev1(a[1], m, s, c)),
    SUMPRODUCT: (a, m, s, c) => { const arrs = a.map(x => x.k === "ref" ? m._expand(x.sheet, x.a, x.b).map(k => { const v = m.value(k, c); return typeof v === "number" ? v : 0; }) : [num(ev1(x, m, s, c))]);
      let t = 0; for (let i = 0; i < arrs[0].length; i++) t += arrs.reduce((p, arr) => p * (arr[i] || 0), 1); return t; },
  };
  /* 2-D access to a range argument */
  function grid(n, m, ctx) {
    if (n.k !== "ref") { const v = ev1(n, m, null, ctx); return { R: 1, C: 1, at: () => v }; }
    const bd = m.bounds[n.sheet]; let A = splitAddr(n.a), B = n.b ? splitAddr(n.b) : null;
    if (!A) { A = { c: colToNum(n.a), r: bd ? bd.r0 : 1 }; B = { c: colToNum(n.b), r: bd ? bd.r1 : 1 }; }
    if (!B) B = A;
    const r0 = Math.min(A.r, B.r), c0 = Math.min(A.c, B.c), R = Math.abs(B.r - A.r) + 1, C = Math.abs(B.c - A.c) + 1;
    return { R, C, at: (i, j) => { const v = m.value(key(n.sheet, numToCol(c0 + j) + (r0 + i)), ctx); return v === null || v === undefined ? 0 : v; } };
  }
  function crit(c) {
    if (typeof c === "number") return v => v === c;
    const s = String(c), m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(s), op = m[1] || "=", rhs = m[2], n = Number(rhs);
    const cmp = (v) => { const x = isNaN(n) ? String(v).toLowerCase() : Number(v), y = isNaN(n) ? rhs.toLowerCase() : n;
      return op === "=" ? x == y : op === "<>" ? x != y : op === "<" ? x < y : op === ">" ? x > y : op === "<=" ? x <= y : x >= y; };
    return cmp;
  }
  function matchPos(look, g, type) {
    const vals = []; for (let i = 0; i < g.R; i++) for (let j = 0; j < g.C; j++) vals.push(g.at(i, j));
    if (type === 0) { const i = vals.findIndex(v => (typeof v === "string" && typeof look === "string") ? v.toLowerCase() === look.toLowerCase() : v == look); if (i < 0) throw new XlErr("#N/A"); return i + 1; }
    let best = -1; for (let i = 0; i < vals.length; i++) { if (type > 0 ? vals[i] <= look : vals[i] >= look) best = i; else break; }
    if (best < 0) throw new XlErr("#N/A"); return best + 1;
  }
  Object.assign(FN, {
    CHOOSE: (a, m, s, c) => { const i = Math.floor(num(ev1(a[0], m, s, c))); if (i < 1 || i >= a.length) throw new XlErr("#VALUE!"); return m._ev(a[i], s, c); },
    INDEX: (a, m, s, c) => { const g = grid(a[0], m, c); let r = a[1] ? Math.floor(num(ev1(a[1], m, s, c))) : 1, k = a[2] ? Math.floor(num(ev1(a[2], m, s, c))) : 1;
      if (g.R === 1 && !a[2]) { k = r; r = 1; } if (r < 1 || k < 1 || r > g.R || k > g.C) throw new XlErr("#REF!"); return g.at(r - 1, k - 1); },
    MATCH: (a, m, s, c) => matchPos(ev1(a[0], m, s, c), grid(a[1], m, c), a[2] ? num(ev1(a[2], m, s, c)) : 1),
    VLOOKUP: (a, m, s, c) => { const g = grid(a[1], m, c), col = Math.floor(num(ev1(a[2], m, s, c))), exact = a[3] && !truthy(ev1(a[3], m, s, c));
      const first = { R: g.R, C: 1, at: (i) => g.at(i, 0) }; return g.at(matchPos(ev1(a[0], m, s, c), first, exact ? 0 : 1) - 1, col - 1); },
    HLOOKUP: (a, m, s, c) => { const g = grid(a[1], m, c), row = Math.floor(num(ev1(a[2], m, s, c))), exact = a[3] && !truthy(ev1(a[3], m, s, c));
      const first = { R: 1, C: g.C, at: (i, j) => g.at(0, j) }; return g.at(row - 1, matchPos(ev1(a[0], m, s, c), first, exact ? 0 : 1) - 1); },
    SUMIF: (a, m, s, c) => { const g = grid(a[0], m, c), f = crit(ev1(a[1], m, s, c)), sg = a[2] ? grid(a[2], m, c) : g; let t = 0;
      for (let i = 0; i < g.R; i++) for (let j = 0; j < g.C; j++) if (f(g.at(i, j))) { const v = sg.at(i, j); if (typeof v === "number") t += v; } return t; },
    COUNTIF: (a, m, s, c) => { const g = grid(a[0], m, c), f = crit(ev1(a[1], m, s, c)); let t = 0; for (let i = 0; i < g.R; i++) for (let j = 0; j < g.C; j++) if (f(g.at(i, j))) t++; return t; },
    MEDIAN: (a, m, s, c) => { const f = flat(a, m, s, c).sort((x, y) => x - y); if (!f.length) throw new XlErr("#NUM!"); const h = f.length >> 1; return f.length % 2 ? f[h] : (f[h - 1] + f[h]) / 2; },
    MROUND: (a, m, s, c) => { const x = num(ev1(a[0], m, s, c)), k = num(ev1(a[1], m, s, c)); if (!k) return 0; return Math.round(x / k + 1e-12 * Math.sign(x)) * k; },
    PRODUCT: (a, m, s, c) => flat(a, m, s, c).reduce((x, y) => x * y, 1),
  });
  function truthy(v) { if (typeof v === "string") { if (/^true$/i.test(v)) return true; if (/^false$/i.test(v)) return false; } return !!num(v); }
  function ev1(n, m, s, c) { return scalar(m._ev(n, s, c)); }

  Model.prototype._ev = function (n, sheet, ctx) {
    switch (n.k) {
      case "num": case "str": case "bool": return n.v;
      case "errv": throw new XlErr(n.v);
      case "blank": return 0;
      case "ref": {
        if (!n.b) { const v = this.value(key(n.sheet, n.a), ctx); if (v instanceof XlErr) throw v; if (typeof v === "string" && /^#(DIV\/0!|N\/A|VALUE!|REF!|NAME\?|NUM!|NULL!)$/.test(v)) throw new XlErr(v); return v === null || v === undefined ? 0 : v; }
        const ks = this._expand(n.sheet, n.a, n.b); return [ks.map(k => this.value(k, ctx))];
      }
      case "neg": return -num(scalar(this._ev(n.e, sheet, ctx)));
      case "pct": return num(scalar(this._ev(n.e, sheet, ctx))) / 100;
      case "bin": {
        const l = scalar(this._ev(n.l, sheet, ctx)), r = scalar(this._ev(n.r, sheet, ctx));
        switch (n.op) {
          case "+": return num(l) + num(r);
          case "-": return num(l) - num(r);
          case "*": return num(l) * num(r);
          case "/": { const d = num(r); if (d === 0) throw new XlErr("#DIV/0!"); return num(l) / d; }
          case "^": return Math.pow(num(l), num(r));
          case "&": return String(l ?? "") + String(r ?? "");
          case "=": return l == r; case "<>": return l != r;
          case "<": return num(l) < num(r); case ">": return num(l) > num(r);
          case "<=": return num(l) <= num(r); case ">=": return num(l) >= num(r);
        }
        throw new Unsupported("operator " + n.op);
      }
      case "fn": { const f = FN[n.n]; if (!f) throw new Unsupported("function " + n.n); return f(n.args, this, sheet, ctx); }
    }
    throw new Unsupported("node " + n.k);
  };

  /* ---------- labels ---------- */
  Model.prototype.rowLabel = function (k) {
    const c = this.cells.get(k); if (!c) return ""; const A = splitAddr(c.addr);
    for (let col = A.c - 1; col >= 1; col--) { const x = this.cells.get(key(c.sheet, numToCol(col) + A.r)); if (x && typeof x.v === "string" && /[A-Za-z]/.test(x.v) && !x.f) return x.v.trim(); }
    return "";
  };
  Model.prototype.colHeader = function (k) {
    const c = this.cells.get(k); if (!c) return ""; const A = splitAddr(c.addr);
    for (let r = A.r - 1; r >= Math.max(1, A.r - 40); r--) {
      const x = this.cells.get(key(c.sheet, numToCol(A.c) + r)); if (!x) continue;
      if ((typeof x.v === "string" && x.v.trim()) || (typeof x.v === "number" && Number.isInteger(x.v) && x.v >= 1990 && x.v <= 2100 && !x.f)) return String(x.v).trim();
    }
    return "";
  };
  Model.prototype.note = function (k) {
    const c = this.cells.get(k); if (!c) return ""; const A = splitAddr(c.addr); const bd = this.bounds[c.sheet]; const parts = [];
    for (let col = A.c + 1; col <= (bd ? bd.c1 : A.c + 8); col++) { const x = this.cells.get(key(c.sheet, numToCol(col) + A.r)); if (x && typeof x.v === "string" && !x.f && x.v.trim().length > 3) parts.push(x.v.trim()); }
    return parts.sort((a, b) => b.length - a.length)[0] || "";
  };

  global.ModelEngine = { Model, splitAddr, numToCol, colToNum, key, Unsupported, XlErr, parse };
})(window);

/* ---------- periods: which column is which quarter/year, and where forecasts start ---------- */
(function () {
  "use strict";
  const ME = window.ModelEngine, M = ME.Model.prototype;
  const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const yr = s => { let y = +s; return y < 100 ? 2000 + y : y; };
  const endOf = (y, m) => y * 100 + m; // comparable yyyymm

  // returns {label, end:yyyymm, kind:'q'|'h'|'y'|'m', flag:'E'|'A'|null} or null
  function parsePeriod(text, num, fmtz, XLSX) {
    let s = (text == null ? "" : String(text)).trim(), m, flag = null;
    if (/[AEP]$/i.test(s) && /\d/.test(s)) { flag = /E|P/i.test(s.slice(-1)) ? "E" : "A"; }
    if ((m = /^([1-4])Q\s?['’]?(\d{2,4})\s?[AEP]?$/i.exec(s)) || (m = /^Q([1-4])\s?['’]?(\d{2,4})\s?[AEP]?$/i.exec(s)))
      return { label: s, end: endOf(yr(m[2]), +m[1] * 3), kind: "q", flag };
    if ((m = /^([1-2])H\s?['’]?(\d{2,4})\s?[AEP]?$/i.exec(s)) || (m = /^H([1-2])\s?['’]?(\d{2,4})\s?[AEP]?$/i.exec(s)))
      return { label: s, end: endOf(yr(m[2]), +m[1] * 6), kind: "h", flag };
    if ((m = /^(?:FY|CY|F)\s?['’]?(\d{2}|20\d{2})\s?[AEP]?$/i.exec(s)) || (m = /^(20\d{2})\s?[AEP]?$/.exec(s)))
      return { label: s, end: endOf(yr(m[1]), 12), kind: "y", flag };
    if ((m = /^([A-Za-z]{3})[a-z]*[- ']?(\d{2,4})\s?[AEP]?$/.exec(s)) && MON[m[1].toLowerCase()])
      return { label: s, end: endOf(yr(m[2]), MON[m[1].toLowerCase()]), kind: "m", flag };
    if (typeof num === "number" && !s) s = String(num);
    if (typeof num === "number" && Number.isInteger(num) && num >= 1990 && num <= 2100 && (!fmtz || !/[dmy]/i.test(fmtz)))
      return { label: String(num), end: endOf(num, 12), kind: "y", flag: null };
    if (typeof num === "number" && fmtz && /m{1,4}|yy/i.test(fmtz) && num > 20000 && num < 80000 && XLSX) {
      const d = XLSX.SSF.parse_date_code(num); if (d) return { label: s || `${d.y}-${d.m}`, end: endOf(d.y, d.m), kind: "m", flag: null };
    }
    return null;
  }

  M.periods = function () {
    if (this._periods) return this._periods;
    const XLSX = this.XLSX, out = {};
    const now = new Date(); // a quarter counts as reported ~45 days after it ends
    const rep = new Date(now.getTime() - 45 * 864e5); const cutoff = endOf(rep.getFullYear(), Math.floor(rep.getMonth() / 3) * 3 || 12) - (Math.floor(rep.getMonth() / 3) === 0 ? 100 : 0);
    for (const sn of this.sheets) {
      const bd = this.bounds[sn]; if (!bd) continue;
      const hdrRows = [];
      for (let r = bd.r0; r <= Math.min(bd.r1, bd.r0 + 400); r++) {
        const cols = new Map();
        for (let c = bd.c0; c <= bd.c1; c++) {
          const k = ME.key(sn, ME.numToCol(c) + r), cell = this.cells.get(k); if (!cell) continue;
          const v = cell.f ? this.safeValue(k) : cell.v;
          const p = parsePeriod(cell.w || (typeof v === "string" ? v : ""), typeof v === "number" ? v : null, cell.z, XLSX);
          if (p) cols.set(c, p);
        }
        if (cols.size >= 3) {
          const ent = [...cols.entries()].sort((a, b) => a[0] - b[0]);
          const numericYears = ent.every(([c, p]) => p.kind === "y" && /^\d{4}$/.test(p.label));
          const ok = !numericYears || ent.every(([c, p], i) => i === 0 || p.end - ent[i - 1][1].end === 100);
          if (ok) hdrRows.push({ r, cols });
        }
      }
      const boundary = null;
      out[sn] = { hdrRows, boundary: boundary || cutoff, detected: !!boundary };
    }
    this._periods = out; return out;
  };
  M.isHeaderCell = function (k) { const [sn, a] = k.split("!"), P = this.periods()[sn]; if (!P) return false; const A = ME.splitAddr(a); return P.hdrRows.some(h => h.r === A.r && h.cols.has(A.c)); };
  M.periodOf = function (k) {
    const [sn, a] = k.split("!"), P = this.periods()[sn]; if (!P) return null; const A = ME.splitAddr(a);
    let best = null; for (const h of P.hdrRows) if (h.r < A.r && h.cols.has(A.c) && (!best || h.r > best.r)) best = h;
    return best ? best.cols.get(A.c) : null;
  };
  const FACT = /(actual|outstanding|cash and|term loan|senior notes|convertible notes|principal|share price|conversion|cap price|sale price condition|fair value|proceeds|prepayment|\bFY ?20(1\d|2[0-5])\b|\b20(1\d|2[0-5])\b|Atotech)/i;
  const ASSUME_NOTE = /^(KEY )?ASSUMPTION|^ILLUSTRATIVE/i;
  const FWD = /guid|assum|growth|margin|\brate\b|ramp|retention|illustrative|stand-in|attach|content|q\/q|y\/y|% ?change/i;

  // aggregation formula = only same-row refs (e.g. annual SUM of the quarters)
  M._isAgg = function (k) {
    const c = this.cells.get(k); if (!c || !c.f) return false; const [sn, a] = k.split("!"), r = ME.splitAddr(a).r;
    const pr = this.prec.get(k); if (!pr || !pr.size) return false;
    for (const x of pr) { const [s2, a2] = x.split("!"); if (s2 !== sn || ME.splitAddr(a2).r !== r) return false; }
    return /SUM|AVERAGE|\+/i.test(c.f);
  };
  // classify the numeric cells of a row: returns Map(col -> 'actual'|'forecast') for typed cells, or null if no clean pattern
  M._rowPattern = function (sn, r) {
    this._rp = this._rp || new Map(); const id = sn + "|" + r; if (this._rp.has(id)) return this._rp.get(id);
    const bd = this.bounds[sn], seq = [];
    for (let c = bd.c0; c <= bd.c1; c++) {
      const k = ME.key(sn, ME.numToCol(c) + r), x = this.cells.get(k); if (!x) continue;
      if (x.f) { if (!this._isAgg(k)) seq.push([c, "F"]); }
      else if (typeof x.v === "number") seq.push([c, "T"]);
    }
    let res = null;
    if (seq.length >= 4) {
      const T = seq.filter(x => x[1] === "T").map(x => x[0]), F = seq.filter(x => x[1] === "F").map(x => x[0]);
      if (T.length && F.length) {
        // typed history then formula forecast: everything after the last typed cell is a formula (>=3), and most cells before it are typed
        const iT = seq.map(x => x[1]).lastIndexOf("T"), after = seq.slice(iT + 1), before = seq.slice(0, iT + 1);
        if (after.length >= 3 && before.filter(x => x[1] === "T").length >= 0.6 * before.length) res = { kind: "actual", lastT: seq[iT][0] };
        // formula history then typed forecast: everything from the first typed cell on is typed (>=3), and most cells before it are formulas
        const iF = seq.map(x => x[1]).lastIndexOf("F"), tail = seq.slice(iF + 1), head = seq.slice(0, iF + 1);
        if (!res && tail.length >= 3 && head.filter(x => x[1] === "F").length >= 0.6 * head.length) res = { kind: "forecast", firstT: tail[0][0] };
      }
    }
    this._rp.set(id, res); return res;
  };
  // sheet boundary = the most common last-actual period among clean line-item rows
  M._sheetBoundary = function (sn) {
    this._sb = this._sb || {}; if (sn in this._sb) return this._sb[sn];
    const bd = this.bounds[sn], votes = new Map();
    if (bd) for (let r = bd.r0; r <= bd.r1; r++) {
      const p = this._rowPattern(sn, r); if (!p || p.kind !== "actual") continue;
      const per = this.periodOf(ME.key(sn, ME.numToCol(p.lastT) + r)); if (!per) continue;
      votes.set(per.end, (votes.get(per.end) || 0) + 1);
    }
    let best = null, n = 0; for (const [e, v] of votes) if (v > n || (v === n && e > best)) { best = e; n = v; }
    return (this._sb[sn] = n >= 3 ? best : null);
  };
  M._sheetBoundaryCol = function (sn) {
    this._sbc = this._sbc || {}; if (sn in this._sbc) return this._sbc[sn];
    const bd = this.bounds[sn], votes = new Map();
    if (bd) for (let r = bd.r0; r <= bd.r1; r++) { const p = this._rowPattern(sn, r); if (p && p.kind === "actual") votes.set(p.lastT, (votes.get(p.lastT) || 0) + 1); }
    let best = null, n = 0; for (const [c, v] of votes) if (v > n || (v === n && c > best)) { best = c; n = v; }
    return (this._sbc[sn] = n >= 5 ? best : null);
  };
  M._isSeries = function (sn, r) { const bd = this.bounds[sn]; let n = 0; for (let c = bd.c0; c <= bd.c1; c++) { const x = this.cells.get(ME.key(sn, ME.numToCol(c) + r)); if (x && typeof x.v === "number") if (++n >= 4) return true; } return false; };
  M.wbBoundary = function () {
    if (this._wbb !== undefined) return this._wbb;
    const votes = new Map();
    for (const sn of this.sheets) { const bd = this.bounds[sn]; if (!bd) continue;
      for (let r = bd.r0; r <= bd.r1; r++) { const p = this._rowPattern(sn, r); if (!p || p.kind !== "actual") continue;
        const per = this.periodOf(ME.key(sn, ME.numToCol(p.lastT) + r)); if (per && (per.kind === "q" || per.kind === "m")) votes.set(per.end, (votes.get(per.end) || 0) + 1); } }
    let best = null, n = 0; for (const [e, v] of votes) if (v > n || (v === n && e > best)) { best = e; n = v; }
    return (this._wbb = n >= 3 ? best : null);
  };
  /* 'forecast' | 'actual' | 'fact' */
  M.inputKind = function (k) {
    const c = this.cells.get(k); if (!c) return "fact";
    const [sn, a] = k.split("!"), A = ME.splitAddr(a), p = this.periodOf(k);
    if (p && p.flag === "E") return "forecast";
    if (p && p.flag === "A") return "actual";
    if (p) { const b = this.wbBoundary() || this.periods()[sn].boundary; return p.end > b ? "forecast" : "actual"; }
    const bc = this._sheetBoundaryCol(sn);
    const rp = this._rowPattern(sn, A.r);
    if (bc && (rp || this._isSeries(sn, A.r))) return A.c > bc ? "forecast" : "actual";
    if (rp) return rp.kind;
    const lab = this.rowLabel(k) + " " + this.colHeader(k), note = this.note(k);
    if (ASSUME_NOTE.test(note)) return "forecast";
    const yrs = [...lab.matchAll(/\b(?:FY|CY)?\s?'?(20\d{2}|\d{2})\s?E\b|\b(?:FY|CY)\s?(20\d{2})\b|\b(20\d{2})\b/gi)].map(m => +(m[1] || m[2] || m[3]) < 100 ? 2000 + +(m[1] || m[2] || m[3]) : +(m[1] || m[2] || m[3]));
    const bnd = this.wbBoundary() || this.periods()[sn].boundary, firstOpenYear = Math.floor(bnd / 100) + (bnd % 100 === 12 ? 1 : 0);
    if (FACT.test(lab) && !/\d\s?E\b/.test(lab)) return "fact";
    if (/\d\s?E\b/.test(lab) || (yrs.length && Math.max(...yrs) >= firstOpenYear && !/actual|reported/i.test(lab))) return "forecast";
    return FWD.test(lab + " " + note) ? "forecast" : "fact";
  };
  /* a readable name for an assumption row, following what it drives when the row label is generic */
  const WEAK = /^(--?|—|x|n\/a|q\/q( change)?|y\/y( change)?|yoy|qoq|growth|% ?(change|growth)?|change|y\/y %|q\/q %)$/i;
  const GENERIC = /^(total|revenue|revenues|sales|net sales|net revenue|subtotal|gross profit|gross margin)$/i;
  M.sectionOf = function (k) {
    const [sn, a] = k.split("!"), A = ME.splitAddr(a), bd = this.bounds[sn];
    for (let r = A.r - 1; r >= Math.max(bd.r0, A.r - 25); r--) {
      let txt = null, nums = 0;
      for (let c = bd.c0; c <= Math.min(bd.c1, bd.c0 + 60); c++) { const x = this.cells.get(ME.key(sn, ME.numToCol(c) + r)); if (!x) continue;
        if (typeof x.v === "number") nums++; else if (typeof x.v === "string" && /[A-Za-z]/.test(x.v) && !txt) txt = x.v.trim(); }
      if (txt && nums === 0 && !GENERIC.test(txt) && !WEAK.test(txt) && !/dollars in|in (millions|thousands)|^\(?\$|unaudited|except per share/i.test(txt)) return txt;
    }
    return "";
  };
  M.niceLabel = function (k) {
    const l = this.rowLabel(k); if (!l) return l;
    if (GENERIC.test(l.trim())) { const s = this.sectionOf(k); if (s) return s + " · " + l; }
    if (!/\b(our|ours)\b|consensus/i.test(l)) { const s = this.sectionOf(k); if (s && /consensus|capital iq|bloomberg|factset|street|broker/i.test(s)) return "Consensus (" + s.replace(/^consensus,?\s*/i, "").replace(/\(.*?\)/g, "").trim() + ") · " + l; }
    return l;
  };
  M.assumptionName = function (k) {
    const own = this.niceLabel(k);
    if (own && !WEAK.test(own.trim()) && own.trim().length > 2) return own;
    const deps = [...(this.dep.get(k) || [])];
    for (const d of deps) { const l = this.niceLabel(d); if (l && !WEAK.test(l.trim())) return (own && !/^-+$/.test(own.trim()) ? own.trim() + ", " : "") + "driver of " + l; }
    return own || k;
  };
  ME.parsePeriod = parsePeriod;
})();

/* ---------- what the forecast assumes: typed rows, constants inside formulas, implied annual metrics ---------- */
(function () {
  "use strict";
  const ME = window.ModelEngine, M = ME.Model.prototype;
  const TRIVIAL = new Set([0, 1, -1, 2, 3, 4, 12, 52, 100, 1000, 1e6, 365, 360]);

  M.isForecastCol = function (k) {
    const p = this.periodOf(k); if (!p) return null;
    if (p.flag === "E") return true; if (p.flag === "A") return false;
    const b = this.wbBoundary() || this.periods()[k.split("!")[0]].boundary; return p.end > b;
  };

  /* typed forecast inputs grouped by row */
  M.forecastRows = function () {
    const rows = new Map();
    for (const k of this.cells.keys()) {
      if (!this.isInput(k) || !this.dep.has(k) || this.isHeaderCell(k) || this.inputKind(k) !== "forecast") continue;
      const [sn, a] = k.split("!"), r = ME.splitAddr(a).r, id = sn + "!" + r;
      if (!rows.has(id)) rows.set(id, { id, sheet: sn, row: r, cells: [] });
      rows.get(id).cells.push(k);
    }
    for (const g of rows.values()) g.cells.sort((x, y) => ME.splitAddr(x.split("!")[1]).c - ME.splitAddr(y.split("!")[1]).c);
    return [...rows.values()];
  };

  /* numbers written straight into forecast formulas */
  M.formulaConstants = function () {
    const groups = new Map();
    const walk = (n, out, skip) => {
      if (!n) return;
      if (n.k === "num") { if (!skip && !TRIVIAL.has(n.v)) out.push(n.v); return; }
      if (n.k === "neg") { if (n.e.k === "num") { if (!TRIVIAL.has(-n.e.v)) out.push(-n.e.v); return; } return walk(n.e, out); }
      if (n.k === "pct") return walk(n.e, out);
      if (n.k === "bin") { walk(n.l, out); walk(n.r, out); return; }
      if (n.k === "fn") n.args.forEach((a, i) => walk(a, out, (/^(ROUND|ROUNDUP|ROUNDDOWN|TEXT)$/.test(n.n) && i === 1) || n.n === "INDEX" || n.n === "OFFSET"));
    };
    for (const [k, ast] of this.ast) {
      if (this.isForecastCol(k) !== true) continue;
      const vals = []; walk(ast, vals); if (!vals.length) continue;
      const [sn, a] = k.split("!"), r = ME.splitAddr(a).r;
      for (const v of vals) {
        const id = sn + "!" + r + "|" + v;
        if (!groups.has(id)) groups.set(id, { sheet: sn, row: r, value: v, cells: [] });
        groups.get(id).cells.push(k);
      }
    }
    return [...groups.values()];
  };

  /* implied annual metrics from the statement rows */
  const PAT = {
    revenue: /^(total )?(net )?(revenue|revenues|sales|net sales)( \(.*\))?$/i,
    gp: /^gross profit/i, gm: /^gross margin/i,
    ebitda: /^(adj(usted)?\.?\s*)?EBITDA(\s*\((adjusted|non-gaap)\))?$/i,
    op: /^(adj(usted)?\.?\s*)?(operating income|EBIT)\b/i,
    eps: /(EPS|earnings per share)/i,
  };
  M.impliedMetrics = function () {
    let best = null;
    for (const sn of this.sheets) {
      const P = this.periods()[sn]; if (!P) continue;
      const yh = P.hdrRows.find(h => [...h.cols.values()].filter(p => p.kind === "y").length >= 3); if (!yh) continue;
      const ycols = [...yh.cols.entries()].filter(([c, p]) => p.kind === "y").sort((a, b) => a[1].end - b[1].end);
      const bd = this.bounds[sn], found = {};
      for (let r = yh.r + 1; r <= bd.r1; r++) {
        const lab = this.rowLabel(ME.key(sn, ME.numToCol(ycols[0][0]) + r)); if (!lab) continue;
        for (const [m, re] of Object.entries(PAT)) {
          if (!re.test(lab.trim())) continue;
          if (m === "eps") { const pref = /(adj|operating|non-gaap|pro.?forma)/i.test(lab); if (found.eps && !(pref && !found.epsPref)) continue; found.epsPref = pref; }
          else if (found[m]) continue;
          found[m] = { r, label: lab.trim() };
        }
      }
      if (found.revenue && (!best || Object.keys(found).length > Object.keys(best.found).length)) best = { sn, ycols, found };
    }
    if (!best) return null;
    const b = this.wbBoundary() || this.periods()[best.sn].boundary, lastActualYear = Math.floor(b / 100) - (b % 100 === 12 ? 0 : 1);
    const years = best.ycols.filter(([c, p]) => Math.floor(p.end / 100) >= lastActualYear).slice(0, 4);
    const val = (m, c) => { const f = best.found[m]; if (!f) return null; const v = this.safeValue(ME.key(best.sn, ME.numToCol(c) + f.r)); return typeof v === "number" ? v : null; };
    const rows = [];
    const series = m => years.map(([c]) => val(m, c));
    const growth = arr => arr.map((v, i) => i === 0 || v === null || arr[i - 1] === null || !arr[i - 1] ? null : v / arr[i - 1] - 1);
    const rev = series("revenue");
    rows.push({ key: "rev", name: "Revenue", values: rev, kind: "money" });
    rows.push({ key: "revg", name: "Revenue growth y/y", values: growth(rev), kind: "pct" });
    const gmS = best.found.gm ? series("gm") : null, gmIsMoney = gmS && gmS.some(v => v !== null && Math.abs(v) > 1.5);
    if (best.found.gp || gmIsMoney) rows.push({ key: "gm", name: "Gross margin (implied)", values: series(best.found.gp ? "gp" : "gm").map((v, i) => v === null || !rev[i] ? null : v / rev[i]), kind: "pct" });
    else if (gmS) rows.push({ key: "gm", name: "Gross margin", values: gmS, kind: "pct" });
    if (best.found.ebitda) { const e = series("ebitda"); rows.push({ key: "ebitda", name: "EBITDA", values: e, kind: "money" }); rows.push({ key: "ebm", name: "EBITDA margin (implied)", values: e.map((v, i) => v === null || !rev[i] ? null : v / rev[i]), kind: "pct" }); rows.push({ key: "ebg", name: "EBITDA growth y/y", values: growth(e), kind: "pct" }); }
    if (best.found.eps) { const e = series("eps"); rows.push({ key: "eps", name: "EPS (" + best.found.eps.label + ")", values: e, kind: "eps" }); rows.push({ key: "epsg", name: "EPS growth y/y", values: growth(e), kind: "pct" }); }
    return { sheet: best.sn, years: years.map(([c, p]) => ({ label: p.label, year: Math.floor(p.end / 100), forecast: Math.floor(p.end / 100) > lastActualYear })), rows };
  };
})();

/* ---------- levers: switches, thesis tags, "ours vs consensus" pairs ---------- */
(function () {
  "use strict";
  const ME = window.ModelEngine, M = ME.Model.prototype;

  /* a switch is an integer input whose label lists its options, e.g. "(0 = none, 1 = E&P chemistry, 2 = all)" */
  M.switchInfo = function (k) {
    this._sw = this._sw || new Map(); if (this._sw.has(k)) return this._sw.get(k);
    let res = null; const c = this.cells.get(k);
    if (c && !c.f && typeof c.v === "number" && Number.isInteger(c.v) && c.v >= 0 && c.v <= 9) {
      const lab = this.rowLabel(k) + " " + this.note(k);
      const m = /\(([^()]*\b\d\s*=\s*[^()]*)\)/.exec(lab);
      if (m) {
        const opts = [];
        for (const part of m[1].split(/[,;]/)) { const mm = /^\s*(\d)\s*=\s*(.+?)\s*$/.exec(part); if (mm) opts.push({ v: +mm[1], text: mm[2] }); }
        if (opts.length >= 2 && opts.some(o => o.v === c.v)) res = { k, name: this.rowLabel(k).replace(m[0], "").trim(), options: opts.sort((a, b) => a.v - b.v), current: c.v };
      }
    }
    this._sw.set(k, res); return res;
  };
  M.switchesFor = function (outKey) { return this.inputsOf(outKey).inputs.map(k => this.switchInfo(k)).filter(Boolean); };

  /* which thesis an input belongs to: from its own label, else from the section heading above it */
  M.thesisOf = function (k) {
    const nums = s => [...String(s).matchAll(/thesis\s*(\d+)/gi)].map(x => +x[1]);
    const own = nums(this.rowLabel(k)); if (own.length) return [...new Set(own)];
    const [sn, a] = k.split("!"), A = ME.splitAddr(a), bd = this.bounds[sn];
    for (let r = A.r - 1; r >= Math.max(bd.r0, A.r - 40); r--) {
      let txt = null, n = 0;
      for (let c = bd.c0; c <= Math.min(bd.c1, bd.c0 + 30); c++) { const x = this.cells.get(ME.key(sn, ME.numToCol(c) + r)); if (!x) continue; if (typeof x.v === "number") n++; else if (typeof x.v === "string" && /[A-Za-z]/.test(x.v) && !txt) txt = x.v; }
      if (txt && n === 0) { const t = nums(txt); return [...new Set(t)]; }
    }
    return [];
  };

  /* "ours" input -> the consensus figure for the same thing, matched on the label */
  const norm = s => String(s).toLowerCase().replace(/\(thesis[^)]*\)|thesis\s*\d+/g, " ").replace(/consensus-implied|consensus|implied|street|\bours\b|\bour\b|\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
  M.consensusPair = function (k) {
    this._cp = this._cp || new Map(); if (this._cp.has(k)) return this._cp.get(k);
    let res = null; const lab = this.rowLabel(k);
    if (/\bours?\b|our view|thesis/i.test(lab) && !/consensus/i.test(lab)) {
      const want = norm(lab), [sn, a] = k.split("!"), col = a.replace(/\d+/g, "");
      if (want) for (const [kk, c] of this.cells) {
        if (kk === k || !kk.startsWith(sn + "!") || kk.split("!")[1].replace(/\d+/g, "") !== col) continue;
        const l2 = this.rowLabel(kk); if (!/consensus|street/i.test(l2)) continue;
        const v = c.f ? this.safeValue(kk) : c.v; if (typeof v !== "number") continue;
        if (norm(l2) === want) { res = kk; break; }
      }
    }
    this._cp.set(k, res); return res;
  };
})();
