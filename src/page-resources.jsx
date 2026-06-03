/* =========================================================================
   Rise Together, Resources & Help
   ========================================================================= */
function ResourcesPage({ ctx }) {
  const { nav, toast } = ctx;
  const [openFaq, setOpenFaq] = React.useState(0);

  const safety = [
    { icon: "shield", t: "Advisor or BBYO review", s: "Have your advisor or BBYO Marketing read your email before it goes out. The Write tool reminds you every time." },
    { icon: "users", t: "Never one-on-one", s: "Any in-person meeting includes an advisor present or nearby, never a teen alone with an official." },
    { icon: "pin", t: "Public or professional settings", s: "Meet at an office, a community center, or another public place. Never a private home." },
  ];

  return (
    <div>
      <section className="tool-head">
        <div className="wrap center" style={{ position: "relative", maxWidth: 820 }}>
          <span className="eyebrow"><Chev size={13} /> Resources &amp; help</span>
          <h1 className="bx-pagetitle" style={{ marginTop: 12 }}>Everything to do this safely and well.</h1>
          <p className="lead muted" style={{ marginTop: 16 }}>Because you're teens reaching out to adults in authority, safety is built into the program, not bolted on.</p>
        </div>
      </section>

      {/* SAFETY */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap" id="safety">
          <SectionHead eyebrow="Safety" title="The rules that keep this safe." sub="A few simple commitments. Follow them every time and you can't get it wrong." />
          <div className="safety-grid" style={{ marginTop: 36 }}>
            {safety.map(x => (
              <div key={x.t} className="card pad row gap2" style={{ alignItems: "flex-start" }}>
                <div className="feat-ico" style={{ width: 48, height: 48, flex: "0 0 auto" }}><Icon name={x.icon} size={22} /></div>
                <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--blue-deep)", fontSize: 17 }}>{x.t}</div><p className="muted small" style={{ marginTop: 4 }}>{x.s}</p></div>
              </div>
            ))}
          </div>
          <div className="callout warn" style={{ marginTop: 24 }}>
            <Icon name="alert" size={24} className="ico" />
            <span><strong>Facing a crisis right now?</strong> This tool is for building relationships before an emergency. If your community is facing an immediate safety concern, contact your advisor, local police, and BBYO Marketing right away.</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--cloud)" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <SectionHead center eyebrow="FAQ" title="Questions chapters ask." />
          <div className="stack" style={{ gap: 12, marginTop: 36 }}>
            {FAQ.map((f, i) => (
              <div key={i} className={`faq card ${openFaq === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                  <span>{f.q}</span>
                  <Icon name={openFaq === i ? "chevUp" : "chevRight"} size={20} style={{ color: "var(--blue)", flex: "0 0 auto" }} />
                </button>
                {openFaq === i && <div className="faq-a fadein">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOADS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <SectionHead eyebrow="Downloads" title="Templates to make it easy." />
          <div className="dl-grid" style={{ marginTop: 32 }}>
            {DOWNLOADS.map(d => (
              <div key={d.id} className="card pad dl-card">
                <div className="feat-ico"><Icon name={d.icon} size={24} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--blue-deep)", fontSize: 16.5 }}>{d.title}</div>
                  <p className="small muted" style={{ marginTop: 4 }}>{d.desc}</p>
                </div>
                <Button variant="secondary" icon="download" onClick={() => { const t = TEMPLATE_FILES[d.id]; if (t) { downloadFile(t.name, t.content, t.mime); toast("Downloading " + d.title); } }}>Get it</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FOR REVIEW + ABOUT */}
      <section className="section" style={{ background: "var(--cyan-100)" }}>
        <div className="wrap res-bottom">
          <div className="card pad stack" style={{ gap: 14, background: "#fff" }}>
            <div className="feat-ico"><Icon name="chat" size={24} /></div>
            <h3 className="h2">Get a review from BBYO</h3>
            <p className="muted">Want a second pair of eyes before you send? BBYO Marketing is happy to review your email. Send your draft and let us know you submitted, we'll get back to you.</p>
            <div className="wrapflex gap2" style={{ marginTop: 4 }}>
              <Button icon="send" onClick={() => { window.location.href = "mailto:marketing@bbyo.org?subject=" + encodeURIComponent("Rise Together: email for review") + "&body=" + encodeURIComponent("Hi BBYO Marketing,\n\nOur chapter would like a quick review of an email before we send it. Our draft is below.\n\nChapter:\nOfficial:\n\n--- Draft ---\n\n"); toast("Opening your email app for a review request"); }}>Send for review</Button>
              <Button variant="secondary" onClick={() => nav("write", { guided: true })}>Back to Write</Button>
            </div>
          </div>
          <div className="card pad stack" style={{ gap: 14, background: "var(--blue-deep)", position: "relative", overflow: "hidden" }}>
            <ChevronField color="#ffffff" opacity={0.07} />
            <div style={{ position: "relative" }}>
              <span className="eyebrow" style={{ color: "#9fb0ff" }}><Chev size={13} /> About</span>
              <h3 className="h2" style={{ color: "#fff", marginTop: 12 }}>Hinei Anachnu, Here We Stand.</h3>
              <p style={{ color: "#cdd3f0", marginTop: 12 }}>Rise Together is part of <strong style={{ color: "#fff" }}>Here We Stand</strong>, BBYO's movement to meet rising antisemitism with pride, presence, and preparation. The best time to be known by the leaders who can help is long before you ever need them.</p>
              <p style={{ color: "#cdd3f0", marginTop: 12 }}>You don't have to wait for a crisis to matter. You can take the first step today.</p>
              <div style={{ marginTop: 18 }}>
                <Button variant="white" chevron onClick={() => nav("find", { guided: true })}>Start your first connection</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.ResourcesPage = ResourcesPage;
