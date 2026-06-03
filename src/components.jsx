/* =========================================================================
   Rise Together, Shared components & line-icon set (Lucide-style, 2px stroke)
   ========================================================================= */
const { useState, useEffect, useRef, createElement: h } = React;

/* ---------- Icons ---------- */
function Icon({ name, size = 22, stroke = 2, className, style }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" {...p}/><line x1="16.5" y1="16.5" x2="21" y2="21" {...p}/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" {...p}/><path d="M3.5 7l8.5 6 8.5-6" {...p}/></>,
    phone: <path d="M5 4h3l1.5 5-2 1.5a12 12 0 006 6l1.5-2 5 1.5v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" {...p}/>,
    globe: <><circle cx="12" cy="12" r="9" {...p}/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" {...p}/></>,
    users: <><circle cx="9" cy="8" r="3.4" {...p}/><path d="M3.5 19a5.5 5.5 0 0111 0M16 5.5a3.4 3.4 0 010 6.4M20.5 19a5.5 5.5 0 00-4-5.3" {...p}/></>,
    pin: <><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" {...p}/><circle cx="12" cy="10" r="2.6" {...p}/></>,
    check: <path d="M5 12.5l4.5 4.5L19 7" {...p}/>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" {...p}/><path d="M5 15H4.5A1.5 1.5 0 013 13.5v-9A1.5 1.5 0 014.5 3h9A1.5 1.5 0 0115 4.5V5" {...p}/></>,
    chevUp: <path d="M5 15l7-7 7 7" {...p}/>,
    chevRight: <path d="M9 5l7 7-7 7" {...p}/>,
    arrowRight: <><line x1="4" y1="12" x2="19" y2="12" {...p}/><path d="M13 6l6 6-6 6" {...p}/></>,
    building: <><rect x="5" y="3" width="14" height="18" rx="1.5" {...p}/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" {...p}/></>,
    flag: <><path d="M5 21V4M5 4l9-1 5 2-2 4 2 4-5 2-9-1" {...p}/></>,
    landmark: <><path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10h18L12 3 3 10z" {...p}/></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" {...p}/><path d="M9 12l2 2 4-4" {...p}/></>,
    star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z" {...p}/>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" {...p}/><line x1="5" y1="12" x2="19" y2="12" {...p}/></>,
    edit: <><path d="M14 5l5 5M4 20l1-4L16 5l3 3L8 19l-4 1z" {...p}/></>,
    trash: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" {...p}/></>,
    download: <><path d="M12 3v12M7 11l5 5 5-5M5 20h14" {...p}/></>,
    print: <><path d="M7 9V3h10v6M7 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2" {...p}/><rect x="7" y="14" width="10" height="6" {...p}/></>,
    x: <><line x1="6" y1="6" x2="18" y2="18" {...p}/><line x1="18" y1="6" x2="6" y2="18" {...p}/></>,
    menu: <><line x1="4" y1="7" x2="20" y2="7" {...p}/><line x1="4" y1="12" x2="20" y2="12" {...p}/><line x1="4" y1="17" x2="20" y2="17" {...p}/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2" {...p}/><path d="M4 9h16M8 3v4M16 3v4" {...p}/></>,
    chat: <path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 4V6a1 1 0 011-1z" {...p}/>,
    handshake: <><path d="M11 7.5L7.5 6 3 9.5l3 4.5" {...p}/><path d="M13 7.5L16.5 6 21 9.5l-3 4.5" {...p}/><path d="M6 14l4.5-2.5 1.5 1 1.5-1L18 14" {...p}/><path d="M9.5 12l2 2a1.3 1.3 0 001.8 0l1.2-1.2" {...p}/></>,
    sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" {...p}/>,
    write: <><path d="M4 20h16M6 16l8.5-8.5a2.1 2.1 0 013 3L9 19l-4 1 1-4z" {...p}/></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" {...p}/><circle cx="4" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none"/></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" {...p}/><path d="M8 11V8a4 4 0 018 0v3" {...p}/></>,
    info: <><circle cx="12" cy="12" r="9" {...p}/><path d="M12 11v5M12 8h.01" {...p}/></>,
    alert: <><path d="M12 3l9 16H3l9-16z" {...p}/><path d="M12 10v4M12 17h.01" {...p}/></>,
    link: <path d="M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1" {...p}/>,
    heart: <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0112 7a3.8 3.8 0 017 3.5C19 15.5 12 20 12 20z" {...p}/>,
    refresh: <path d="M4 11a8 8 0 0114-4l2 2M20 13a8 8 0 01-14 4l-2-2M17 5v4h-4M7 19v-4h4" {...p}/>,
    send: <path d="M21 4L3 11l7 2 2 7 9-16z" {...p}/>,
    target: <><circle cx="12" cy="12" r="8.5" {...p}/><circle cx="12" cy="12" r="4.5" {...p}/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></>,
    compass: <><circle cx="12" cy="12" r="9" {...p}/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p}/></>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden="true">{paths[name]}</svg>;
}

/* ---------- Chevron mark (removed site-wide per brand direction) ---------- */
function Chev() {
  return null;
}

/* Chevron pattern background (removed site-wide) */
function ChevronField() {
  return null;
}

/* ---------- Button ---------- */
function Button({ children, variant = "primary", size, chevron, icon, onClick, disabled, className = "", type = "button", ...rest }) {
  const v = { primary: "", secondary: "btn-sec", ghost: "btn-ghost", white: "btn-white", cyan: "btn-cyan", "secondary-deep": "btn-sec on-deep" }[variant] || "";
  return (
    <button type={type} className={`btn ${v} ${size === "lg" ? "lg" : ""} ${className}`} onClick={onClick} disabled={disabled} {...rest}>
      {icon && <Icon name={icon} size={19} />}
      {children}
      {chevron && <Chev size={15} />}
    </button>
  );
}

/* ---------- Connection Ladder ----------
   rungs: array of 3 labels; current: 1..3 (current rung, in progress);
   completed rungs (< current) shown solid blue; current rung gets seltzer accent.
   variant: "full" (labeled, big) | "preview" | "mini" (badge row) */
const LADDER = [
  { n: 1, title: "On the Radar", desc: "They know your chapter exists and you have a reply. The foundation, and a real win." },
  { n: 2, title: "A Real Conversation", desc: "A call, a short meeting, or a real back-and-forth has happened." },
  { n: 3, title: "A Standing Relationship", desc: "An ongoing connection, or a visit to your chapter." },
];

function ConnectionLadder({ current = 1, variant = "full", animate = false }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(!animate);
  useEffect(() => {
    if (!animate || !ref.current) return;
    const io = new IntersectionObserver((es) => { es.forEach(e => e.isIntersecting && setShown(true)); }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [animate]);

  const rungState = (n) => n < current ? "done" : n === current ? "current" : "todo";

  if (variant === "mini") {
    return (
      <div className="row gap1" role="img" aria-label={`Connection Ladder, currently at Rung ${current}`}>
        {LADDER.map(r => {
          const st = rungState(r.n);
          return <span key={r.n} className={`ladder-pip ${st}`} title={`Rung ${r.n}: ${r.title}`}>{r.n}</span>;
        })}
      </div>
    );
  }

  return (
    <div className={`ladder ${variant}`} ref={ref}>
      {[...LADDER].reverse().map((r, i) => {
        const st = rungState(r.n);
        const delay = (LADDER.length - 1 - i) * 0.12;
        return (
          <div key={r.n}
            className={`rung ${st} ${shown ? "in" : ""}`}
            style={{ transitionDelay: `${delay}s` }}>
            <div className="rung-chev"><span style={{ fontFamily: "var(--font-display)", fontSize: variant === "full" ? 24 : 18, lineHeight: 1 }}>{r.n}</span></div>
            <div className="rung-body">
              <div className="rung-top">
                <span className="rung-num">Level {r.n}</span>
                {st === "current" && <span className="rung-flag">You're here</span>}
                {st === "done" && <span className="rung-flag done"><Icon name="check" size={13} stroke={3}/> Reached</span>}
              </div>
              <div className="rung-title">{r.title}</div>
              {variant === "full" && <div className="rung-desc">{r.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Rung badge for cards/rows */
function RungBadge({ rung }) {
  const titles = { 1: "On the Radar", 2: "A Real Conversation", 3: "A Standing Relationship" };
  return (
    <span className={`rungbadge r${rung}`}>
      <Chev size={13} stroke={2.8}/> Rung {rung} · {titles[rung]}
    </span>
  );
}

/* ---------- Section header ---------- */
function SectionHead({ eyebrow, title, sub, center, light }) {
  return (
    <div className={`stack ${center ? "center" : ""}`} style={{ gap: 14, maxWidth: center ? 720 : "none", margin: center ? "0 auto" : 0 }}>
      {eyebrow && <span className="eyebrow" style={light ? { color: "#9fb0ff" } : {}}><Chev size={13}/> {eyebrow}</span>}
      <h2 className="h2 bx-sec-title" style={light ? { color: "#fff" } : {}}>{title}</h2>
      {sub && <p className="lead" style={light ? { color: "#cdd3f0" } : {}}>{sub}</p>}
    </div>
  );
}

/* ---------- Toast ---------- */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg) => {
    const id = Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  };
  const node = (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className="toast"><Chev size={15}/> {t.msg}</div>)}
    </div>
  );
  return [push, node];
}

/* ---------- Divider ---------- */
function ChevDivider() {
  return null;
}

/* ---------- Download a generated file ---------- */
function downloadFile(name, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

Object.assign(window, { Icon, Chev, ChevronField, Button, ConnectionLadder, RungBadge, SectionHead, useToast, ChevDivider, LADDER, downloadFile });
