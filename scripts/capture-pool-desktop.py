#!/usr/bin/env python3
"""Capture the 4-stage DESKTOP Pool Construction funnel → stages-pool-desktop.json.

Desktop deal-story order (differs from mobile's 5-stage stages-pool.json):
  0 homeowner-us : {Pool Construction + Homeowner} nationwide
  1 homeowner-fl : + Florida
  2 metros       : + Miami/Ft-Lauderdale metro ZIPs (South-FL)
  3 networth     : + Net Worth > $1,000,000

One `insights` call per stage bakes EVERYTHING each visible desktop chart needs — reach, geo
(states/counties/zips), coverage, and the full per-stage distributions (age_gender, income_range,
net_worth, homeowner, family, cities_people). Desktop shows more charts than mobile, so income +
net_worth are baked here too (mobile's stages-pool.json omits them).

Per-ZIP density (`zips`) is baked ONLY for the zip-scoped stages (2, 3) — those beats zoom to ZIP
level and need immediate shading; nationwide/FL stages stay at state/county zoom, so their zips
would bloat the file unused (mirrors capture-pool-funnel.py §5).

Run:  python3 scripts/capture-pool-desktop.py
Out:  public/builder/stages-pool-desktop.json  (repo path resolved relative to this script)
"""
import json, os, sys, time, urllib.request, urllib.error

INSIGHTS_FN = "https://audience-builder-react.netlify.app/.netlify/functions/audience"
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "public", "builder", "stages-pool-desktop.json")
US_METROS_JS = os.path.join(REPO, "public", "builder", "us-metros.js")

BASE = {
    "mode": "standard", "cls": "consumer", "timeframe": "7days",
    "topics": [{"id": 7676, "label": "Pool Construction"}],
    "pickers": {}, "texts": {}, "contactReq": {},
}

# SFL zip set = the exact metros the funnel filters on (keep in sync with embed-script.js metros STEP).
METROS = ["Miami Metro", "Fort Lauderdale Metro"]
_raw = open(US_METROS_JS).read()
_s = _raw.index("[", _raw.index("US_METROS"))
_um = json.loads(_raw[_s:_raw.rindex("]") + 1])
_by = {m["n"]: m for m in _um}
SFL_ZIPS = sorted({z for n in METROS for z in _by[n]["z"]})
print("SFL_ZIPS:", len(SFL_ZIPS), "zips from", METROS, flush=True)

STAGES = [
    ("homeowner-us", {"checks": {"homeowner": ["Homeowner"]}, "loc": {}}),
    ("homeowner-fl", {"checks": {"homeowner": ["Homeowner"]}, "loc": {"personal": {"state": ["FL"]}}}),
    ("metros",       {"checks": {"homeowner": ["Homeowner"]}, "loc": {"personal": {"state": ["FL"], "zip": SFL_ZIPS}}}),
    ("networth",     {"checks": {"homeowner": ["Homeowner"], "networth": ["more than $1,000,000"]}, "loc": {"personal": {"state": ["FL"], "zip": SFL_ZIPS}}}),
]


def call(payload, timeout=120):
    req = urllib.request.Request(INSIGHTS_FN, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode() or "{}")
        except Exception as e:
            print("  retry", attempt, str(e)[:60], flush=True)
            time.sleep(5)
    return 0, {}


stages_out = []
for name, extra in STAGES:
    spec = {**BASE, **extra}
    st, d = call({"action": "insights", "spec": spec})
    if st != 200:
        sys.exit(f"insights {name} failed {st}: {json.dumps(d)[:200]}")
    dist = d.get("distributions") or {}
    geo = d.get("geo") or {}
    people = geo.get("people") or geo.get("personal") or {}

    states = [{"state": s.get("state"), "total": s.get("total")}
              for s in (people.get("states") or []) if s.get("state")]
    counties = [{"fips": c.get("fips"), "total": c.get("total")}
                for c in (people.get("counties") or []) if c.get("fips")]
    zips = []
    if extra.get("loc", {}).get("personal", {}).get("zip"):
        zips = [{"zip": z.get("zip"), "total": z.get("total"), "fips": z.get("fips"),
                 "lat": z.get("lat"), "lng": z.get("lng")}
                for z in (people.get("zips") or []) if z.get("zip")]

    cov = d.get("coverage") or {}
    ag = dist.get("age_gender") or {}
    ageGender = {k: {"m": v.get("m", 0), "f": v.get("f", 0), "u": v.get("u", 0)} for k, v in ag.items()}
    ho = dist.get("homeowner") or {}
    fa = dist.get("family") or {}

    # cities_people → [[label, count], ...] top 10 (matches hbars input + baked mobile shape)
    cp = dist.get("cities_people") or []
    if isinstance(cp, dict):
        cities = sorted(cp.items(), key=lambda kv: -kv[1])
    else:
        cities = [(x[0] if isinstance(x, (list, tuple)) else x.get("city"),
                   x[1] if isinstance(x, (list, tuple)) else x.get("total")) for x in cp]
    cities = [[c, n] for c, n in cities if c][:10]

    stages_out.append({
        "id": name, "reach": d.get("reach"),
        "states": states, "counties": counties, "zips": zips,
        "coverage": {
            "businessEmail": cov.get("has_business_email"),
            "mobilePhone": cov.get("has_mobile_phone"),
            "linkedinPresent": cov.get("has_linkedin"),
            "uniqueCompanies": cov.get("unique_companies") if cov.get("unique_companies") is not None else cov.get("has_company_name"),
        },
        "ageGender": ageGender,
        "homeowner": {"Y": ho.get("Y", 0), "N": ho.get("N", 0), "P": ho.get("P", 0), "U": ho.get("U", 0)},
        "family": {"mk": fa.get("mk", 0), "mn": fa.get("mn", 0), "sk": fa.get("sk", 0), "sn": fa.get("sn", 0)},
        "income": dist.get("income_range") or {},
        "networth": dist.get("net_worth") or {},
        "cities": cities,
    })
    nwTop = max((dist.get("net_worth") or {}).items(), key=lambda kv: kv[1], default=(None, 0))
    print(f"stage {name}: reach={d.get('reach')} states={len(states)} counties={len(counties)} "
          f"zips={len(zips)} inc={len(stages_out[-1]['income'])} nwTop={nwTop} "
          f"cities={len(cities)} bizEmail={cov.get('has_business_email')}", flush=True)

with open(OUT, "w") as f:
    json.dump({"stages": stages_out}, f)
print("WROTE", OUT, os.path.getsize(OUT) // 1024, "KB", flush=True)
