/* =========================================================================
   Rise Together, Tool 1: Find Your Officials
   Live data: real U.S. Senators (by name) + live lookups for U.S. House,
   state legislators, and local officials. No fabricated names.
   ========================================================================= */
const ISSUE_TARGETS = {
  security: ["Security funding"],
  police: ["Local police", "Event safety"],
  schools: ["Schools"],
  support: ["Public support"],
  known: ["Just being known"],
};
const ISSUE_LEVEL = { security: "Federal", police: "Local", schools: "State" };
/* International tiers: policing/schools/support sit local or regional; security & national policy sit national. */
const ISSUE_INTL_LEVEL = { security: "National", police: "Local", schools: "Local", support: "Local", known: "National" };
const INTL_HEAD = {
  Local: "Closest to home — schools, policing, and community safety.",
  National: "Your national legislature — security and policy.",
};

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Argentina", "Brazil", "France", "Germany", "Israel", "South Africa", "Other"];

function OfficialCard({ o, level, matched, ctx }) {
  const { nav, setOfficial } = ctx;

  const onWrite = () => { setOfficial({ ...o, level }); nav("write", { guided: true }); };

  return (
    <div className={`offcard card ${matched ? "matched" : ""}`}>
      {matched && <div className="match-flag"><Chev size={12} /> Good match for your ask</div>}
      <div className="offcard-head">
        <div>
          <h3 className="h3">{o.name}</h3>
          <div className="muted small" style={{ marginTop: 2 }}>{o.role}</div>
        </div>
        <div className="stack" style={{ gap: 6, alignItems: "flex-end" }}>
          <span className="party">{o.party}</span>
          {o.verified && <span className="chip best" style={{ fontSize: 11, padding: "4px 9px" }}><Icon name="check" size={12} stroke={3} /> Live data</span>}
        </div>
      </div>
      <p className="offcard-can"><Icon name="info" size={17} style={{ color: "var(--blue)", flex: "0 0 auto" }} /> {o.can}</p>
      <div className="wrapflex gap1" style={{ marginTop: 12 }}>
        {o.best.map(b => <span key={b} className="chip best"><Chev size={11} /> {b}</span>)}
      </div>
      <div className="offcard-contacts">
        {o.contacts.email && <a href={`mailto:${o.contacts.email}`} className="cc"><Icon name="mail" size={16} /> {o.contacts.email}</a>}
        {o.contacts.phone && <span className="cc"><Icon name="phone" size={16} /> {o.contacts.phone}</span>}
        {o.contacts.web && <a href={`https://${o.contacts.web}`} target="_blank" rel="noreferrer" className="cc"><Icon name="globe" size={16} /> {o.verified ? "Official contact form" : "Web form"}</a>}
      </div>
      <div className="offcard-actions">
        <Button className="block" chevron onClick={onWrite}>Write to this official</Button>
      </div>
    </div>
  );
}

/* Live lookup card for levels with no free dataset (Local; fallbacks elsewhere). */
function LookupCard({ cfg, loc, matched, onManual }) {
  const links = cfg.links(loc);
  return (
    <div className={`offcard card lookupcard ${matched ? "matched" : ""}`}>
      {matched && <div className="match-flag"><Chev size={12} /> Start your ask here</div>}
      <div className="row gap2" style={{ alignItems: "center" }}>
        <div className="feat-ico" style={{ width: 48, height: 48, flex: "0 0 auto" }}><Icon name={cfg.icon} size={22} /></div>
        <div>
          <h3 className="h3">{cfg.title}</h3>
          <div className="small" style={{ color: "var(--blue)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon name="link" size={14} /> Live official lookup</div>
        </div>
      </div>
      <p className="offcard-can" style={{ marginTop: 14 }}>{cfg.desc}</p>
      {cfg.best && (
        <div className="wrapflex gap1" style={{ marginTop: 12 }}>
          {cfg.best.map(b => <span key={b} className="chip best"><Chev size={11} /> {b}</span>)}
        </div>
      )}
      <div className="offcard-actions">
        {links.map((l, i) => (
          <a key={l.label} className={`btn block ${i === 0 ? "" : "btn-sec"}`} href={l.href} target="_blank" rel="noreferrer">
            <Icon name="link" size={19} /> {l.label}
          </a>
        ))}
        <Button className="block" variant="ghost" icon="plus" onClick={() => onManual(cfg.level)}>Found them? Add by hand</Button>
      </div>
    </div>
  );
}

function FindPage({ ctx }) {
  const [form, setForm] = React.useState({ country: "United States", state: "", address: "", town: "", zip: "" });
  const [state, setState] = React.useState("empty"); // empty | loading | results | none | intl
  const [results, setResults] = React.useState(null);
  const [issues, setIssues] = React.useState([]);
  const [zipError, setZipError] = React.useState(false);
  const [manual, setManual] = React.useState({ name: "", role: "", level: "Local", email: "" });
  const [manualOpen, setManualOpen] = React.useState(false);
  const inputRef = React.useRef(null);
  const manualRef = React.useRef(null);
  const resultsRef = React.useRef(null);

  // After a search returns content, glide the page down to the results.
  React.useEffect(() => {
    if ((state === "results" || state === "intl" || state === "none") && resultsRef.current) {
      const y = resultsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [state, results]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const buildQuery = (f) => {
    const parts = [];
    if (f.address && f.address.trim()) parts.push(f.address.trim());
    if (f.town && f.town.trim()) parts.push(f.town.trim());
    const tail = [f.state, (f.zip || "").trim()].filter(Boolean).join(" ");
    if (tail) parts.push(tail);
    return parts.join(", ");
  };

  const toggleIssue = (id) => setIssues(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const run = async (q) => {
    setState("loading");
    if (!q || !q.trim()) { setResults(null); setTimeout(() => setState("none"), 300); return; }
    const data = await lookupOfficials(q.trim());
    if (data) { setResults(data); setState("results"); } else { setResults(null); setState("none"); }
  };
  const search = (e) => {
    e && e.preventDefault();
    if (form.country !== "United States") { setResults(null); setState("intl"); return; }
    if (!form.zip.trim()) { setZipError(true); inputRef.current && inputRef.current.focus(); return; }
    setZipError(false);
    run(buildQuery(form));
  };
  const quick = (ex) => {
    const f = { country: "United States", state: ex.state || "", address: ex.address || "", town: ex.town || "", zip: ex.zip || "" };
    setForm(f); setZipError(false); run(buildQuery(f));
  };

  const openManual = (level) => {
    setManual(m => ({ ...m, level: level || "Local" }));
    setManualOpen(true);
    setTimeout(() => { if (manualRef.current) window.scrollTo({ top: manualRef.current.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }); }, 60);
  };

  const targets = issues.flatMap(i => ISSUE_TARGETS[i] || []);
  const isMatch = (o) => targets.length > 0 && o.best.some(b => targets.includes(b));
  const matchedLevels = new Set(issues.map(i => ISSUE_LEVEL[i]).filter(Boolean));
  const levelMatch = (lvl) => matchedLevels.has(lvl);

  const intlCfgs = INTL_LOOKUPS[form.country] || INTL_LOOKUPS["Other"];
  const intlMatchedLevels = new Set(issues.map(i => ISSUE_INTL_LEVEL[i]).filter(Boolean));
  const intlLevelMatch = (lvl) => intlMatchedLevels.has(lvl);

  const levelMeta = {
    Local: { icon: "pin", desc: "Your city and county. Closest to event safety and local police." },
    State: { icon: "building", desc: "Your state legislature. Schools and state-level protections." },
    Federal: { icon: "landmark", desc: "Your members of Congress. Security funding and a national voice." },
  };

  return (
    <div>
      {/* search header */}
      <section className="find-head">
        <div className="wrap center" style={{ position: "relative", maxWidth: 820 }}>
          <span className="eyebrow"><Chev size={13} /> Step 1 of 2 · Find</span>
          <h1 className="bx-pagetitle" style={{ marginTop: 12 }}>Who represents your chapter?</h1>
          <p className="lead muted" style={{ marginTop: 16 }}>Tell us where your chapter is. The more detail you add, the more precisely we can match your representatives.</p>

          <form onSubmit={search} className="search-form card pad">
            <div className="search-grid">
              <label className={`field ${form.country !== "United States" ? "span2" : ""}`} style={{ margin: 0 }}>
                <span className="lab">Country</span>
                <select className="select" value={form.country} onChange={e => setF("country", e.target.value)}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              {form.country === "United States" && (
                <React.Fragment>
                  <label className="field" style={{ margin: 0 }}>
                    <span className="lab">State <span className="optional">(optional)</span></span>
                    <select className="select" value={form.state} onChange={e => setF("state", e.target.value)}>
                      <option value="">Select a state</option>
                      {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="field span2" style={{ margin: 0 }}>
                    <span className="lab">Street <span className="optional">(optional)</span></span>
                    <input className="input" placeholder="e.g. 1600 Pennsylvania Ave" value={form.address} onChange={e => setF("address", e.target.value)} autoComplete="off" name="rt-address" />
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span className="lab">City <span className="optional">(optional)</span></span>
                    <input className="input" placeholder="e.g. Springfield" value={form.town} onChange={e => setF("town", e.target.value)} autoComplete="off" name="rt-town" />
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span className="lab">ZIP <span className="req">Required</span></span>
                    <input ref={inputRef} className={`input ${zipError ? "input-error" : ""}`} value={form.zip}
                      onChange={e => { setF("zip", e.target.value); if (zipError) setZipError(false); }} inputMode="numeric" placeholder="e.g. 20500" autoComplete="off" name="rt-zip" aria-required="true" aria-label="ZIP code" />
                  </label>
                </React.Fragment>
              )}
            </div>
            {zipError && <p className="small" style={{ color: "var(--blue)", marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}><Icon name="alert" size={15} /> Please enter your ZIP code to search.</p>}
            {form.country === "United States" ? (
              <div className="search-actions">
                <Button size="lg" chevron type="submit">Find officials</Button>
                <span className="small muted">Just a ZIP works; adding your street pinpoints your exact district.</span>
              </div>
            ) : (
              <div className="search-actions">
                <Button size="lg" chevron type="submit">Find my government directories</Button>
                <span className="small muted">We'll link you to the official directories for {form.country} below, where you can find your local and national representatives.</span>
              </div>
            )}
          </form>
        </div>
      </section>

      <div className="wrap section-sm" ref={resultsRef}>
        {/* Match your ask */}
        {state !== "none" && (
          <div className="match-ask card pad">
            <div className="row gap2" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="row gap1" style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--blue-deep)" }}>
                  <Icon name="target" size={20} style={{ color: "var(--blue)" }} /> Match your ask
                </div>
                <div className="small muted">Not sure who to contact? Tap what you care about and we will point you to the right level.</div>
              </div>
            </div>
            <div className="wrapflex gap1" style={{ marginTop: 14 }}>
              {ISSUES.map(is => (
                <button key={is.id} className={`chip ${issues.includes(is.id) ? "on" : "ghost"}`} onClick={() => toggleIssue(is.id)}>
                  <Icon name={is.icon} size={15} /> {is.label}
                </button>
              ))}
            </div>
            <div className="callout info" style={{ marginTop: 16, fontSize: 14 }}>
              <Icon name="info" size={20} className="ico" />
              <span><strong>Match the ask to the office.</strong> Security and national policy sit with your national government. Policing, schools, and community events are usually local or regional.</span>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {state === "empty" && (
          <div className="empty-find card pad center" style={{ marginTop: 24 }}>
            <div className="feat-ico lg" style={{ margin: "0 auto" }}><Icon name="compass" size={32} /></div>
            <h3 className="h3" style={{ marginTop: 16 }}>Your officials will appear here.</h3>
            <p className="muted" style={{ maxWidth: 480, margin: "8px auto 0" }}>
              Enter your full address and we will show your two U.S. Senators, your U.S. Representative, and your state legislators by name, for your exact district, plus a live lookup for local officials.
            </p>
            <div className="example-row">
              {Object.entries(levelMeta).map(([lvl, m]) => (
                <div key={lvl} className="example-cell">
                  <div className="feat-ico" style={{ width: 44, height: 44 }}><Icon name={m.icon} size={20} /></div>
                  <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
                    <span className={`level ${lvl.toLowerCase()}`}>{lvl}</span>
                    <span className="small muted">{m.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="wrapflex gap1" style={{ justifyContent: "center", marginTop: 18 }}>
              <span className="small muted">Try an example:</span>
              {[
                { address: "11 Wall St", town: "New York", state: "NY", zip: "10005" },
                { address: "233 S Wacker Dr", town: "Chicago", state: "IL", zip: "60606" },
              ].map(ex => (
                <button key={ex.zip} className="chip ghost" onClick={() => quick(ex)}>{ex.address}, {ex.town}</button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}
        {state === "loading" && (
          <div style={{ marginTop: 28 }}>
            {["Federal", "State"].map(lvl => (
              <div key={lvl} style={{ marginBottom: 28 }}>
                <div className="sk" style={{ width: 120, height: 22, marginBottom: 16 }} />
                <div className="grid offgrid">
                  {[0, 1].map(i => (
                    <div key={i} className="card pad">
                      <div className="sk" style={{ width: "60%", height: 20, marginBottom: 10 }} />
                      <div className="sk" style={{ width: "40%", height: 14, marginBottom: 18 }} />
                      <div className="sk" style={{ width: "100%", height: 38, marginBottom: 14 }} />
                      <div className="sk" style={{ width: "100%", height: 44 }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="center small muted">Pulling your officials...</p>
          </div>
        )}

        {/* RESULTS */}
        {state === "results" && results && (
          <div style={{ marginTop: 24 }} className="fadein">
            <div className="results-head">
              <div className="row gap1" style={{ flexWrap: "wrap" }}>
                <Icon name="pin" size={20} style={{ color: "var(--blue)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--blue-deep)", fontSize: 18 }}>{results.city ? `${results.city}, ${results.state.abbr}` : results.state.name}</span>
                {results.live && <span className="chip best" title="Pulled from live public datasets"><Icon name="check" size={12} stroke={3} /> Live data</span>}
              </div>
              <button className="linkish small" onClick={() => { setState("empty"); setForm({ country: "United States", state: "", address: "", town: "", zip: "" }); setResults(null); }}><Icon name="x" size={14} /> Clear search</button>
            </div>
            {results.matched && (
              <p className="small" style={{ marginBottom: 8, color: "var(--blue)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="pin" size={15} /> Showing officials for {results.matched}
              </p>
            )}
            {results.approx && (
              <p className="small muted" style={{ marginBottom: 8 }}>
                Based on your ZIP's center point. For pinpoint district accuracy, enter your full street address.
              </p>
            )}
            <p className="small muted" style={{ marginBottom: 8 }}>
              {issues.length > 0 ? "Highlighted cards match your selected ask. " : ""}
              Your federal and state officials are pulled live by name from public datasets. Local offices have no free roster, so we link you to the current officials for {results.city || "your town"}.
            </p>

            {/* LOCAL */}
            <div className="level-group">
              <div className="level-head"><span className="level local">Local</span><span className="small muted">{levelMeta.Local.desc}</span></div>
              <div className="grid offgrid">
                <LookupCard cfg={LOOKUP_LINKS.local} loc={{ state: results.state, city: results.city }} matched={levelMatch("Local")} onManual={openManual} />
              </div>
            </div>

            {/* STATE */}
            <div className="level-group">
              <div className="level-head"><span className="level state">State</span><span className="small muted">{levelMeta.State.desc}</span></div>
              <div className="grid offgrid">
                {results.stateUpper && <OfficialCard o={results.stateUpper} level="State" matched={isMatch(results.stateUpper)} ctx={ctx} />}
                {results.stateLower && <OfficialCard o={results.stateLower} level="State" matched={isMatch(results.stateLower)} ctx={ctx} />}
                {(!results.stateUpper || !results.stateLower) &&
                  <LookupCard cfg={LOOKUP_LINKS.state} loc={{ state: results.state, city: results.city }} matched={levelMatch("State")} onManual={openManual} />}
              </div>
            </div>

            {/* FEDERAL */}
            <div className="level-group">
              <div className="level-head"><span className="level federal">Federal</span><span className="small muted">{levelMeta.Federal.desc}</span></div>
              <div className="grid offgrid">
                {results.house
                  ? <OfficialCard o={results.house} level="Federal" matched={isMatch(results.house)} ctx={ctx} />
                  : <LookupCard cfg={LOOKUP_LINKS.house} loc={{ state: results.state }} matched={levelMatch("Federal")} onManual={openManual} />}
                {results.senators.map(o => (
                  <OfficialCard key={o.id} o={o} level="Federal" matched={isMatch(o)} ctx={ctx} />
                ))}
                {!results.senators.length && <LookupCard cfg={LOOKUP_LINKS.senate} loc={{ state: results.state }} matched={levelMatch("Federal")} onManual={openManual} />}
              </div>
            </div>

            <div ref={manualRef}>
              <ManualFallback manual={manual} setManual={setManual} ctx={ctx} compact open={manualOpen} setOpen={setManualOpen} />
            </div>
          </div>
        )}

        {/* NONE / ERROR */}
        {state === "none" && (
          <div style={{ marginTop: 24 }} className="fadein">
            <div className="callout warn" style={{ marginBottom: 20 }}>
              <Icon name="alert" size={24} className="ico" />
              <span><strong>We could not match that address.</strong> No worries, you are never stuck. Try including the street, city, and state (or a ZIP code), look your officials up below, or add one by hand. International chapters can use the manual entry too.</span>
            </div>
            <div className="lookup-grid">
              {[
                { t: "USA.gov, find your officials", s: "Federal, state, and local lookup by address.", href: "https://www.usa.gov/elected-officials" },
                { t: "House.gov, find your Rep", s: "Your U.S. House member by ZIP.", href: "https://www.house.gov/representatives/find-your-representative" },
                { t: "Senate.gov, your Senators", s: "Both of your state's U.S. Senators.", href: "https://www.senate.gov/senators/senators-contact.htm" },
              ].map(l => (
                <a key={l.t} className="card pad lookup-card" href={l.href} target="_blank" rel="noreferrer">
                  <div className="row gap1" style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--blue-deep)" }}>
                    <Icon name="link" size={18} style={{ color: "var(--blue)" }} /> {l.t}
                  </div>
                  <p className="small muted" style={{ marginTop: 6 }}>{l.s}</p>
                </a>
              ))}
            </div>
            <div ref={manualRef}>
              <ManualFallback manual={manual} setManual={setManual} ctx={ctx} />
            </div>
            <p className="center" style={{ marginTop: 20 }}>
              <button className="linkish" onClick={() => quick({ address: "11 Wall St", town: "New York", state: "NY", zip: "10005" })}>Or try a sample address instead <Icon name="arrowRight" size={15} /></button>
            </p>
          </div>
        )}

        {/* INTERNATIONAL */}
        {state === "intl" && (
          <div style={{ marginTop: 24 }} className="fadein">
            <div className="callout info" style={{ marginBottom: 20 }}>
              <Icon name="info" size={24} className="ico" />
              <span>Showing the official government directories for <strong>{form.country}</strong>. Open a directory, find your representative by name, then add them below and write to them just the same.</span>
            </div>
            {intlCfgs.map(cfg => (
              <div key={cfg.title} className="level-group">
                <div className="level-head">
                  <span className={`level ${cfg.level.toLowerCase()}`}>{cfg.level}</span>
                  <span className="small muted">{INTL_HEAD[cfg.level]}</span>
                </div>
                <div className="grid offgrid">
                  <LookupCard cfg={cfg} loc={{}} matched={intlLevelMatch(cfg.level)} onManual={openManual} />
                </div>
              </div>
            ))}
            <div ref={manualRef} style={{ marginTop: 8 }}>
              <ManualFallback manual={manual} setManual={setManual} ctx={ctx} />
            </div>
            <p className="center" style={{ marginTop: 20 }}>
              <button className="linkish" onClick={() => quick({ address: "11 Wall St", town: "New York", state: "NY", zip: "10005" })}>Or see a U.S. example <Icon name="arrowRight" size={15} /></button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ManualFallback({ manual, setManual, ctx, compact, open: openProp, setOpen: setOpenProp }) {
  const { setOfficial, nav } = ctx;
  const [openS, setOpenS] = React.useState(!compact);
  const open = openProp !== undefined ? openProp : openS;
  const setOpen = setOpenProp || setOpenS;
  const valid = manual.name.trim() && manual.role.trim();

  return (
    <div className="card pad manual" style={{ marginTop: compact ? 28 : 0 }}>
      <button className="manual-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="row gap1">
          <Icon name="edit" size={20} style={{ color: "var(--blue)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--blue-deep)" }}>
            {compact ? "Add an official by hand (after you look them up)" : "Add an official by hand"}
          </span>
        </div>
        <Icon name={open ? "chevUp" : "chevRight"} size={20} style={{ color: "var(--gray)" }} />
      </button>
      {open && (
        <div className="manual-body">
          <div className="manual-grid">
            <label className="field" style={{ margin: 0 }}>
              <span className="lab">Official or office name</span>
              <input className="input" placeholder="e.g. Rep. Jordan Lee" value={manual.name} onChange={e => setManual({ ...manual, name: e.target.value })} />
            </label>
            <label className="field" style={{ margin: 0 }}>
              <span className="lab">Role / title</span>
              <input className="input" placeholder="e.g. State House, District 16" value={manual.role} onChange={e => setManual({ ...manual, role: e.target.value })} />
            </label>
            <label className="field" style={{ margin: 0 }}>
              <span className="lab">Level</span>
              <select className="select" value={manual.level} onChange={e => setManual({ ...manual, level: e.target.value })}>
                <option>Local</option><option>State</option><option>Federal</option>
              </select>
            </label>
            <label className="field" style={{ margin: 0 }}>
              <span className="lab">Contact email <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
              <input className="input" placeholder="contact@office.gov" value={manual.email} onChange={e => setManual({ ...manual, email: e.target.value })} />
            </label>
          </div>
          <div className="wrapflex gap2" style={{ marginTop: 18 }}>
            <Button chevron disabled={!valid} onClick={() => { if (!valid) return; setOfficial({ name: manual.name, role: manual.role, level: manual.level, contacts: { email: manual.email } }); nav("write", { guided: true }); }}>Write to them</Button>
          </div>
        </div>
      )}
    </div>
  );
}
window.FindPage = FindPage;
