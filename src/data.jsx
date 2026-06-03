/* =========================================================================
   Rise Together, Sample data + ZIP lookup (prototype).
   Names and contacts are representative samples; the live civic-data source
   is wired in at build. Verify real officials via the official lookup links.
   ========================================================================= */

/* Issue chips for "Match your ask" */
const ISSUES = [
  { id: "security", label: "Security funding", level: "Federal", icon: "shield" },
  { id: "police", label: "Local police & event safety", level: "Local", icon: "pin" },
  { id: "schools", label: "Schools", level: "State", icon: "building" },
  { id: "support", label: "Public support", level: "Any", icon: "heart" },
  { id: "known", label: "Just being known", level: "Any", icon: "users" },
];

/* ---------- ZIP -> US state (by 3-digit prefix ranges) ---------- */
const ZIP3_STATES = [
  ["Massachusetts","MA",[[10,27]]],["Rhode Island","RI",[[28,29]]],["New Hampshire","NH",[[30,38]]],
  ["Maine","ME",[[39,49]]],["Vermont","VT",[[50,59]]],["Connecticut","CT",[[60,69]]],
  ["New Jersey","NJ",[[70,89]]],["New York","NY",[[100,149],[5,6]]],["Pennsylvania","PA",[[150,196]]],
  ["Delaware","DE",[[197,199]]],["District of Columbia","DC",[[200,200],[202,205]]],
  ["Virginia","VA",[[201,201],[220,246]]],["Maryland","MD",[[206,219]]],["West Virginia","WV",[[247,268]]],
  ["North Carolina","NC",[[270,289]]],["South Carolina","SC",[[290,299]]],["Georgia","GA",[[300,319],[398,399]]],
  ["Florida","FL",[[320,349]]],["Alabama","AL",[[350,369]]],["Tennessee","TN",[[370,385]]],
  ["Mississippi","MS",[[386,397]]],["Kentucky","KY",[[400,427]]],["Ohio","OH",[[430,459]]],
  ["Indiana","IN",[[460,479]]],["Michigan","MI",[[480,499]]],["Iowa","IA",[[500,528]]],
  ["Wisconsin","WI",[[530,549]]],["Minnesota","MN",[[550,567]]],["South Dakota","SD",[[570,577]]],
  ["North Dakota","ND",[[580,588]]],["Montana","MT",[[590,599]]],["Illinois","IL",[[600,629]]],
  ["Missouri","MO",[[630,658]]],["Kansas","KS",[[660,679]]],["Nebraska","NE",[[680,693]]],
  ["Louisiana","LA",[[700,714]]],["Arkansas","AR",[[716,729]]],["Oklahoma","OK",[[730,749]]],
  ["Texas","TX",[[750,799],[885,885]]],["Colorado","CO",[[800,816]]],["Wyoming","WY",[[820,831]]],
  ["Idaho","ID",[[832,838]]],["Utah","UT",[[840,847]]],["Arizona","AZ",[[850,865]]],
  ["New Mexico","NM",[[870,884]]],["Nevada","NV",[[889,898]]],["California","CA",[[900,961]]],
  ["Hawaii","HI",[[967,968]]],["Oregon","OR",[[970,979]]],["Washington","WA",[[980,994]]],
  ["Alaska","AK",[[995,999]]],
];
function zipToState(zip) {
  const z = String(zip).trim();
  if (!/^\d{5}$/.test(z)) return null;
  const p = parseInt(z.slice(0, 3), 10);
  for (const [name, abbr, ranges] of ZIP3_STATES) {
    if (ranges.some(([lo, hi]) => p >= lo && p <= hi)) return { name, abbr };
  }
  return null;
}
const ABBR_NAME = Object.fromEntries(ZIP3_STATES.map(([name, abbr]) => [abbr, name]));
const US_STATES = ZIP3_STATES.map(([name, abbr]) => ({ name, abbr })).sort((a, b) => a.name.localeCompare(b.name));

/* Deterministic pseudo-random from a seed string */
function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const FIRST = ["Maria","Daniel","Rina","Jordan","Patricia","Alicia","Marcus","Sofia","Andre","Karen","Thomas","Nadia","Gregory","Elena","Samuel","Diane","Victor","Joan","Priya","Carl","Renee","Hassan","Grace","Leo","Maya","Omar"];
const LAST = ["Alvarez","Pope","Shah","Lee","Nolan","Crane","Webb","Reyes","Bell","Liu","Bradford","Hassan","Fontaine","Petrov","Okafor","Murphy","Ramos","Whitaker","Anand","Jensen","Coleman","Tran","Delgado","Brooks","Sandoval","Park"];
const PARTIES = ["Democrat", "Republican", "Nonpartisan"];

/* ---------- Generate state-aware officials for a ZIP ---------- */
function generateOfficials(zip) {
  const st = zipToState(zip);
  if (!st) return null;
  const rnd = seeded(zip + st.abbr);
  const used = new Set();
  const person = () => {
    let f, l, key;
    do { f = FIRST[Math.floor(rnd() * FIRST.length)]; l = LAST[Math.floor(rnd() * LAST.length)]; key = f + l; } while (used.has(key));
    used.add(key);
    return { first: f, last: l, full: `${f} ${l}` };
  };
  const phone = (area) => `(${area}) 555-0${Math.floor(100 + rnd() * 899)}`;
  const area = String(200 + Math.floor(rnd() * 700));
  const district = (parseInt(zip.slice(0, 3), 10) % 18) + 1;
  const ord = (n) => n + (["th", "st", "nd", "rd"][(n % 100 >> 3 ^ 1) && n % 10] || "th");

  const mk = (p, role, level, can, best, domain) => ({
    id: `${level}-${p.last}`, name: `${role.title}${p.full}`, role: role.office, party: role.party ?? PARTIES[Math.floor(rnd() * 3)],
    contacts: { email: `${p.first.toLowerCase()}.${p.last.toLowerCase()}@${domain}`, phone: phone(area), web: `${domain}/contact` },
    can, best,
  });

  const mayor = person(), council = person(), liaison = person();
  const stRep = person(), stSen = person();
  const usRep = person(), usSen1 = person(), usSen2 = person();

  return {
    state: st,
    Local: [
      mk(mayor, { title: "Mayor ", office: "Mayor", party: "Nonpartisan" }, "loc", "Sets the tone for the whole city and can issue public statements of support for your community.", ["Public support", "Just being known"], "cityhall.gov"),
      mk(council, { title: "", office: `City Council Member, ${ord(district)} District` }, "loc", "Connects you with local police, supports event security, and shows up to community gatherings.", ["Local police", "Event safety", "Public support"], "citycouncil.gov"),
      mk(liaison, { title: "Officer ", office: "Community Liaison, Police Department", party: "Nonpartisan" }, "loc", "Your direct line for event security plans and safety check-ins.", ["Local police", "Event safety"], "police.gov"),
    ],
    State: [
      mk(stRep, { title: "Rep. ", office: `${st.name} House of Representatives, District ${district}` }, "st", "Works on school policy and state-level protections against hate crimes.", ["Schools", "Public support"], "statehouse.gov"),
      mk(stSen, { title: "Sen. ", office: `${st.name} State Senate, District ${district}` }, "st", "Influences state education and public-safety budgets.", ["Schools", "Public support"], "statesenate.gov"),
    ],
    Federal: [
      mk(usRep, { title: "Rep. ", office: `U.S. House of Representatives (${st.abbr})` }, "fed", "Supports federal nonprofit security grant funding, the money that helps protect Jewish institutions.", ["Security funding", "Just being known"], "house.gov"),
      mk(usSen1, { title: "Sen. ", office: `U.S. Senate (${st.abbr})` }, "fed", "Votes on national security funding and can speak out against antisemitism.", ["Security funding", "Public support"], "senate.gov"),
      mk(usSen2, { title: "Sen. ", office: `U.S. Senate (${st.abbr})` }, "fed", "A second statewide voice in Washington for your community's safety.", ["Security funding", "Just being known"], "senate.gov"),
    ],
  };
}

/* ---------- Live data: real U.S. Senators by state (public dataset) ----------
   Loaded lazily and cached. Falls back silently to samples if unavailable. */
let _legCache = null, _legPromise = null;
async function loadLegislators() {
  if (_legCache) return _legCache;
  if (_legPromise) return _legPromise;
  const urls = [
    "https://unitedstates.github.io/congress-legislators/legislators-current.json",
    "https://cdn.jsdelivr.net/gh/unitedstates/congress-legislators@main/legislators-current.json",
  ];
  _legPromise = (async () => {
    for (const u of urls) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 7000);
        const r = await fetch(u, { signal: ctrl.signal });
        clearTimeout(t);
        if (r.ok) { _legCache = await r.json(); return _legCache; }
      } catch (e) { /* try next */ }
    }
    throw new Error("legislators dataset unavailable");
  })();
  return _legPromise;
}

async function fetchSenators(stateAbbr) {
  const leg = await loadLegislators();
  const out = [];
  for (const p of leg) {
    const term = p.terms[p.terms.length - 1];
    if (term && term.type === "sen" && term.state === stateAbbr) {
      const url = term.contact_form || term.url || "";
      out.push({
        id: "fed-sen-" + (p.id && p.id.bioguide || p.name.last),
        name: "Sen. " + (p.name.official_full || `${p.name.first} ${p.name.last}`),
        role: `U.S. Senate (${stateAbbr})`,
        party: term.party || "",
        contacts: { email: "", phone: term.phone || "", web: url.replace(/^https?:\/\//, "") },
        can: "Votes on national security funding, including the Nonprofit Security Grant Program that helps protect Jewish institutions, and can speak out against antisemitism.",
        best: ["Security funding", "Public support"],
        verified: true,
      });
    }
  }
  return out;
}

/* Build an official object from a congress-legislators person record */
function legToOfficial(p, roleLabel, can, best) {
  const t = p.terms[p.terms.length - 1];
  const url = t.contact_form || t.url || "";
  return {
    id: "leg-" + ((p.id && p.id.bioguide) || p.name.last),
    name: (t.type === "sen" ? "Sen. " : "Rep. ") + (p.name.official_full || `${p.name.first} ${p.name.last}`),
    role: roleLabel, party: t.party || "",
    contacts: { email: "", phone: t.phone || "", web: url.replace(/^https?:\/\//, "") },
    can, best, verified: true,
  };
}

function findHouseRep(leg, abbr, cd) {
  const dist = /^\d+$/.test(String(cd)) ? String(parseInt(cd, 10)) : "0";
  for (const p of leg) {
    const t = p.terms[p.terms.length - 1];
    if (t && t.type === "rep" && t.state === abbr && String(t.district) === dist) {
      return legToOfficial(p, `U.S. House (${abbr}-${dist === "0" ? "AL" : dist})`,
        "Votes on federal nonprofit security grant funding, the money that helps protect Jewish institutions, and can speak out against antisemitism.",
        ["Security funding", "Just being known"]);
    }
  }
  return null;
}

/* Resolve a human "place" name from Census geographies. Prefer a real
   incorporated place; only fall back to a County Subdivision when it's an
   actual governmental unit (town/township/etc.), NOT a statistical Census
   County Division. CCDs (e.g. "Sunshine Parkway CCD") and unorganized
   territories are census artifacts, not towns, so we never show them. */
function isStatisticalSubdivision(name) {
  return /\bccd$\b/i.test(name) || / CCD$/i.test(name) || /unorganized territor/i.test(name) || /not defined/i.test(name);
}
function resolvePlace(find) {
  const inc = find(/Incorporated Places/i);
  if (inc && inc.NAME) return inc.NAME;
  const sub = find(/County Subdivision/i);
  if (sub && sub.NAME && !isStatisticalSubdivision(sub.NAME)) return sub.NAME;
  return null;
}

/* ZIP -> approximate coordinates + place (zippopotam, no key, CORS) */
async function zipGeo(zip) {
  const r = await fetch("https://api.zippopotam.us/us/" + zip);
  if (!r.ok) throw new Error("zip geo");
  const j = await r.json();
  const p = j.places && j.places[0];
  if (!p) throw new Error("no place");
  return { lat: +p.latitude, lng: +p.longitude, city: p["place name"], stateAbbr: p["state abbreviation"] };
}

/* coordinates -> districts + place via Census geocoder (JSONP, bypasses CORS) */
function censusDistricts(lat, lng) {
  return new Promise((resolve, reject) => {
    const cb = "rtCensus" + Math.random().toString(36).slice(2);
    let done = false;
    const cleanup = () => { try { delete window[cb]; } catch (e) {} if (s.parentNode) s.remove(); };
    window[cb] = (data) => {
      done = true; cleanup();
      try {
        const g = (data.result && data.result.geographies) || {};
        const find = (re) => { const k = Object.keys(g).find(x => re.test(x)); return k && g[k] && g[k][0]; };
        const cd = find(/Congressional/i), su = find(/Legislative.*Upper/i), sl = find(/Legislative.*Lower/i);
        const place = resolvePlace(find);
        const county = find(/^Counties$/i) || find(/Counties/i);
        resolve({
          cd: cd ? cd.BASENAME : null,
          sldu: su ? su.BASENAME : null,
          sldl: sl ? sl.BASENAME : null,
          place: place,
          county: county ? county.NAME : null,
        });
      } catch (e) { reject(e); }
    };
    const s = document.createElement("script");
    s.onerror = () => { cleanup(); reject(new Error("census")); };
    s.src = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=jsonp&callback=${cb}`;
    document.body.appendChild(s);
    setTimeout(() => { if (!done) { cleanup(); reject(new Error("census timeout")); } }, 9000);
  });
}

/* full street address -> exact coordinates + districts + place, in one authoritative
   call to the Census geocoder (JSONP, bypasses CORS). This is precise to the address,
   so it returns the correct congressional and state-legislative districts. */
function censusGeocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const cb = "rtGeo" + Math.random().toString(36).slice(2);
    let done = false;
    const cleanup = () => { try { delete window[cb]; } catch (e) {} if (s.parentNode) s.remove(); };
    window[cb] = (data) => {
      done = true; cleanup();
      try {
        const matches = data.result && data.result.addressMatches;
        if (!matches || !matches.length) { resolve(null); return; }
        const m = matches[0];
        const g = m.geographies || {};
        const find = (re) => { const k = Object.keys(g).find(x => re.test(x)); return k && g[k] && g[k][0]; };
        const st = find(/^States$/i) || find(/States/i);
        const cd = find(/Congressional/i), su = find(/Legislative.*Upper/i), sl = find(/Legislative.*Lower/i);
        const place = resolvePlace(find);
        const county = find(/^Counties$/i) || find(/Counties/i);
        resolve({
          lat: +m.coordinates.y, lng: +m.coordinates.x, matched: m.matchedAddress,
          stateAbbr: st ? st.STUSAB : null,
          stateName: st ? st.NAME : null,
          cd: cd ? cd.BASENAME : null,
          sldu: su ? su.BASENAME : null,
          sldl: sl ? sl.BASENAME : null,
          place: place,
          county: county ? county.NAME : null,
        });
      } catch (e) { reject(e); }
    };
    const s = document.createElement("script");
    s.onerror = () => { cleanup(); reject(new Error("census addr")); };
    s.src = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&vintage=Current_Current&format=jsonp&callback=${cb}`;
    document.body.appendChild(s);
    setTimeout(() => { if (!done) { cleanup(); reject(new Error("census addr timeout")); } }, 8000);
  });
}

/* Retry an async source up to `tries` times; tolerates timeouts/null from the
   Census geocoder, whose latency spikes intermittently. */
async function withRetry(fn, tries = 2) {
  let lastErr = null;
  for (let i = 0; i < tries; i++) {
    try { const v = await fn(); if (v) return v; } catch (e) { lastErr = e; }
  }
  if (lastErr) throw lastErr;
  return null;
}

/* Minimal CSV parser (handles quoted fields) */
function parseCSV(text) {
  const rows = []; let i = 0, field = "", row = [], inQ = false;
  while (i < text.length) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += c; }
    else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); if (row.length > 1 || row[0] !== "") rows.push(row); row = []; field = ""; }
    else field += c;
    i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map(h => h.trim());
  return rows.map(r => { const o = {}; header.forEach((h, idx) => o[h] = r[idx]); return o; });
}

const _osCache = {};
async function loadStateLeg(abbr) {
  const k = abbr.toLowerCase();
  if (_osCache[k]) return _osCache[k];
  const r = await fetch(`https://data.openstates.org/people/current/${k}.csv`);
  if (!r.ok) throw new Error("state roster");
  _osCache[k] = parseCSV(await r.text());
  return _osCache[k];
}

function osToOfficial(row, st, chamber, dist) {
  const m = (row.links || "").match(/https?:\/\/[^\s"',\]]+/);
  const cham = chamber === "upper" ? `${st.name} State Senate` : `${st.name} State House`;
  return {
    id: "os-" + (row.id || row.name),
    name: (chamber === "upper" ? "Sen. " : "Rep. ") + row.name,
    role: `${cham}, District ${dist}`,
    party: row.current_party || "",
    contacts: { email: row.email || "", phone: row.capitol_voice || row.district_voice || "", web: m ? m[0].replace(/^https?:\/\//, "") : "" },
    can: chamber === "upper"
      ? "Shapes state education and public-safety budgets, and state-level protections against hate."
      : "Works on school policy and state-level protections against hate crimes.",
    best: ["Schools", "Public support"], verified: true,
  };
}
function matchStateLeg(roster, chamber, dist) {
  const d = String(dist).trim();
  return roster.find(r => (r.current_chamber || "").toLowerCase() === chamber && String(r.current_district).trim() === d) || null;
}

/* ---------- Integrated, named lookup across all levels ----------
   Accepts a full street address (precise, address-level districts) or a bare ZIP
   (coarse, centroid-level fallback). The address path is authoritative. */
async function lookupOfficials(query) {
  const q = String(query || "").trim();
  const zipOnly = /^\d{5}$/.test(q);
  let st = null, geo = null, districts = null, place = null, county = null, matched = null, usedCentroid = false;

  // 1) Precise: geocode the full address with the Census geocoder (retried on a spike).
  if (!zipOnly) {
    try {
      const g = await withRetry(() => censusGeocodeAddress(q), 2);
      if (g && g.stateAbbr) {
        st = { abbr: g.stateAbbr, name: ABBR_NAME[g.stateAbbr] || g.stateName || g.stateAbbr };
        geo = { lat: g.lat, lng: g.lng };
        districts = { cd: g.cd, sldu: g.sldu, sldl: g.sldl, place: g.place, county: g.county };
        place = g.place; county = g.county; matched = g.matched;
      }
    } catch (e) { /* fall back to ZIP path below */ }
  }

  // 2) Fallback: ZIP centroid (used for a bare ZIP, or if the address did not match).
  if (!st) {
    usedCentroid = true;
    const zip = (q.match(/\b\d{5}\b/) || [])[0];
    if (!zip) return null;
    st = zipToState(zip);
    try {
      const zg = await zipGeo(zip);
      if (zg && zg.stateAbbr) {
        st = { abbr: zg.stateAbbr, name: ABBR_NAME[zg.stateAbbr] || (st && st.name) || zg.stateAbbr };
        geo = { lat: zg.lat, lng: zg.lng }; place = zg.city;
      }
    } catch (e) {}
    if (!st) return null;
    if (geo && !districts) {
      try {
        districts = await withRetry(() => censusDistricts(geo.lat, geo.lng), 2);
        if (districts.county) county = districts.county;
        if (districts.place) place = districts.place;
      } catch (e) {}
    }
  }

  const out = {
    state: st,
    city: place ? place.replace(/ (city|town|village|CDP|borough|municipality)$/i, "") : null,
    county, matched, approx: usedCentroid,
    senators: [], house: null, stateUpper: null, stateLower: null, live: false, districts,
  };

  // U.S. Senators (state-level, most reliable)
  try { out.senators = await fetchSenators(st.abbr); if (out.senators.length) out.live = true; } catch (e) {}

  // U.S. House + state legislature, from the exact districts we resolved
  if (districts) {
    const d = districts;
    if (d.cd) { try { const leg = await loadLegislators(); out.house = findHouseRep(leg, st.abbr, d.cd); if (out.house) out.live = true; } catch (e) {} }
    if (d.sldu || d.sldl) {
      try {
        const roster = await loadStateLeg(st.abbr);
        if (d.sldu) { const r = matchStateLeg(roster, "upper", d.sldu); if (r) { out.stateUpper = osToOfficial(r, st, "upper", d.sldu); out.live = true; } }
        if (d.sldl) { const r = matchStateLeg(roster, "lower", d.sldl); if (r) { out.stateLower = osToOfficial(r, st, "lower", d.sldl); out.live = true; } }
      } catch (e) {}
    }
  }
  return out;
}

/* Live, authoritative lookups for the levels with no free keyless dataset.
   Every link points to the real, current official for the chapter's address. */
const LOOKUP_LINKS = {
  local: {
    level: "Local", icon: "pin", title: "Your local officials",
    desc: "Mayor, city council, and your police community liaison. Local offices have no free public roster, so this links you to USA.gov's official finder for your town.",
    best: ["Local police", "Event safety", "Public support"],
    links: (loc) => [
      { label: "Find your local officials (USA.gov)", href: "https://www.usa.gov/local-governments" },
    ],
  },
  state: {
    level: "State", icon: "building", title: "Your state legislators",
    desc: "Look up your state senator and representative for this exact address.",
    best: ["Schools", "Public support"],
    links: (loc) => [
      { label: `Find your ${loc && loc.state ? loc.state.name + " " : "state "}legislators`, href: "https://openstates.org/find_your_legislator/" },
    ],
  },
  house: {
    level: "Federal", icon: "landmark", title: "Your U.S. Representative",
    desc: "Your member of the U.S. House. Their district is drawn by your exact address, so this links you to the official finder that returns the current Representative.",
    best: ["Security funding", "Just being known"],
    links: () => [
      { label: "Find your U.S. Representative", href: "https://www.house.gov/representatives/find-your-representative" },
    ],
  },
  senate: {
    level: "Federal", icon: "landmark", title: "Your U.S. Senators",
    desc: "Both of your state's U.S. Senators and their contact details.",
    best: ["Security funding", "Public support"],
    links: () => [
      { label: "Find your U.S. Senators", href: "https://www.senate.gov/senators/senators-contact.htm" },
    ],
  },
};

/* International official finders. For each country, authoritative government
   directories mapped to the same two tiers we use everywhere: the people close
   to home (local / regional councils) and the national legislature. Every link
   points to an official government or parliament finder. */
const INTL_LOOKUPS = {
  "Canada": [
    { level: "Local", icon: "pin", title: "Your provincial & municipal government", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Your MLA/MPP/MNA and city council, closest to schools, policing, and event safety.",
      links: () => [{ label: "Provincial, territorial & municipal governments", href: "https://www.canada.ca/en/intergovernmental-affairs/services/provinces-territories.html" }] },
    { level: "National", icon: "landmark", title: "Your Member of Parliament", best: ["Security funding", "Just being known"],
      desc: "Your MP in the House of Commons, your national voice on security and policy.",
      links: () => [{ label: "Find your MP (Parliament of Canada)", href: "https://www.ourcommons.ca/Members/en/search" }] },
  ],
  "United Kingdom": [
    { level: "Local", icon: "pin", title: "Your local council", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Your councillors and local authority, closest to schools, policing, and community safety.",
      links: () => [{ label: "Find your local council (GOV.UK)", href: "https://www.gov.uk/find-local-council" }] },
    { level: "National", icon: "landmark", title: "Your Member of Parliament", best: ["Security funding", "Just being known"],
      desc: "Your MP in the House of Commons, your national voice on security and policy.",
      links: () => [{ label: "Find your MP (UK Parliament)", href: "https://members.parliament.uk/FindYourMP" }] },
  ],
  "Australia": [
    { level: "Local", icon: "pin", title: "Your local council", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Your local councillors, closest to community safety and local events.",
      links: () => [{ label: "Find your local council (ALGA)", href: "https://www.alga.com.au/about-alga/find-your-local-council/" }] },
    { level: "National", icon: "landmark", title: "Your federal member", best: ["Security funding", "Just being known"],
      desc: "Your member of the House of Representatives and Senators for your state.",
      links: () => [{ label: "Find your member (Parliament of Australia)", href: "https://www.aph.gov.au/Senators_and_Members/Members" }] },
  ],
  "Argentina": [
    { level: "Local", icon: "pin", title: "Tu gobierno provincial y local", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Tu gobierno provincial y municipal, lo más cercano a las escuelas y la seguridad local.",
      links: () => [{ label: "Gobierno de Argentina (provincias)", href: "https://www.argentina.gob.ar/gobierno" }] },
    { level: "National", icon: "landmark", title: "Tu diputado nacional", best: ["Security funding", "Just being known"],
      desc: "Tus representantes en la Cámara de Diputados de la Nación.",
      links: () => [{ label: "Cámara de Diputados", href: "https://www.diputados.gob.ar/" }] },
  ],
  "Brazil": [
    { level: "Local", icon: "pin", title: "Seu governo estadual e municipal", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Seu governo estadual e prefeitura, mais próximos das escolas e da segurança local.",
      links: () => [{ label: "Órgãos do governo (gov.br)", href: "https://www.gov.br/pt-br/orgaos-do-governo" }] },
    { level: "National", icon: "landmark", title: "Seu deputado federal", best: ["Security funding", "Just being known"],
      desc: "Seus representantes na Câmara dos Deputados.",
      links: () => [{ label: "Câmara dos Deputados", href: "https://www.camara.leg.br/deputados/" }] },
  ],
  "France": [
    { level: "Local", icon: "pin", title: "Votre mairie", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Votre maire et votre conseil municipal, au plus près des écoles et de la sécurité locale.",
      links: () => [{ label: "Annuaire des mairies (service-public.fr)", href: "https://lannuaire.service-public.fr/navigation/mairie" }] },
    { level: "National", icon: "landmark", title: "Votre député", best: ["Security funding", "Just being known"],
      desc: "Votre député à l'Assemblée nationale, votre voix nationale.",
      links: () => [{ label: "Trouvez votre député (Assemblée nationale)", href: "https://www.assemblee-nationale.fr/dyn/vos-deputes" }] },
  ],
  "Germany": [
    { level: "Local", icon: "pin", title: "Ihre lokale Verwaltung", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Ihre Stadt- und Landesbehörden, am nächsten an Schulen und örtlicher Sicherheit.",
      links: () => [{ label: "Behördenfinder (Bund.de)", href: "https://www.bund.de/" }] },
    { level: "National", icon: "landmark", title: "Ihr/e Abgeordnete/r", best: ["Security funding", "Just being known"],
      desc: "Ihre Abgeordneten im Deutschen Bundestag.",
      links: () => [{ label: "Abgeordnete (Deutscher Bundestag)", href: "https://www.bundestag.de/abgeordnete" }] },
  ],
  "Israel": [
    { level: "Local", icon: "pin", title: "Your local authority", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Your municipality and local authority, closest to schools and community safety.",
      links: () => [{ label: "Local authorities (gov.il)", href: "https://www.gov.il/en/departments/ministry_of_interior/govil-landing-page" }] },
    { level: "National", icon: "landmark", title: "Your Knesset members", best: ["Security funding", "Just being known"],
      desc: "The current members of the Knesset, your national representatives.",
      links: () => [{ label: "Members of Knesset", href: "https://main.knesset.gov.il/en/mk/Pages/current.aspx" }] },
  ],
  "South Africa": [
    { level: "Local", icon: "pin", title: "Your local & provincial government", best: ["Local police", "Event safety", "Schools", "Public support"],
      desc: "Your municipality and provincial government, closest to schools and local safety.",
      links: () => [{ label: "Government contact directory (gov.za)", href: "https://www.gov.za/about-government/contact-directory" }] },
    { level: "National", icon: "landmark", title: "Your Members of Parliament", best: ["Security funding", "Just being known"],
      desc: "The members of the National Assembly, your national voice.",
      links: () => [{ label: "Members of Parliament", href: "https://www.parliament.gov.za/group-details" }] },
  ],
  "Other": [
    { level: "National", icon: "landmark", title: "Your national parliament", best: ["Security funding", "Public support", "Just being known"],
      desc: "Find your country's national legislature and its members through the Inter-Parliamentary Union's directory of every national parliament.",
      links: () => [{ label: "National parliaments directory (IPU)", href: "https://www.ipu.org/national-parliaments" }] },
  ],
};

/* Connection types -> ladder rung */
const CONNECTION_TYPES = [
  { id: "intro", rung: 1, label: "Just introduce ourselves", sub: "Get on their radar", icon: "chat" },
  { id: "meeting", rung: 2, label: "Ask for a meeting", sub: "Start a real conversation", icon: "handshake" },
  { id: "invite", rung: 3, label: "Invite them to our chapter", sub: "Build a standing relationship", icon: "star" },
];

/* Tone note by level (no em dashes) */
const TONE_BY_LEVEL = {
  Local: "Local officials are your neighbors, so this email is warm and personal.",
  State: "State offices are formal but still personal.",
  Federal: "Federal offices are formal, and you will likely reach a staffer, which is exactly the goal.",
};

/* ---------- Email generator: confident BBYO voice, real stakes, no em dashes ---------- */
function buildEmail({ type, official, fields }) {
  const f = fields;
  const chapter = f.chapter || "[your chapter]";
  const name = f.name || "[your name]";
  const role = f.role || "a member";
  const city = f.city || "[your city]";
  const greeting = `Dear ${official?.name || "[official]"},`;
  const sign = `Sincerely,\n${name}\n${role}, ${chapter} (a chapter of BBYO)\n${city}`;
  const level = official?.level || "Local";
  const incident = f.incident && f.incident.trim()
    ? ` This is not abstract for us: ${f.incident.trim()} reminded our members that the safety we count on cannot be taken for granted.` : "";
  const intro1 = `My name is ${name}, and I am ${/^(the |a |an )/i.test(role) ? role : "the " + role} of ${chapter}, a chapter of BBYO, the world's largest Jewish teen movement, with more than 70,000 members across 65 countries. A group of us are your constituents right here in ${city}, and we wanted you to know who we are.`;

  // Why-it-matters line, tuned by level
  const stakes = level === "Federal"
    ? "Like Jewish communities everywhere, we have watched antisemitism rise, and we know that strong federal support for protecting community institutions, like synagogues, JCCs, and schools, is one of the most direct ways to keep people safe."
    : "Like Jewish communities everywhere, we have watched antisemitism rise, and we believe a community that knows and protects all of its members is the best answer to it.";

  if (type === "intro") {
    return {
      subject: `Introducing ${chapter}, your local BBYO teen chapter`,
      body:
`${greeting}

${intro1}

We are reaching out now, in a calm moment, on purpose. ${stakes}${incident} The most important thing we can do is build real relationships with the leaders who represent us before anything happens, not after, and we are proud to start that with you.

There is nothing we need today. This is simply an introduction, and a thank you for the work you do for ${city}. If it is ever useful, we would be glad to tell you what our chapter is working on, or to be a resource for you on the issues that affect Jewish teens.

We are glad to be part of this community, and glad to know you are representing it. Thank you for your time.

${sign}`,
    };
  }
  if (type === "meeting") {
    return {
      subject: `Meeting request from ${chapter}, your local Jewish teens`,
      body:
`${greeting}

${intro1}

We would like to introduce ourselves properly, and we are asking for a short meeting, even fifteen minutes, with you or a member of your team. Our goal is simple and sincere: to build a real relationship before a crisis, not during one.${incident}

${stakes} We are organized, we are serious, and we would be a genuine partner to your office on the things that keep our whole community safe.

Could we find fifteen minutes in the coming weeks? We will gladly come to you and work entirely around your schedule. Thank you for considering it. We look forward to meeting you.

${sign}`,
    };
  }
  // Logistics so the official has everything they need to say yes.
  const mWhen = f.meetWhen && f.meetWhen.trim();
  const mWhere = f.meetWhere && f.meetWhere.trim();
  const mSize = f.meetSize && f.meetSize.trim();
  const meetLines = [];
  if (mWhen || mWhere) {
    let l = "We gather";
    if (mWhen) l += ` ${mWhen}`;
    if (mWhere) l += `${mWhen ? ", " : " "}at ${mWhere}`;
    meetLines.push(l + ".");
  }
  if (mSize) meetLines.push(`A typical gathering brings together around ${mSize} teens.`);
  const logistics = meetLines.length ? ` ${meetLines.join(" ")}` : "";
  return {
    subject: `An invitation from ${chapter} to meet our teens`,
    body:
`${greeting}

${intro1}

We would be honored to host you, or a member of your team, at one of our chapter gatherings.${logistics} You would meet a room full of thoughtful, driven young people who care deeply about their community, and who would be genuinely glad to know the leader who represents them.${incident}

${stakes} Spending even a short time with our chapter sends a powerful message: that the people who represent us see us, value us, and stand with us. It would mean a great deal, and we think you would enjoy it.

We will work entirely around your calendar. Thank you for considering our invitation. We would be proud to welcome you.

${sign}`,
  };
}

/* Sample saved connections for the populated Track state */
const SAMPLE_CONNECTIONS = [
  {
    id: "c1", official: "Rep. Jordan Lee", office: "State House, District 16", level: "State",
    poc: "Sam Rivera", pocRole: "District Director", email: "sam.rivera@statehouse.gov", phone: "(410) 555-0120",
    rung: 1, first: "2026-04-10", last: "2026-05-02, replied to our intro email",
    owner: "Maya R., President", next: "Send event invite by June 15",
    notes: "Prefers email. Staffer Sam is friendly and quick to reply.",
  },
  {
    id: "c2", official: "Maria Alvarez", office: "City Council, District 4", level: "Local",
    poc: "Maria Alvarez", pocRole: "Council Member", email: "council.d4@cityhall.gov", phone: "(301) 555-0142",
    rung: 2, first: "2026-03-22", last: "2026-05-12, 20 minute intro call",
    owner: "Eli B., VP", next: "Invite to spring chapter event",
    notes: "Attended a JCC event last year. Warm and genuinely interested.",
  },
];

/* FAQ (no em dashes) */
const FAQ = [
  { q: "What if no one replies?", a: "That is completely normal. Officials get a lot of mail. Reaching a staff member counts as a win, and a friendly follow-up in about two weeks often does the trick. Do not take silence personally." },
  { q: "Is this political?", a: "No. Rise Together is strictly non-partisan. The goal is relationships, not policy positions. We connect with leaders of every party so that anyone can help if antisemitism rises." },
  { q: "We are a small or non-US chapter. Can we still do this?", a: "Yes. Every chapter has local and regional leaders worth knowing. Use the manual lookup if our finder does not cover your area, and adapt the templates to your country's offices." },
  { q: "Do we need a specific policy ask?", a: "Not for first contact. The whole point of this stage is simply being known. The real ask comes much later, once a relationship exists, and BBYO's advocacy letters are there when you reach it." },
  { q: "What if there is a crisis right now?", a: "If your chapter or community is facing an immediate safety concern, contact your advisor, local police, and BBYO Marketing right away. This tool is for building relationships before a crisis, not for emergencies." },
];

/* Downloads */
const DOWNLOADS = [
  { id: "onepager", title: "Meeting one-pager", desc: "Hand this to an official so they know who BBYO is at a glance.", icon: "building" },
  { id: "letters", title: "BBYO advocacy letters", desc: "For the later real-ask stage, once a relationship exists.", icon: "write" },
];

/* ---------- Real downloadable template files ---------- */
const TEMPLATE_FILES = {
  onepager: {
    name: "Rise_Together_Meeting_One_Pager.txt", mime: "text/plain",
    content:
`RISE TOGETHER, ONE-PAGER FOR ELECTED OFFICIALS
A BBYO chapter program

WHO WE ARE
BBYO is the world's largest Jewish teen movement, with more than 70,000 members across
65 countries and 700+ local chapters. Our members are teens, roughly ages 13 to 18, who
lead their own chapters and care deeply about their communities.

WHY WE ARE REACHING OUT
We are building relationships with the leaders who represent us before any crisis, so
that if antisemitism rises, our community already has people who know us and can help.
This is part of Here We Stand, BBYO's movement to meet rising antisemitism with pride,
presence, and preparation.

WHAT WE ARE ASKING (USUALLY NOTHING, AT FIRST)
At this stage we simply want to introduce ourselves and be known. Over time, we hope to
be a trusted, non-partisan resource to your office on the issues that affect Jewish teens
and the safety of community institutions.

HOW TO REACH US
Chapter: ____________________________   Contact: ____________________________
Email: ______________________________   Advisor: ____________________________`,
  },
  letters: {
    name: "BBYO_Advocacy_Letter_Templates.txt", mime: "text/plain",
    content:
`HERE WE STAND, HINEI ANACHNU: TEEN VOICES AGAINST HATE
Sample advocacy letter templates. Share your version with BBYO Marketing for a brief
review before submitting. These are for the later "real ask" stage, once a relationship
already exists.

=====================================================================================
1. LETTER TO YOUR ELECTED OFFICIAL (UNITED STATES)
=====================================================================================
Dear [Senator / Representative last name],

I am writing to you as a Jewish teen living in [home city, state] who is concerned about
the safety of my community. In recent months we have seen a troubling surge in
antisemitic incidents. [Optional: reference a local incident.] These are not abstract
events to my peers and me.

I am joining with 70,000 teens from BBYO, the world's largest Jewish teen movement, to
ask you to support strong funding for the Nonprofit Security Grant Program. This program
helps synagogues, JCCs, and schools afford the security measures that keep our
communities safe, and demand for it far outpaces the funding available.

No one should have to choose between their safety and their mission, or walk into a house
of worship wondering if they will be protected. Keeping communities safe is something we
can all agree on, and I hope I can count on your support.

Warm regards,
[name, city, and age]

=====================================================================================
2. LETTER TO YOUR ELECTED OFFICIAL (OUTSIDE THE UNITED STATES)
=====================================================================================
Dear [elected official's name],

I am writing to you as a Jewish teen living in [home city, region] who is concerned about
the safety of my community. In recent months we have seen a troubling rise in antisemitic
incidents around the world. [Optional: reference a local incident.]

I am joining with 70,000 teens from BBYO, the world's largest Jewish teen movement, to
ask for a meaningful increase in funding for security at religious institutions. This
support protects not only the Jewish community but every community targeted by hate.

No one should have to walk into a house of worship wondering if they will be protected.
Investing in this protection is a direct investment in the safety and dignity of the
people you represent. I hope I can count on your support.

Warm regards,
[name]

=====================================================================================
3. LETTER TO YOUR LOCAL EDITOR
=====================================================================================
To the editor,

We are the elected leaders of [chapter / region] BBYO, part of the world's largest Jewish
teen movement, home to more than 70,000 Jewish teens across 65 countries.

We are writing to help build a stronger and safer future for our community. Amid rising
division and hate, we are calling on everyone to come together: to meet hard conversations
with open ears and hate with humanity. We are asking local and national leaders to protect
the institutions and individuals who simply want to live and practice their faith in peace.

Our generation must be the one that turns differences into dialogue. Together, we will
speak up and build a more peaceful world.

Sincerely,
[names, city, and ages]`,
  },
};

Object.assign(window, { ISSUES, US_STATES, zipToState, generateOfficials, lookupOfficials, fetchSenators, LOOKUP_LINKS, INTL_LOOKUPS, CONNECTION_TYPES, TONE_BY_LEVEL, buildEmail, SAMPLE_CONNECTIONS, FAQ, DOWNLOADS, TEMPLATE_FILES });
