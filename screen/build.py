#!/usr/bin/env python3
"""Live version of the Alpha Challenge screen.

Universe: the 697 companies that came out of the original funnel's data build.
Every trading day it re-ranks them on two things:

  1. Change: how unusual the latest year-on-year move in each operating metric
     is against the company's own prior twelve, using median and MAD
     (the original stage-5 method). Direction is recorded, never scored.
  2. Price: EV/EBITDA (trailing twelve months) against the median of
     same-industry peers in the universe. This is the part that moves daily.

Rank = average of the two percentile ranks, among names with a material
change and a computable EV/EBITDA. The +30% hurdle from the original funnel
is not used: it needed paid consensus estimates.

Sources: SEC XBRL company facts (data.sec.gov) and Yahoo Finance daily closes.
Backfilled days only use filings that had been filed by that day.

  python3 build.py init      # first run: all facts, a year of prices, 60-day backfill
  python3 build.py daily     # refresh prices, refetch facts for new filers, add today
Standard library only.
"""
import csv, gzip, io, json, math, os, statistics, sys, time, urllib.request, urllib.error
from datetime import date, datetime, timedelta

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
FACTS = os.path.join(DATA, "facts")
UA = os.environ.get("SEC_UA", "Olivia Kawaguchi rk5407@stern.nyu.edu")
BACKFILL_DAYS = 60

# ---------------------------------------------------------------- tags
FLOW = {
    "rev": ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet",
            "RevenueFromContractWithCustomerIncludingAssessedTax", "SalesRevenueGoodsNet"],
    "gp": ["GrossProfit"],
    "cogs": ["CostOfGoodsAndServicesSold", "CostOfRevenue", "CostOfGoodsSold"],
    "oi": ["OperatingIncomeLoss"],
    "da": ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization",
           "DepreciationAmortizationAndAccretionNet", "DepreciationAmortizationAndOther"],
    "dep": ["Depreciation"], "amort": ["AmortizationOfIntangibleAssets"],
    "int": ["InterestExpense", "InterestExpenseNonoperating", "InterestExpenseDebt", "InterestPaidNet"],
}
STOCK = {
    "inv": ["InventoryNet"],
    "ca": ["ContractWithCustomerAssetNetCurrent"],
    "assets": ["Assets"],
    "cash": ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
    "ltd": ["LongTermDebt"], "ltdn": ["LongTermDebtNoncurrent"], "ltdc": ["LongTermDebtCurrent"],
    "stb": ["ShortTermBorrowings"], "debtc": ["DebtCurrent"],
    "conv": ["ConvertibleNotesPayable", "ConvertibleDebtNoncurrent", "ConvertibleLongTermNotesPayable"],
    "tot": ["DebtLongtermAndShorttermCombinedAmount", "LongTermDebtAndCapitalLeaseObligationsIncludingCurrentMaturities", "DebtAndCapitalLeaseObligations"],
    "ltdl": ["LongTermDebtAndCapitalLeaseObligations"], "ltdlc": ["LongTermDebtAndCapitalLeaseObligationsCurrent"],
    "notes": ["SeniorNotes", "LongTermNotesPayable", "NotesPayable", "UnsecuredDebt", "SecuredDebt"],
    "notesc": ["NotesPayableCurrent", "LinesOfCreditCurrent", "CommercialPaper", "SecuredDebtCurrent"],
    "convc": ["ConvertibleNotesPayableCurrent", "ConvertibleDebtCurrent"],
    "lbt": ["LongTermLineOfCredit", "LineOfCredit"],
}
SHARES_DEI = "EntityCommonStockSharesOutstanding"
SHARES_GAAP = ["WeightedAverageNumberOfDilutedSharesOutstanding", "CommonStockSharesOutstanding"]
KEEP_FROM = "2019-01-01"

# ---------------------------------------------------------------- http
_last = [0.0]
def get(url, sec=True, tries=4):
    for i in range(tries):
        wait = 0.13 - (time.time() - _last[0])
        if wait > 0: time.sleep(wait)
        _last[0] = time.time()
        req = urllib.request.Request(url, headers={"User-Agent": UA if sec else "Mozilla/5.0", "Accept-Encoding": "gzip"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read()
                if r.headers.get("Content-Encoding") == "gzip": b = gzip.decompress(b)
                return b
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            time.sleep(2 * (i + 1))
        except Exception:
            time.sleep(2 * (i + 1))
    return None

def universe():
    with open(os.path.join(ROOT, "universe.csv")) as f:
        return list(csv.DictReader(f))

# ---------------------------------------------------------------- facts
def compact_facts(raw):
    """keep only the tags we use, 10-K/10-Q family, from KEEP_FROM on: [start, end, val, filed]"""
    out = {}
    g = (raw.get("facts") or {}).get("us-gaap", {})
    wanted = set(sum(FLOW.values(), []) + sum(STOCK.values(), []) + SHARES_GAAP)
    for tag in wanted:
        if tag not in g: continue
        rows = []
        for unit, arr in g[tag]["units"].items():
            if unit not in ("USD", "shares"): continue
            for x in arr:
                if not str(x.get("form", "")).startswith(("10-K", "10-Q")): continue
                if x["end"] < KEEP_FROM: continue
                rows.append([x.get("start"), x["end"], x["val"], x["filed"]])
        if rows: out[tag] = rows
    d = (raw.get("facts") or {}).get("dei", {}).get(SHARES_DEI)
    if d:
        out[SHARES_DEI] = [[None, x["end"], x["val"], x["filed"]] for x in d["units"].get("shares", []) if x["end"] >= KEEP_FROM]
    return out

def fetch_facts(cik):
    b = get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{int(cik):010d}.json")
    if not b: return None
    return compact_facts(json.loads(b))

def load_facts(cik):
    p = os.path.join(FACTS, f"{int(cik)}.json")
    if not os.path.exists(p): return None
    with open(p) as f: return json.load(f)

def save_facts(cik, facts):
    with open(os.path.join(FACTS, f"{int(cik)}.json"), "w") as f: json.dump(facts, f, separators=(",", ":"))

# ---------------------------------------------------------------- series
D = lambda s: datetime.strptime(s, "%Y-%m-%d").date()

def latest_by(rows, keyf, asof):
    best = {}
    for r in rows:
        if r[3] > asof: continue
        k = keyf(r)
        if k not in best or r[3] >= best[k][3]: best[k] = r
    return best

def quarterly(facts, tags, asof):
    """quarterly flow values keyed by period end, derived from 3-month, year-to-date and annual facts"""
    for tag in tags:
        rows = [r for r in facts.get(tag, []) if r[0]]
        if not rows: continue
        by = latest_by(rows, lambda r: (r[0], r[1]), asof)
        q, ytd = {}, {}
        for (s, e), r in by.items():
            days = (D(e) - D(s)).days
            if 80 <= days <= 100: q[e] = r[2]
            ytd.setdefault(s, []).append((e, r[2], days))
        for s, arr in ytd.items():
            arr.sort()
            for i in range(1, len(arr)):
                (e0, v0, d0), (e1, v1, d1) = arr[i - 1], arr[i]
                if e1 not in q and 80 <= (D(e1) - D(e0)).days <= 100: q[e1] = v1 - v0
            for e1, v1, d1 in arr:
                if e1 in q or not (350 <= d1 <= 380): continue
                prior = [v for e, v in q.items() if D(s) < D(e) < D(e1)]
                if len(prior) == 3: q[e1] = v1 - sum(prior)
        if q: return q
    return {}

def instant(facts, tags, asof):
    for tag in tags:
        rows = facts.get(tag, [])
        if not rows: continue
        by = latest_by(rows, lambda r: r[1], asof)
        if by: return {e: r[2] for e, r in by.items()}
    return {}

def ttm(q):
    ends = sorted(q); out = {}
    for i in range(3, len(ends)):
        w = ends[i - 3:i + 1]
        if all(80 <= (D(w[j + 1]) - D(w[j])).days <= 100 for j in range(3)): out[ends[i]] = sum(q[e] for e in w)
    return out

def near(series, end, tol=20):
    if end in series: return series[end]
    for e, v in series.items():
        if abs((D(e) - D(end)).days) <= tol: return v
    return None

# ---------------------------------------------------------------- change detection
METRICS = [  # name, economic threshold on the year-on-year move, MAD floor
    ("Revenue growth", 0.05, 0.02), ("Operating margin", 0.01, 0.005), ("Gross margin", 0.01, 0.005),
    ("Inventory / revenue", 0.02, 0.01), ("Contract assets / revenue", 0.02, 0.01), ("Asset turnover", 0.05, 0.02),
]

def metric_series(f, asof):
    rev = ttm(quarterly(f, FLOW["rev"], asof))
    if len(rev) < 5: return {}, rev
    oi = ttm(quarterly(f, FLOW["oi"], asof))
    gp = ttm(quarterly(f, FLOW["gp"], asof))
    if not gp:
        cg = ttm(quarterly(f, FLOW["cogs"], asof)); gp = {e: rev[e] - v for e, v in cg.items() if e in rev}
    inv, ca, assets = instant(f, STOCK["inv"], asof), instant(f, STOCK["ca"], asof), instant(f, STOCK["assets"], asof)
    ends = sorted(rev); m = {k[0]: {} for k in METRICS}
    for i, e in enumerate(ends):
        r = rev[e]
        if not r or r <= 0: continue
        prev = near(rev, (D(e) - timedelta(days=365)).isoformat())
        if prev and prev > 0: m["Revenue growth"][e] = r / prev - 1
        if e in oi: m["Operating margin"][e] = oi[e] / r
        if e in gp: m["Gross margin"][e] = gp[e] / r
        v = near(inv, e, 5);
        if v is not None: m["Inventory / revenue"][e] = v / r
        v = near(ca, e, 5)
        if v is not None: m["Contract assets / revenue"][e] = v / r
        v = near(assets, e, 5)
        if v: m["Asset turnover"][e] = r / v
    return m, rev

def change(f, asof):
    m, rev = metric_series(f, asof)
    if not m: return None
    found, last_end = [], max(rev)
    for name, econ, floor in METRICS:
        s = m[name]; ends = sorted(s)
        moves = []
        for e in ends:
            p = near(s, (D(e) - timedelta(days=365)).isoformat())
            if p is not None: moves.append((e, s[e] - p))
        if len(moves) < 9 or moves[-1][0] != last_end: continue
        latest, prior = moves[-1][1], [d for _, d in moves[-13:-1]]
        med = statistics.median(prior); mad = statistics.median([abs(d - med) for d in prior])
        z = (latest - med) / max(1.4826 * mad, floor)
        if abs(z) >= 2 and abs(latest) >= econ:
            found.append({"metric": name, "z": round(z, 2), "move": round(latest, 4), "now": round(s[last_end], 4), "oneoff": abs(z) >= 10})
    score = sum(min(abs(x["z"]), 5) for x in found)
    return {"score": round(score, 2), "moves": sorted(found, key=lambda x: -abs(x["z"])), "period_end": last_end, "ttm_revenue": rev[last_end], "oneoff": any(x["oneoff"] for x in found)}

# ---------------------------------------------------------------- valuation
def latest_val(series, asof_end=None):
    if not series: return None, None
    e = max(series); return e, series[e]

def valuation(f, asof, price):
    if not price: return None
    sh = instant(f, [SHARES_DEI], asof) or instant(f, SHARES_GAAP, asof)
    if not sh:
        q = quarterly(f, ["WeightedAverageNumberOfDilutedSharesOutstanding"], asof); sh = q
    _, shares = latest_val(sh)
    oi = ttm(quarterly(f, FLOW["oi"], asof))
    da = ttm(quarterly(f, FLOW["da"], asof))
    if not da:
        dep, am = ttm(quarterly(f, FLOW["dep"], asof)), ttm(quarterly(f, FLOW["amort"], asof))
        da = {e: v + am.get(e, 0) for e, v in dep.items()}
    if not oi or not shares: return None
    e = max(oi); d = da.get(e) if da else None
    if d is None: return None
    ebitda = oi[e] + d
    st = {k: instant(f, v, asof) for k, v in STOCK.items()}
    bal_end = max(st["assets"]) if st["assets"] else e
    g = lambda k: near(st[k], bal_end, 5) or 0
    debt = max(g("ltd") + g("stb"), g("ltdn") + g("ltdc") + g("stb"), g("ltdn") + g("debtc"), g("ltdl") + g("ltdlc") + g("stb"),
               g("conv") + g("convc") + g("notes") + g("notesc") + g("lbt") + g("stb"), g("tot"))
    # a company that pays real interest but shows no debt has it tagged somewhere we don't read: don't call it cheap
    it = ttm(quarterly(f, FLOW["int"], asof)); interest = it.get(max(it)) if it else 0
    rev = ttm(quarterly(f, FLOW["rev"], asof)); r = rev.get(max(rev)) if rev else 0
    if debt <= 0 and interest and r and interest > 0.003 * r: return {"debt_missing": True}
    if ebitda <= 0 or (r and ebitda > 0.6 * r): return {"ebitda_suspect": True}
    cash = g("cash")
    mcap = price * shares; ev = mcap + debt - cash
    return {"mcap": mcap, "ev": ev, "ebitda": ebitda, "ev_ebitda": ev / ebitda if ebitda > 0 else None, "debt": debt, "cash": cash, "shares": shares}

# ---------------------------------------------------------------- prices
def yahoo(sym, rng="1y"):
    s = sym.replace(".", "-")
    b = get(f"https://query1.finance.yahoo.com/v8/finance/chart/{s}?range={rng}&interval=1d", sec=False)
    if not b: return {}
    try:
        r = json.loads(b)["chart"]["result"][0]; ts = r["timestamp"]; cl = r["indicators"]["quote"][0]["close"]
        return {datetime.utcfromtimestamp(t).date().isoformat(): round(c, 4) for t, c in zip(ts, cl) if c is not None}
    except Exception:
        return {}

def price_on(series, day):
    ks = [k for k in series if k <= day]
    return series[max(ks)] if ks else None

# ---------------------------------------------------------------- ranking
def pct_rank(vals):
    order = sorted(vals, key=lambda kv: kv[1]); n = len(order)
    return {k: (i + 0.5) / n for i, (k, v) in enumerate(order)}

def rank_day(uni, facts, prices, day):
    rows = []
    for u in uni:
        f = facts.get(u["cik"])
        if not f: continue
        ch = change(f, day)
        px = price_on(prices.get(u["symbol"], {}), day)
        va = valuation(f, day, px)
        rows.append({"u": u, "ch": ch, "va": va, "px": px})
    # peer medians: SIC 3-digit, then 2-digit, then bucket
    groups = {}
    for r in rows:
        v = r["va"]
        if v and v.get("ev_ebitda") and 1 < v["ev_ebitda"] < 200:
            for key in ("s3:" + r["u"]["sic"][:3], "s2:" + r["u"]["sic"][:2], "b:" + r["u"]["bucket"]):
                groups.setdefault(key, []).append(v["ev_ebitda"])
    for r in rows:
        r["peer"] = None
        for key in ("s3:" + r["u"]["sic"][:3], "s2:" + r["u"]["sic"][:2], "b:" + r["u"]["bucket"]):
            if len(groups.get(key, [])) >= 5:
                r["peer"] = {"group": key, "n": len(groups[key]), "median": statistics.median(groups[key])}; break
        v = r["va"]
        r["disc"] = (1 - v["ev_ebitda"] / r["peer"]["median"]) if (v and v.get("ev_ebitda") and 1 < v["ev_ebitda"] < 200 and r["peer"]) else None
    def oneoff(r): return any(m["oneoff"] and m["metric"] in ("Operating margin", "Gross margin") for m in r["ch"]["moves"])
    flagged = [r for r in rows if r["ch"] and r["ch"]["score"] > 0 and oneoff(r)]
    eligible = [r for r in rows if r["ch"] and r["ch"]["score"] > 0 and r["disc"] is not None and not oneoff(r)]
    pc = pct_rank([(r["u"]["symbol"], r["ch"]["score"]) for r in eligible])
    pv = pct_rank([(r["u"]["symbol"], r["disc"]) for r in eligible])
    for r in eligible: r["score"] = 0.5 * pc[r["u"]["symbol"]] + 0.5 * pv[r["u"]["symbol"]]
    eligible.sort(key=lambda r: -r["score"])
    stats = {"universe": len(uni), "measurable": sum(1 for r in rows if r["ch"] is not None),
             "changed": sum(1 for r in rows if r["ch"] and r["ch"]["score"] > 0),
             "priced": sum(1 for r in rows if r["disc"] is not None), "flagged": len(flagged), "ranked": len(eligible)}
    stats["flagged_list"] = [{"symbol": r["u"]["symbol"], "name": r["u"]["name"], "metric": next(m["metric"] for m in r["ch"]["moves"] if m["oneoff"]), "z": next(m["z"] for m in r["ch"]["moves"] if m["oneoff"])} for r in flagged]
    return eligible, stats

def last_filed(f, day):
    best = None
    for tag in FLOW["rev"]:
        for r in f.get(tag, []):
            if r[3] <= day and (best is None or r[3] > best): best = r[3]
    return best

def detail(r, day, facts, prices, prev_rank):
    u, v = r["u"], r["va"]; s = prices.get(u["symbol"], {})
    days = sorted(k for k in s if k <= day)
    p1 = s[days[-2]] if len(days) >= 2 else None
    return {"symbol": u["symbol"], "name": u["name"], "sic": u["sic"], "industry": u["sic_desc"],
            "score": round(r["score"], 4), "prev_rank": prev_rank,
            "change": r["ch"], "price": r["px"], "price_1d": round(r["px"] / p1 - 1, 4) if p1 else None,
            "mcap_mm": round(v["mcap"] / 1e6, 1), "ev_mm": round(v["ev"] / 1e6, 1), "ebitda_mm": round(v["ebitda"] / 1e6, 1),
            "ev_ebitda": round(v["ev_ebitda"], 2), "peer_median": round(r["peer"]["median"], 2), "peer_group": r["peer"]["group"], "peer_n": r["peer"]["n"],
            "discount": round(r["disc"], 4), "last_filed": last_filed(facts[u["cik"]], day)}

# ---------------------------------------------------------------- driver
def trading_days(prices, n):
    ref = prices.get("SPY") or max(prices.values(), key=len)
    return sorted(ref)[-n:]

def load_json(p, d):
    try:
        with open(p) as f: return json.load(f)
    except Exception: return d

def write_outputs(uni, facts, prices, days):
    hist = load_json(os.path.join(DATA, "history.json"), {"days": [], "ranks": {}})
    for day in days:
        ranked, stats = rank_day(uni, facts, prices, day)
        hist["ranks"][day] = {r["u"]["symbol"]: i + 1 for i, r in enumerate(ranked)}
        if day not in hist["days"]: hist["days"].append(day)
        print(day, {k: v for k, v in stats.items() if k != "flagged_list"}, [r["u"]["symbol"] for r in ranked[:5]], flush=True)
    hist["days"] = sorted(hist["days"])[-BACKFILL_DAYS:]
    hist["ranks"] = {d: hist["ranks"][d] for d in hist["days"]}
    nm = {u["symbol"]: u["name"].replace(" Common Stock", "").replace(" Class A", "").strip() for u in uni}
    shown = {s for d in hist["days"] for s, r in hist["ranks"][d].items() if r <= 30}
    hist["names"] = {s: nm.get(s, s) for s in sorted(shown)}
    day = hist["days"][-1]; prev = hist["days"][-2] if len(hist["days"]) > 1 else None
    ranked, stats = rank_day(uni, facts, prices, day)
    top = [detail(r, day, facts, prices, (hist["ranks"].get(prev) or {}).get(r["u"]["symbol"]) if prev else None) for r in ranked[:60]]
    new_filers = sorted({u["symbol"] for u in uni if facts.get(u["cik"]) and (last_filed(facts[u["cik"]], day) or "") >= (date.fromisoformat(day) - timedelta(days=7)).isoformat()})
    latest = {"as_of": day, "generated": datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "stats": stats, "top": top, "recent_filers": new_filers}
    with open(os.path.join(DATA, "latest.json"), "w") as f: json.dump(latest, f, separators=(",", ":"))
    with open(os.path.join(DATA, "history.json"), "w") as f: json.dump(hist, f, separators=(",", ":"))

def load_prices():
    return load_json(os.path.join(DATA, "prices.json"), {})

def save_prices(p):
    cut = (date.today() - timedelta(days=400)).isoformat()
    p = {s: {d: v for d, v in ser.items() if d >= cut} for s, ser in p.items()}
    with open(os.path.join(DATA, "prices.json"), "w") as f: json.dump(p, f, separators=(",", ":"))

def init(limit=None):
    uni = universe()[:limit] if limit else universe(); os.makedirs(FACTS, exist_ok=True)
    facts = {}
    for i, u in enumerate(uni):
        f = load_facts(u["cik"])
        if f is None:
            f = fetch_facts(u["cik"]) or {}
            save_facts(u["cik"], f)
        facts[u["cik"]] = f
        if i % 50 == 0: print("facts", i, u["symbol"], flush=True)
    prices = load_prices()
    for i, s in enumerate(["SPY"] + [u["symbol"] for u in uni]):
        if s not in prices or len(prices[s]) < 100: prices[s] = yahoo(s, "1y")
        if i % 100 == 0: print("prices", i, s, len(prices[s]), flush=True)
    save_prices(prices)
    write_outputs(uni, facts, prices, trading_days(prices, BACKFILL_DAYS))

def filers_since(day0):
    """CIKs that filed a 10-K or 10-Q on each business day after day0, from EDGAR's daily form index"""
    ciks, d = set(), date.fromisoformat(day0)
    while d < date.today():
        d += timedelta(days=1)
        if d.weekday() >= 5: continue
        q = (d.month - 1) // 3 + 1
        b = get(f"https://www.sec.gov/Archives/edgar/daily-index/{d.year}/QTR{q}/form.{d:%Y%m%d}.idx")
        if not b: continue
        for line in b.decode("latin-1").splitlines():
            if line.startswith(("10-Q", "10-K")):
                parts = line.split()
                for tok in parts:
                    if tok.isdigit() and 3 <= len(tok) <= 10: ciks.add(str(int(tok))); break
    return ciks

def daily():
    uni = universe(); hist = load_json(os.path.join(DATA, "history.json"), {"days": []})
    last = hist["days"][-1] if hist["days"] else (date.today() - timedelta(days=7)).isoformat()
    filers = filers_since(last)
    facts = {}
    for u in uni:
        f = load_facts(u["cik"])
        if f is None or str(int(u["cik"])) in filers:
            f = fetch_facts(u["cik"]) or f or {}; save_facts(u["cik"], f); print("refetched", u["symbol"], flush=True)
        facts[u["cik"]] = f
    prices = load_prices()
    for s in ["SPY"] + [u["symbol"] for u in uni]:
        new = yahoo(s, "1mo")
        if new: prices.setdefault(s, {}).update(new)
    save_prices(prices)
    days = [d for d in trading_days(prices, 10) if d > last]
    if not days: print("no new trading day"); return
    write_outputs(uni, facts, prices, days)

if __name__ == "__main__":
    os.makedirs(FACTS, exist_ok=True)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "daily"
    if cmd == "init": init(int(sys.argv[2]) if len(sys.argv) > 2 else None)
    else: daily()
