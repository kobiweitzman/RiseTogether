/* =========================================================================
   Rise Together, Home — BBYO Summer Experiences visual language
   Arched hero · big black welcome · two-up cards w/ cyan blobs ·
   tilted-photo sections · cyan-circle values row
   ========================================================================= */
function HomePage({ ctx }) {
  const { nav } = ctx;

  const IMG = {
    crowd: "images/crowd-we-remember.png",
    huddle: "images/huddle.png",
    highfive: "images/highfive.png",
    teens: "images/two-teens.png",
  };
  const bg = (src, pos = "center") => ({
    backgroundImage: `url("${src}")`, backgroundSize: "cover",
    backgroundPosition: pos, backgroundRepeat: "no-repeat",
  });

  const stats = [
    { n: "70,000", l: "Jewish teens" },
    { n: "65", l: "countries" },
    { n: "700+", l: "chapters" },
  ];

  const values = [
    { icon: "users", title: "Community", text: "Chapters build a network of leaders who know them by name, a relationship that outlasts any one teen." },
    { icon: "handshake", title: "Relationships", text: "We help you reach out warmly and build real, ongoing connections, not one-off messages." },
    { icon: "star", title: "Credibility", text: "When a teen speaks up for their community, leaders listen. Your voice carries weight a form letter never could." },
    { icon: "shield", title: "Preparation", text: "Be known before a crisis. The person who can help in a hard moment is one you've already met." },
  ];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="bx-hero">
        <div className="bx-hero-inner">
          <div className="bx-hero-photo has-img" style={bg(IMG.crowd, "center 38%")} data-label="BBYO teens together, joyful and proud">
            <h1 className="bx-hero-title">Rise Together</h1>
            <p className="bx-hero-sub">A BBYO initiative to help combat antisemitism, building relationships with the leaders who can protect your community before you ever need them.</p>
            <div style={{ marginTop: 36 }}>
              <Button size="lg" variant="cyan" chevron onClick={() => nav("find", { guided: true })}>Find Your Officials</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WELCOME ============ */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="bx-wrap bx-welcome">
          <h2>Welcome to Rise Together</h2>
          <p>
            Rise Together is a BBYO initiative to help combat antisemitism. By building real relationships with the
            local, state, and national leaders who represent your community now, your chapter makes sure that if
            something ever does happen, you already have people to turn to: not strangers, but leaders who know you by
            name. Whatever your starting point, we make that first step simple, safe, and genuinely yours.
          </p>
          <div className="bx-btns">
            <Button size="lg" chevron onClick={() => nav("how")}>See How It Works</Button>
            <Button size="lg" chevron onClick={() => nav("find", { guided: true })}>Start Your Journey</Button>
          </div>
        </div>
      </section>

      {/* ============ STAT STRIP ============ */}
      <section style={{ background: "#fff", paddingBottom: 8 }}>
        <div className="bx-wrap">
          <div className="bx-stats">
            {stats.map(s => (
              <div key={s.l} className="bx-stat">
                <div className="n">{s.n}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TWO EXPERIENCE CARDS ============ */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="bx-wrap">
          <div className="exp-grid">
            {/* Card 1 — Find */}
            <div className="exp-card">
              <div className="photo-ph has-img" style={bg(IMG.huddle, "center 35%")}></div>
              <h3>Find Your Officials</h3>
              <p className="lead-p">
                In a few minutes, see exactly who represents your chapter, from your city council all the way to
                Congress, with the names, roles, and contact details you need to reach them.
              </p>
              <div className="exp-details">
                <div><strong>Who:</strong> Any BBYO chapter</div>
                <div><strong>Levels:</strong> Local · State · Federal</div>
                <div><strong>Time:</strong> About 20 minutes</div>
              </div>
              <ul className="exp-links">
                <li><a onClick={() => nav("find", { guided: true })}>Local leaders</a></li>
                <li><a onClick={() => nav("find", { guided: true })}>State legislators</a></li>
                <li><a onClick={() => nav("find", { guided: true })}>Members of Congress</a></li>
              </ul>
              <div className="exp-cta">
                <Button chevron onClick={() => nav("find", { guided: true })}>Find Officials</Button>
              </div>
            </div>

            {/* Card 2 — Write */}
            <div className="exp-card">
              <div className="photo-ph has-img" style={bg(IMG.highfive)}></div>
              <h3>Write &amp; Connect</h3>
              <p className="lead-p">
                Send a warm, personal introduction, never a form letter. Every message is built for an advisor to
                review first, so your chapter always reaches out safely and sounds like you.
              </p>
              <div className="exp-details">
                <div><strong>Tone:</strong> Warm &amp; personal</div>
                <div><strong>Review:</strong> Advisor-approved</div>
                <div><strong>Goal:</strong> Reach Rung 1: be known</div>
              </div>
              <ul className="exp-links">
                <li><a onClick={() => nav("write", { guided: true })}>Introduce your chapter</a></li>
                <li><a onClick={() => nav("write", { guided: true })}>Invite them to visit</a></li>
                <li><a onClick={() => nav("write", { guided: true })}>Follow up &amp; thank</a></li>
              </ul>
              <div className="exp-cta">
                <Button chevron onClick={() => nav("write", { guided: true })}>Start Writing</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS (tilted photo) ============ */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="bx-wrap">
          <div className="tilt-section">
            <div className="tilt-media">
              <div className="photo-ph has-img" style={bg(IMG.teens, "center 28%")}></div>
            </div>
            <div className="tilt-copy">
              <h2>How It Works</h2>
              <p>
                We make the whole process as smooth and simple as possible. Find your officials, write a warm
                introduction, and track every connection as it climbs the Connection Ladder, from “on the radar” to a
                standing relationship. Three small steps, one short session.
              </p>
              <Button size="lg" chevron onClick={() => nav("how")}>See the Steps</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="cta-band">
        <ChevronField color="#ffffff" opacity={0.08} />
        <div className="wrap center" style={{ position: "relative" }}>
          <h2 className="h1" style={{ color: "#fff" }}>Your chapter can take the first step today.</h2>
          <div style={{ marginTop: 28 }}>
            <Button size="lg" variant="cyan" chevron onClick={() => nav("find", { guided: true })}>Get started</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
window.HomePage = HomePage;
