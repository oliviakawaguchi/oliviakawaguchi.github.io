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
    for (let col = A.c - 1; col >= 1; col--) { const x = this.cells.get(key(c.sheet, numToCol(col) + A.r)); if (x && typeof x.v === "string" && x.v.trim() && !x.f) return x.v.trim(); }
    return "";
  };
  Model.prototype.colHeader = function (k) {
    const c = this.cells.get(k); if (!c) return ""; const A = splitAddr(c.addr);
    for (let r = A.r - 1; r >= Math.max(1, A.r - 40); r--) {
      const x = this.cells.get(key(c.sheet, numToCol(A.c) + r)); if (!x) continue;
      if ((typeof x.v === "string" && x.v.trim()) || (typeof x.v === "number" && x.v >= 1990 && x.v <= 2100 && !x.f)) return String(x.v).trim();
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
