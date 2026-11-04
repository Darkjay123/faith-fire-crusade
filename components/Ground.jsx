"use client";
import { useEffect, useRef, useState } from "react";
import { SITE } from "../lib/config";

/* The Ground — an explorable night view of the crusade ground.
   Wide view shows the whole ground; each flame hotspot zooms the camera
   into one place and opens its panel. #site returns to the scroll site. */

const STATIONS = {
  stage: { origin: "50% 34%", scale: 2.5, label: "The Stage" },
  screen: { origin: "50% 26%", scale: 3.1, label: "Programme" },
  gate: { origin: "63% 82%", scale: 2.3, label: "The Gate" },
  fire: { origin: "30% 78%", scale: 2.3, label: "Fire Altars" },
  gallery: { origin: "82% 60%", scale: 2.2, label: "Moments" },
  roads: { origin: "50% 52%", scale: 0.82, label: "Directions" },
};

const PHOTOS = [
  ["img/ground_crowd_2024.jpg", "The ground fills up — night one"],
  ["img/ground_crowd_2025.jpg", "Hands raised across the field"],
  ["img/ground_preacher.jpg", "The Word goes out"],
  ["img/ground_worship_lead.jpg", "Worship under the lights"],
  ["img/ground_stage_band.jpg", "The band at full strength"],
  ["img/ground_praise_set.jpg", "Praise on the crusade ground"],
  ["img/ground_crowd_stage.jpg", "Deep into the night"],
];

const SITE_SECTIONS = ["register", "testimony", "gallery", "nights", "invite", "live", "venue", "prayer", "top"];

function msToNext() {
  const now = Date.now();
  let next = null;
  for (const d of SITE.days) {
    const t = new Date(d.start).getTime();
    if (t > now && (next === null || t < next)) next = t;
  }
  if (next === null) return null;
  const s = Math.floor((next - now) / 1000);
  const dd = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return `${dd}d ${p(hh)}:${p(mm)}:${p(ss)}`;
}

export default function Ground() {
  const [station, setStation] = useState(null); // null = wide view
  const [mode, setMode] = useState("ground"); // ground | site
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState(true);
  const [light, setLight] = useState(null); // lightbox src
  const [cd, setCd] = useState("--");
  const wrapRef = useRef(null);
  const ambRef = useRef(null);
  const embersRef = useRef(null);

  // mode from the URL hash; site sections open the scroll site
  useEffect(() => {
    const read = () => {
      const h = (location.hash || "").replace("#", "");
      if (h === "site") setMode("site");
      else if (h === "ground" || h === "" || h.startsWith("g") && !SITE_SECTIONS.includes(h)) setMode("ground");
      else setMode("site");
      const st = Object.keys(STATIONS).find((k) => h === "g" + k);
      setStation(st || null);
    };
    read();
    addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("in-ground", mode === "ground");
    return () => document.body.classList.remove("in-ground");
  }, [mode]);

  // countdown ticker for the LED screen
  useEffect(() => {
    if (mode !== "ground") return;
    const t = setInterval(() => setCd(msToNext() || "LIVE"), 1000);
    setCd(msToNext() || "LIVE");
    return () => clearInterval(t);
  }, [mode]);

  // embers
  useEffect(() => {
    if (mode !== "ground") return;
    const c = embersRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf, W, H;
    const N = Math.min(70, Math.max(28, Math.floor(window.innerWidth * window.innerHeight / 26000)));
    const ps = [];
    const size = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    size(); addEventListener("resize", size);
    for (let i = 0; i < N; i++) ps.push({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8, s: 0.25 + Math.random() * 0.9, w: 0.4 + Math.random() * 0.8, a: 0.15 + Math.random() * 0.5, p: Math.random() * Math.PI * 2 });
    let t = 0;
    const draw = () => {
      t += 0.016; ctx.clearRect(0, 0, W, H);
      for (const e of ps) {
        e.y -= e.s; e.x += Math.sin(t * e.w + e.p) * 0.35;
        if (e.y < -8) { e.y = H + 8; e.x = Math.random() * W; }
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3);
        g.addColorStop(0, `rgba(255,150,40,${e.a})`);
        g.addColorStop(1, "rgba(255,90,10,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 3, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [mode]);

  // fire ambience (Web Audio, on demand)
  useEffect(() => {
    if (!sound) { if (ambRef.current) { try { ambRef.current.ctx.close(); } catch (e) {} ambRef.current = null; } return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 420;
      const g = ctx.createGain(); g.gain.value = 0.16;
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.23; lg.gain.value = 0.05;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
      ambRef.current = { ctx };
    } catch (e) { setSound(false); }
    return () => { if (ambRef.current) { try { ambRef.current.ctx.close(); } catch (e) {} ambRef.current = null; } };
  }, [sound]);

  // hint fades
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 7000);
    return () => clearTimeout(t);
  }, [mode]);

  // gentle drag parallax in wide view
  useEffect(() => {
    if (mode !== "ground") return;
    const w = wrapRef.current; if (!w) return;
    let down = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const move = (x, y) => {
      if (!down || station) return;
      const dx = (x - sx) / innerWidth, dy = (y - sy) / innerHeight;
      w.style.setProperty("--panx", `${(ox + dx * 3).toFixed(2)}%`);
      w.style.setProperty("--pany", `${(oy + dy * 2).toFixed(2)}%`);
    };
    const pd = (e) => { down = true; sx = e.clientX; sy = e.clientY; };
    const pm = (e) => move(e.clientX, e.clientY);
    const pu = () => { down = false; };
    w.addEventListener("pointerdown", pd); w.addEventListener("pointermove", pm); addEventListener("pointerup", pu);
    return () => { w.removeEventListener("pointerdown", pd); w.removeEventListener("pointermove", pm); removeEventListener("pointerup", pu); };
  }, [mode, station]);

  const go = (k) => {
    history.replaceState(null, "", k ? `#g${k}` : "#ground");
    setStation(k);
    if (k && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
  };
  const toSite = (section) => {
    history.replaceState(null, "", section ? `#${section}` : "#site");
    setMode("site"); setStation(null);
    if (section) setTimeout(() => { const el = document.getElementById(section); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 120);
  };

  if (mode !== "ground") return null;
  const st = station ? STATIONS[station] : null;
  const style = st
    ? { transformOrigin: st.origin, transform: `scale(${st.scale})` }
    : { transformOrigin: "50% 52%", transform: "scale(1) translate(var(--panx, 0%), var(--pany, 0%))" };

  return (
    <div className={`ground ${station ? "focused" : ""}`} role="region" aria-label="Interactive crusade ground">
      <div ref={wrapRef} className="g-world" style={style}>
        <div className="g-sky" />
        <div className="g-moonglow" />
        <svg className="g-treeline" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,140 L0,96 Q60,78 120,90 Q180,102 240,84 Q300,66 360,88 Q420,106 480,92 Q540,78 600,94 Q660,108 720,90 Q780,70 840,92 Q900,110 960,94 Q1020,76 1080,90 Q1140,102 1200,88 L1200,140 Z" fill="#060302" />
        </svg>
        <div className="g-stage">
          <div className="g-screen">
            <div className="g-screenphoto" style={{ backgroundImage: "url(img/ground_worship_lead.jpg)" }} />
            <div className="g-screenfx" />
            <div className="g-screentext">
              <span className="g-scr-a">FAITH &amp; FIRE</span>
              <span className="g-scr-b">{cd}</span>
              <span className="g-scr-c">3 DAYS · 4:30 PM DAILY</span>
            </div>
          </div>
          <div className="g-truss g-truss-l" /><div className="g-truss g-truss-r" /><div className="g-truss g-truss-top" />
          <div className="g-speaker g-spk-l" /><div className="g-speaker g-spk-r" />
          <div className="g-platform" />
          <div className="g-beam g-beam-1" /><div className="g-beam g-beam-2" /><div className="g-beam g-beam-3" />
        </div>
        <div className="g-pole g-pole-l"><i /><b /></div>
        <div className="g-pole g-pole-r"><i /><b /></div>
        <div className="g-tent g-tent-l" /><div className="g-tent g-tent-r" />
        <div className="g-ground">
          <svg className="g-roads" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M4,60 C10,40 20,26 34,14" fill="none" stroke="url(#rg)" strokeWidth="0.55" strokeLinecap="round" opacity=".8" />
            <path d="M96,60 C90,42 78,28 66,16" fill="none" stroke="url(#rg)" strokeWidth="0.55" strokeLinecap="round" opacity=".8" />
            <defs><linearGradient id="rg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FF6A16" stopOpacity=".05" /><stop offset=".6" stopColor="#FFB72E" stopOpacity=".5" /><stop offset="1" stopColor="#FFD98A" stopOpacity=".85" /></linearGradient></defs>
          </svg>
          <span className="g-road g-road-l">Olori 19 Road</span>
          <span className="g-road g-road-r">Gospel Stars Church St.</span>
          <div className="g-rows g-rows-1" /><div className="g-rows g-rows-2" /><div className="g-rows g-rows-3" />
          <svg className="g-crowd" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#0b0505">
              {Array.from({ length: 34 }).map((_, i) => {
                const x = 6 + (i * 988) / 33, h = 30 + ((i * 7) % 17), arm = i % 4 === 1 || i % 7 === 3;
                return (
                  <g key={i} transform={`translate(${x} ${88 - h})`}>
                    <ellipse cx="8" cy="8" rx="5.4" ry="5.6" />
                    <path d={`M1,88 L1,20 Q1,14 8,14 Q15,14 15,20 L15,88 Z`} />
                    {arm ? <path d="M2,22 L-2,4 L1,3 L6,20 Z" /> : null}
                    {arm ? <path d="M14,22 L18,4 L15,3 L10,20 Z" /> : null}
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="g-floorlight g-fl-1" /><div className="g-floorlight g-fl-2" />
        </div>
        {/* hotspots */}
        <button className={`g-hot g-h-stage ${station === "stage" ? "on" : ""}`} style={{ left: "50%", top: "34%" }} onClick={() => go(station === "stage" ? null : "stage")} aria-label="The Stage">
          <i /><span>The Stage</span>
        </button>
        <button className={`g-hot g-h-screen ${station === "screen" ? "on" : ""}`} style={{ left: "50%", top: "24%" }} onClick={() => go(station === "screen" ? null : "screen")} aria-label="Programme screen">
          <i /><span>Programme</span>
        </button>
        <button className={`g-hot g-h-gate ${station === "gate" ? "on" : ""}`} style={{ left: "63%", top: "82%" }} onClick={() => go(station === "gate" ? null : "gate")} aria-label="The Gate">
          <i /><span>The Gate</span>
        </button>
        <button className={`g-hot g-h-fire ${station === "fire" ? "on" : ""}`} style={{ left: "30%", top: "78%" }} onClick={() => go(station === "fire" ? null : "fire")} aria-label="Fire altars">
          <i /><span>Fire Altars</span>
        </button>
        <button className={`g-hot g-h-gallery ${station === "gallery" ? "on" : ""}`} style={{ left: "82%", top: "60%" }} onClick={() => go(station === "gallery" ? null : "gallery")} aria-label="Moments">
          <i /><span>Moments</span>
        </button>
        <button className={`g-hot g-h-roads ${station === "roads" ? "on" : ""}`} style={{ left: "12%", top: "88%" }} onClick={() => go(station === "roads" ? null : "roads")} aria-label="Directions">
          <i /><span>Directions</span>
        </button>
      </div>

      <canvas ref={embersRef} className="g-embers" aria-hidden="true" />

      {/* header */}
      <header className="g-head">
        <span className="g-brand"><i className="g-flame" />FAITH &amp; FIRE <em>&rsquo;26</em></span>
        <nav className="g-hnav" aria-label="Ground navigation">
          <button className="g-hbtn" onClick={() => setSound(!sound)} aria-pressed={sound}>{sound ? "Sound on" : "Sound"}</button>
          <button className="g-hbtn gold" onClick={() => toSite("site")}>Simple view</button>
        </nav>
      </header>

      {hint && !station ? (
        <div className="g-hint" role="note">Choose a flame on the ground · drag to look around</div>
      ) : null}

      {/* bottom chips */}
      <nav className="g-chips" aria-label="Places on the ground">
        <button className={station === null ? "on" : ""} onClick={() => go(null)}>Whole ground</button>
        <button className={station === "stage" ? "on" : ""} onClick={() => go("stage")}>Stage</button>
        <button className={station === "screen" ? "on" : ""} onClick={() => go("screen")}>Programme</button>
        <button className={station === "gate" ? "on" : ""} onClick={() => go("gate")}>The Gate</button>
        <button className={station === "fire" ? "on" : ""} onClick={() => go("fire")}>Fire Altars</button>
        <button className={station === "gallery" ? "on" : ""} onClick={() => go("gallery")}>Moments</button>
        <button className={station === "roads" ? "on" : ""} onClick={() => go("roads")}>Directions</button>
      </nav>

      {/* station panel */}
      {st ? (
        <aside className="g-panel" role="dialog" aria-label={st.label}>
          <button className="g-close" onClick={() => go(null)} aria-label="Back to the whole ground">&larr; Whole ground</button>
          {station === "stage" ? (
            <>
              <h2>The Stage</h2>
              <figure className="g-photo"><img src="img/ground_preacher.jpg" alt="The pioneer ministering on the crusade ground" loading="lazy" /></figure>
              <p className="g-lead">Every night, the Word comes first.</p>
              <div className="g-card">
                <b>Pioneer</b>
                <strong>{SITE.pastor}</strong>
                <span>The Watchmen Prayer Network Int&rsquo;l &middot; {SITE.edition}</span>
              </div>
              <p className="g-note">Guest ministers for the 9th edition are announced closer to the dates. Follow the channel so you hear it first.</p>
              <a className="g-cta" href={SITE.telegram} target="_blank" rel="noopener noreferrer">Follow on Telegram &nearr;</a>
            </>
          ) : null}
          {station === "screen" ? (
            <>
              <h2>Programme</h2>
              <div className="g-count"><span>{cd}</span><small>until the next session begins</small></div>
              <ul className="g-days">
                {SITE.days.map((d) => (
                  <li key={d.start}><b>{d.label}</b><span>{d.full.replace(", 2026", "")} · 4:30 PM</span><em>{d.title}</em></li>
                ))}
              </ul>
              <p className="g-note">Gates open early each evening. Come with your Bible, a notebook, and an expectant heart.</p>
            </>
          ) : null}
          {station === "gate" ? (
            <>
              <h2>The Gate</h2>
              <p className="g-lead">Entry is free, all three nights. Register ahead so the team can plan seats, prayers and parking for you.</p>
              <ul className="g-facts">
                <li><b>Free entry</b><span>Register once, come every night</span></li>
                <li><b>Everyone welcome</b><span>Bring friends and family</span></li>
                <li><b>Come early</b><span>4:30 PM start &middot; seats fill fast</span></li>
              </ul>
              <button className="g-cta" onClick={() => toSite("register")}>Register now &rarr;</button>
            </>
          ) : null}
          {station === "fire" ? (
            <>
              <h2>Fire Altars</h2>
              <p className="g-lead">Bring your prayer request, or share what God has done. Both reach the prayer team directly.</p>
              <a className="g-cta" href={`https://wa.me/${SITE.prayerWhatsApp}`} target="_blank" rel="noopener noreferrer">Send a prayer request &nearr;</a>
              <a className="g-cta ghost" href={`https://wa.me/${SITE.prayerWhatsApp}?text=${encodeURIComponent("Testimony: ")}`} target="_blank" rel="noopener noreferrer">Share a testimony &nearr;</a>
              <p className="g-note">Or bring it to the altars in person, any of the three nights.</p>
            </>
          ) : null}
          {station === "gallery" ? (
            <>
              <h2>Moments</h2>
              <p className="g-lead">Nine years of fire on this same ground.</p>
              <div className="g-grid">
                {PHOTOS.map(([src, cap]) => (
                  <button key={src} onClick={() => setLight(src)} aria-label={cap}>
                    <img src={src} alt={cap} loading="lazy" /><span>{cap}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {station === "roads" ? (
            <>
              <h2>Directions</h2>
              <address>
                {SITE.venue.lines.map((l) => <span key={l}>{l}<br /></span>)}
              </address>
              <a className="g-cta" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.venue.mapQuery)}`} target="_blank" rel="noopener noreferrer">Get directions &nearr;</a>
              <p className="g-note">Look for Gospel Stars Church; the ground is directly opposite. Behind Ese-G Hostel, off Olori 19 Road.</p>
              <div className="g-card">
                <b>Enquiries</b>
                {SITE.enquiries.map((p) => <span key={p}>{p}</span>)}
              </div>
            </>
          ) : null}
        </aside>
      ) : null}

      {light ? (
        <div className="g-light" role="dialog" aria-label="Photo" onClick={() => setLight(null)}>
          <img src={light} alt="" />
        </div>
      ) : null}
    </div>
  );
}
