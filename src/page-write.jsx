/* =========================================================================
   Rise Together, Tool 2: Write Your Message
   Step A who · Step B connection type · Step C fields · Output
   ========================================================================= */
function WritePage({ ctx }) {
  const { official, setOfficial, writePrefill, nav, toast } = ctx;

  const [picker, setPicker] = React.useState({ level: "Local", name: "", role: "" });
  const [type, setType] = React.useState(writePrefill?.type || null);
  const [fields, setFields] = React.useState({ chapter: "", name: "", role: "Chapter member", age: "", city: "", grade: "", meetWhere: "", meetWhen: "", meetSize: "", incident: "" });
  const [generated, setGenerated] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const outRef = React.useRef(null);

  const activeOfficial = official || (picker.name.trim() ? { name: picker.name, role: picker.role, level: picker.level, contacts: {} } : null);
  const level = activeOfficial?.level || "Local";
  const canGenerate = !!activeOfficial && !!type && fields.chapter.trim() && fields.name.trim();

  const email = canGenerate ? buildEmail({ type, official: activeOfficial, fields }) : null;
  const bodyText = editing ? draft : (email?.body || "");

  const doGenerate = () => {
    if (!canGenerate) return;
    setGenerated(true);
    setEditing(false);
    setTimeout(() => outRef.current && outRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const recipientEmail = activeOfficial?.contacts?.email || "";
  const contactPortal = activeOfficial?.contacts?.form || activeOfficial?.contacts?.site || "";
  const isSenator = /senate/i.test(activeOfficial?.role || "") || /^sen\./i.test(activeOfficial?.name || "");
  const isRep = /house|representatives/i.test(activeOfficial?.role || "") || /^rep\./i.test(activeOfficial?.name || "");
  const portalLabel = isSenator ? "Open Senator's contact portal" : isRep ? "Open Representative's contact portal" : "Open contact form";
  const portalNote = isSenator
    ? "Senators take messages through their official contact portal, not a public email."
    : isRep
      ? "Representatives take messages through their official contact portal, not a public email."
      : "This office takes messages through an official contact form.";
  const portalUrl = contactPortal ? (/^https?:\/\//.test(contactPortal) ? contactPortal : "https://" + contactPortal) : "";

  const copy = () => {
    const toLine = recipientEmail ? `To: ${recipientEmail}\n` : "";
    const text = `${toLine}Subject: ${email.subject}\n\n${bodyText}`;
    navigator.clipboard && navigator.clipboard.writeText(text);
    toast(recipientEmail ? "Copied with the address. Paste it into your email app." : "Copied. You're one step from your first connection.");
  };

  const copyAddress = () => {
    if (!recipientEmail) return;
    navigator.clipboard && navigator.clipboard.writeText(recipientEmail);
    toast("Address copied. Paste it into the \u201cTo\u201d field.");
  };

  const openMail = () => {
    const url = "https://mail.google.com/mail/?view=cm&fs=1"
      + "&to=" + encodeURIComponent(recipientEmail)
      + "&su=" + encodeURIComponent(email.subject)
      + "&body=" + encodeURIComponent(bodyText);
    openTab(url);
  };

  const openPortal = () => {
    // The letter can't be injected into a .gov form, so put it on the clipboard
    // first \u2014 the teen just clicks the message box and pastes.
    navigator.clipboard && navigator.clipboard.writeText(bodyText);
    toast("Letter copied. In the form, click the message box and paste (Ctrl/Cmd-V).");
    setTimeout(() => openTab(portalUrl), 350);
  };

  const openTab = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const F = (k, label, opts = {}) => (
    <label className="field" style={{ margin: 0 }}>
      <span className="lab">{label} {opts.optional && <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>}</span>
      <input className="input" placeholder={opts.ph || ""} value={fields[k]} onChange={e => setFields({ ...fields, [k]: e.target.value })} />
    </label>
  );

  return (
    <div>
      <section className="tool-head">
        <div className="wrap center" style={{ position: "relative", maxWidth: 820 }}>
          <span className="eyebrow"><Chev size={13} /> Step 2 of 2 · Write</span>
          <h1 className="bx-pagetitle" style={{ marginTop: 12 }}>Let's write your first email.</h1>
          <p className="lead muted" style={{ marginTop: 16 }}>Warm, personal, and ready to send. Fill the blanks, we'll handle the rest.</p>
        </div>
      </section>

      <div className="wrap section-sm write-wrap">
        {/* STEP A, WHO */}
        <div className="wstep">
          <div className="wstep-label"><span className="wstep-n">A</span> Who are you writing to?</div>
          {activeOfficial && official ? (
            <div className="card pad picked-official">
              <div className="row gap2">
                <div className="feat-ico" style={{ width: 48, height: 48 }}><Icon name="users" size={22} /></div>
                <div>
                  <div className="h3" style={{ fontSize: 19 }}>{activeOfficial.name}</div>
                  <div className="small muted">{activeOfficial.role}</div>
                </div>
              </div>
              <div className="row gap1">
                <span className={`level ${level.toLowerCase()}`}>{level}</span>
                <button className="linkish small" onClick={() => { setOfficial(null); }}>Change</button>
              </div>
            </div>
          ) : (
            <div className="card pad">
              <p className="small muted" style={{ marginBottom: 14 }}>Carried from Find, or enter an official yourself.</p>
              <div className="manual-grid">
                <label className="field" style={{ margin: 0 }}>
                  <span className="lab">Level</span>
                  <select className="select" value={picker.level} onChange={e => setPicker({ ...picker, level: e.target.value })}>
                    <option>Local</option><option>State</option><option>Federal</option>
                  </select>
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span className="lab">Official's name</span>
                  <input className="input" placeholder="e.g. Rep. Jordan Lee" value={picker.name} onChange={e => setPicker({ ...picker, name: e.target.value })} />
                </label>
                <label className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
                  <span className="lab">Title / office <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
                  <input className="input" placeholder="e.g. State House, District 16" value={picker.role} onChange={e => setPicker({ ...picker, role: e.target.value })} />
                </label>
              </div>
              <p className="small muted" style={{ marginTop: 14 }}><button className="linkish" onClick={() => nav("find", { guided: true })}><Icon name="search" size={14} /> Find officials by ZIP instead</button></p>
            </div>
          )}
        </div>

        {/* STEP B, CONNECTION TYPE */}
        <div className="wstep">
          <div className="wstep-label"><span className="wstep-n">B</span> What kind of connection?</div>
          <div className="conn-grid">
            {CONNECTION_TYPES.map(t => (
              <button key={t.id} className={`conncard ${type === t.id ? "on" : ""}`} onClick={() => setType(t.id)}>
                <div className="conncard-top">
                  <span className="rungtag">Level {t.rung}</span>
                </div>
                <div className="conn-title">{t.label}</div>
                <div className="conn-sub">{t.sub}</div>
                {type === t.id && <div className="conn-check"><Icon name="check" size={15} stroke={3} /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* STEP C, FIELDS */}
        <div className="wstep">
          <div className="wstep-label"><span className="wstep-n">C</span> Fill in the blanks</div>
          <div className="card pad">
            <div className="manual-grid">
              {F("chapter", "Chapter name", { ph: "e.g. Liberty Bell BBYO" })}
              {F("name", "Your name", { ph: "e.g. Maya" })}
              {F("role", "Your role", { ph: "e.g. Chapter President" })}
              {F("city", "Your city", { ph: "e.g. Bethesda, MD" })}
              {type === "invite" && (
                <React.Fragment>
                  <div className="invite-extra-head" style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5, marginTop: 10, paddingTop: 18, borderTop: "1px solid var(--gray-line)" }}>
                    <span style={{ textTransform: "uppercase", letterSpacing: ".06em", fontSize: 12, fontWeight: 700, color: "var(--blue-deep)" }}>Meeting details</span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--gray)", maxWidth: 620 }}>The more an official knows up front, the easier it is to say yes. All optional, but each one makes the invitation stronger.</span>
                  </div>
                  <label className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
                    <span className="lab">Where you meet <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
                    <input className="input" placeholder="e.g. the Bender JCC, 6125 Montrose Rd, Rockville" value={fields.meetWhere} onChange={e => setFields({ ...fields, meetWhere: e.target.value })} />
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span className="lab">When you meet <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
                    <input className="input" placeholder="e.g. the third Sunday each month, 7pm" value={fields.meetWhen} onChange={e => setFields({ ...fields, meetWhen: e.target.value })} />
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span className="lab">Average attendance <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
                    <input className="input" type="number" min="1" placeholder="e.g. 30" value={fields.meetSize} onChange={e => setFields({ ...fields, meetSize: e.target.value.replace(/[^0-9]/g, "") })} />
                  </label>
                </React.Fragment>
              )}
              <label className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
                <span className="lab">Reference a local incident <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
                <input className="input" placeholder="e.g. recent graffiti at our community center" value={fields.incident} onChange={e => setFields({ ...fields, incident: e.target.value })} />
                <span className="help">Only if it feels right. Keep it factual and brief.</span>
              </label>
            </div>
            <div className="row gap1 tone-note">
              <Icon name="info" size={17} style={{ color: "var(--blue)" }} /> <span className="small muted">{TONE_BY_LEVEL[level]}</span>
            </div>
            {!generated && (
              <div style={{ marginTop: 20 }}>
                <Button size="lg" icon="sparkle" chevron onClick={doGenerate} disabled={!canGenerate}>Generate my email</Button>
                {!canGenerate && <p className="small muted" style={{ marginTop: 10 }}>Pick an official, a connection type, and fill your chapter and name to generate.</p>}
              </div>
            )}
          </div>
        </div>

        {/* OUTPUT */}
        {generated && email && (
          <div className="wstep fadein" ref={outRef}>
            <div className="wstep-label"><span className="wstep-n" style={{ background: "var(--blue)" }}><Icon name="check" size={15} stroke={3} /></span> Your email is ready</div>

            {/* email panel */}
            <div className="email-panel card">
              <div className="email-bar">
                <div className="row gap1"><Icon name="mail" size={18} style={{ color: "var(--blue)" }} /> <span style={{ fontWeight: 600, color: "var(--blue-deep)" }}>Draft email</span></div>
                <button className="linkish small" onClick={() => { setEditing(e => { const ne = !e; if (ne) setDraft(email.body); return ne; }); }}>
                  <Icon name={editing ? "check" : "edit"} size={14} /> {editing ? "Done editing" : "Edit text"}
                </button>
              </div>
              <div className="email-meta">
                <div className="email-row">
                  <span className="em-lab">To</span>
                  {recipientEmail ? (
                    <span className="row gap1" style={{ alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--blue-deep)" }}>{activeOfficial.name}</span>
                      <span className="to-email">{recipientEmail}</span>
                      <button className="linkish small" onClick={copyAddress}><Icon name="copy" size={13} /> Copy address</button>
                    </span>
                  ) : portalUrl ? (
                    <span className="row gap1" style={{ alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--blue-deep)" }}>{activeOfficial.name}</span>
                      <span className="small muted">{portalNote}</span>
                    </span>
                  ) : (
                    <span className="row gap1" style={{ alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--blue-deep)" }}>{activeOfficial.name}</span>
                      <span className="small muted">No address on file — look it up on their official page before sending.</span>
                    </span>
                  )}
                </div>
                <div className="email-row"><span className="em-lab">Subject</span><span style={{ fontWeight: 600, color: "var(--blue-deep)" }}>{email.subject}</span></div>
              </div>
              {editing ? (
                <textarea className="input" style={{ minHeight: 320, fontFamily: "inherit" }} value={draft} onChange={e => setDraft(e.target.value)} />
              ) : (
                <pre className="email-body">{bodyText}</pre>
              )}
              <div className="email-foot">
                <span className="small muted"><Icon name="check" size={15} style={{ color: "var(--blue)" }} /> Warm and ready, about {bodyText.trim().split(/\s+/).length} words</span>
              </div>
            </div>

            {/* actions */}
            <div className="email-actions">
              <Button icon="copy" onClick={copy}>Copy letter</Button>
              {recipientEmail ? (
                <Button variant="secondary" icon="send" onClick={openMail}>Open in Gmail</Button>
              ) : portalUrl ? (
                <Button variant="secondary" icon="send" onClick={openPortal}>{portalLabel}</Button>
              ) : null}
            </div>
            {!recipientEmail && portalUrl && (
              <p className="small muted" style={{ marginTop: 10, maxWidth: 560 }}>
                <Icon name="info" size={14} style={{ color: "var(--blue)" }} /> {activeOfficial.name.split(" ").slice(0, 2).join(" ")}'s office only accepts messages through their own secure portal, so we can't auto-fill it for you. We'll copy your letter to the clipboard when the portal opens — just click the message box and paste.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
window.WritePage = WritePage;
