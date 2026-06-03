/* =========================================================================
   Rise Together, App shell: nav, footer, router, shared journey state
   ========================================================================= */
const { useState: useS, useEffect: useE } = React;

const ROUTES = [
  { id: "home", label: "Home" },
  { id: "how", label: "How It Works" },
  { id: "find", label: "Find Officials" },
  { id: "write", label: "Write" },
];
const NAV_LINKS = ["how", "find", "write"];

/* ---------- Logo ---------- */
function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} role="link" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}>
      <img className="mark-img" src="images/bbyo-menorah.png" alt="BBYO" />
      <div className="stack">
        <span className="wm">Rise Together</span>
        <span className="sub">A BBYO Program</span>
      </div>
    </div>
  );
}

/* ---------- Guided flow bar ---------- */
function FlowBar({ route, nav }) {
  const steps = [
    { id: "find", n: 1, label: "Find" },
    { id: "write", n: 2, label: "Write" },
  ];
  const idx = steps.findIndex(s => s.id === route);
  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 2, display: "flex", justifyContent: "center" }}>
      <div className="flowbar" role="navigation" aria-label="Guided journey progress">
        {steps.map((s, i) => {
          const state = i < idx ? "done" : i === idx ? "active" : "";
          return (
            <button key={s.id} className={`flowstep ${state}`} onClick={() => nav(s.id, { guided: true })}>
              <span className="dot">{i < idx ? <Icon name="check" size={14} stroke={3} /> : s.n}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Nav ---------- */
function Nav({ route, nav, guided }) {
  const [open, setOpen] = useS(false);
  useE(() => { setOpen(false); }, [route]);
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Logo onClick={() => nav("home")} />
          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map(id => (
              <a key={id} className={route === id ? "active" : ""} onClick={() => nav(id)}>
                {ROUTES.find(r => r.id === id).label}
              </a>
            ))}
          </nav>
          <div className="nav-cta">
            <Button className="hide-sm" chevron onClick={() => nav("find", { guided: true })}>Get started</Button>
            <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
              <Icon name={open ? "x" : "menu"} size={24} />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-menu fadein">
          {NAV_LINKS.map(id => (
            <a key={id} className={route === id ? "active" : ""} onClick={() => nav(id)}>
              {ROUTES.find(r => r.id === id).label}
            </a>
          ))}
          <div style={{ padding: "16px 24px" }}>
            <Button className="block" chevron onClick={() => nav("find", { guided: true })}>Get started</Button>
          </div>
        </div>
      )}
      {guided && NAV_LINKS.includes(route) && ["find", "write"].includes(route) && <FlowBar route={route} nav={nav} />}
    </>
  );
}

/* ---------- Footer ---------- */
function Footer({ nav }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="logo" style={{ marginBottom: 14 }}>
              <div className="mark" style={{ background: "#fff" }}><img src="images/bbyo-menorah.png" alt="BBYO" style={{ width: 27, height: 27, objectFit: "contain" }} /></div>
              <div className="stack">
                <span className="wm" style={{ color: "#fff" }}>Rise Together</span>
                <span className="sub" style={{ color: "#9aa0c8" }}>A BBYO Program</span>
              </div>
            </div>
            <p className="fine" style={{ maxWidth: 280 }}>
              Helping BBYO chapters build real relationships with their local officials, before a crisis. Part of <strong style={{ color: "#fff" }}>Here We Stand</strong> and BBYO, the world's largest Jewish teen movement.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            {["home", "how"].map(id => (
              <a key={id} onClick={() => nav(id)}>{ROUTES.find(r => r.id === id).label}</a>
            ))}
          </div>
          <div>
            <h4>The tools</h4>
            <a onClick={() => nav("find")}>Find Your Officials</a>
            <a onClick={() => nav("write")}>Write Your Message</a>
          </div>
        </div>
        <div className="rule" />
        <p className="fine">
          Rise Together is non-partisan and welcomes chapters and leaders across the political spectrum. © {new Date().getFullYear()} BBYO · A prototype for the Rise Together program.
        </p>
      </div>
    </footer>
  );
}

/* ---------- App / router ---------- */
function App() {
  const [route, setRoute] = useS(() => (location.hash.replace("#", "") || "home"));
  const [guided, setGuided] = useS(false);
  const [official, setOfficial] = useS(null);          // carried Find -> Write
  const [writePrefill, setWritePrefill] = useS(null);  // {type}
  const [connections, setConnections] = useS(() => {
    try { const s = localStorage.getItem("rt_connections"); if (s) return JSON.parse(s); } catch (e) {}
    return SAMPLE_CONNECTIONS;
  });
  const [toast, toastNode] = useToast();

  useE(() => { try { localStorage.setItem("rt_connections", JSON.stringify(connections)); } catch (e) {} }, [connections]);
  useE(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const nav = (id, opts = {}) => {
    if (opts.guided !== undefined) setGuided(opts.guided);
    if (id === "home" && opts.guided === undefined) setGuided(false);
    location.hash = id;
    setRoute(id);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const addConnection = (c) => setConnections(list => [{ ...c, id: "c" + Date.now() }, ...list]);
  const updateConnection = (id, patch) => setConnections(list => list.map(c => c.id === id ? { ...c, ...patch } : c));
  const deleteConnection = (id) => setConnections(list => list.filter(c => c.id !== id));
  const resetConnections = () => setConnections(SAMPLE_CONNECTIONS);

  const ctx = {
    nav, guided, setGuided, official, setOfficial, writePrefill, setWritePrefill,
    connections, addConnection, updateConnection, deleteConnection, resetConnections, toast,
  };

  const Page = {
    home: HomePage, how: HowPage, find: FindPage, write: WritePage,
  }[route] || HomePage;

  return (
    <>
      <Nav route={route} nav={nav} guided={guided} />
      <main key={route}>
        <Page ctx={ctx} />
      </main>
      <Footer nav={nav} />
      {toastNode}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
