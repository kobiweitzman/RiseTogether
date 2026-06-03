/* =========================================================================
   Rise Together, How It Works
   ========================================================================= */
function HowPage({ ctx }) {
  const { nav } = ctx;

  const reasons = [
    { icon: "building", title: "Relationships are infrastructure", body: "The relationship is the thing that works in an emergency, not a cold contact form. You build it once and it's there when you need it." },
    { icon: "users", title: "Officials want to know you", body: "Elected leaders and their staff genuinely want to hear from the young constituents they serve. Reaching out is welcome, not a bother." },
    { icon: "star", title: "Teens are credible messengers", body: "A teenager speaking up for their own community is powerful and memorable in a way no adult lobbyist can match." },
  ];

  const fiveSteps = [
    { icon: "search", title: "Find your officials", body: "Enter a ZIP or address and see your local, state, and federal officials at once.", to: "find", cta: "Open Find" },
    { icon: "write", title: "Write your message", body: "Generate a short, warm, ready-to-send email matched to the official and the connection you want.", to: "write", cta: "Open Write" },
    { icon: "handshake", title: "Connect", body: "Send your email and start the relationship, even a reply is a win.", to: "find", cta: "Start now" },
  ];

  return (
    <div>
      {/* header */}
      <section className="bx-pagehead">
        <div className="wrap center" style={{ position: "relative", maxWidth: 820 }}>
          <span className="eyebrow"><Chev size={13} /> Why this works</span>
          <h1 className="bx-pagetitle" style={{ marginTop: 14 }}>How It Works</h1>
          <p className="lead muted" style={{ marginTop: 16 }}>
            Build the relationship before you need it. Here's why that matters, how the Connection Ladder works, and the steps your chapter will take.
          </p>
        </div>
      </section>

      {/* WHY, three reasons */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <SectionHead eyebrow="Why relationships before a crisis" title="Three reasons this matters now." />
          <div className="grid cards-3" style={{ marginTop: 40 }}>
            {reasons.map((c, i) => (
              <div key={c.title} className="card pad stack" style={{ gap: 14 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="feat-ico"><Icon name={c.icon} size={26} /></div>
                  <span className="bignum">{i + 1}</span>
                </div>
                <h3 className="h3">{c.title}</h3>
                <p className="muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LADDER FULL */}
      <section className="section" style={{ background: "var(--cloud)" }}>
        <div className="wrap ladder-grid">
          <div className="stack" style={{ gap: 20, position: "sticky", top: 96, alignSelf: "start" }}>
            <SectionHead eyebrow="The Connection Ladder" title="Three levels you can climb." sub="You don't have to reach the top to succeed. Each level is a real, countable win for your chapter." />
            <div className="callout warn">
              <Icon name="target" size={24} className="ico" />
              <span>
                <strong>The staffer is the real target.</strong> The person who answers in a crisis is usually a staff member, not the official. Building that relationship is not a consolation prize, it is the actual win.
              </span>
            </div>
            <div><Button chevron onClick={() => nav("find", { guided: true })}>Start climbing</Button></div>
          </div>
          <ConnectionLadder current={2} variant="full" animate />
        </div>
      </section>

      {/* FIVE STEPS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <SectionHead center eyebrow="The steps" title="What your chapter actually does." />
          <div className="stack" style={{ gap: 16, marginTop: 40, maxWidth: 820, marginInline: "auto" }}>
            {fiveSteps.map((s, i) => (
              <div key={s.title} className="howstep card">
                <div className="howstep-num">{i + 1}</div>
                <div className="howstep-ico"><Icon name={s.icon} size={26} /></div>
                <div className="howstep-body">
                  <h3 className="h3">{s.title}</h3>
                  <p className="muted" style={{ marginTop: 4 }}>{s.body}</p>
                </div>
                <Button variant="secondary" onClick={() => nav(s.to, { guided: true })}>{s.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <ChevronField color="#ffffff" opacity={0.08} />
        <div className="wrap center" style={{ position: "relative" }}>
          <h2 className="h1" style={{ color: "#fff" }}>Ready? It starts with one search.</h2>
          <div style={{ marginTop: 24 }}>
            <Button size="lg" variant="white" chevron onClick={() => nav("find", { guided: true })}>Find your officials</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
window.HowPage = HowPage;
