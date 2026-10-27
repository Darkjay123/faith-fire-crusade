"use client";
import { useEffect, useRef, useState } from "react";
import { SITE } from "../lib/config";

const PHOTOS = [
  ["img/night_crowd_wide.jpg", "The ground will burn again."],
  ["img/preacher_truss.jpg", "Three nights of worship, word and fire."],
  ["img/worshipper_closeup.jpg", SITE.days.map((d) => d.short).join(" · ")],
  ["img/crowd_laser.jpg", "4:30 PM daily · Crusade Ground, Abraka"],
];

const SEEN = "ff_intro_seen";

export default function Intro() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState(0); // 0 question, 1 ready, 2 cinema, 3 end card
  const [beat, setBeat] = useState(0);
  const [gone, setGone] = useState(true);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const timersRef = useRef([]);

  const track = (fn, ms) => timersRef.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  useEffect(() => {
    setMounted(true);
    let seen = null;
    try { seen = localStorage.getItem(SEEN); } catch (e) {}
    const RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!seen && !RM) { track(() => setGone(false), 1500); // let the logo gate finish first
      track(() => setStage(1), 4400); } // hold the question, then offer the button
    else if (!seen && RM) { try { localStorage.setItem(SEEN, "1"); } catch (e) {} }
  }, []);

  // embers canvas
  useEffect(() => {
    if (gone || stage === 3) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf, parts = [];
    const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
    size(); addEventListener("resize", size);
    for (let i = 0; i < 55; i++) parts.push(spawn(true));
    function spawn(anyY) {
      return { x: Math.random() * innerWidth, y: anyY ? Math.random() * innerHeight : innerHeight + 10,
        r: 0.6 + Math.random() * 2.1, s: 0.25 + Math.random() * 0.85, d: Math.random() * 2 * Math.PI,
        w: 0.4 + Math.random() * 0.9, o: 0.25 + Math.random() * 0.6 };
    }
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of parts) {
        p.y -= p.s; p.d += 0.011; p.x += Math.sin(p.d) * p.w * 0.55;
        if (p.y < -12) Object.assign(p, spawn(false));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.2);
        g.addColorStop(0, "rgba(255,214,138," + p.o + ")");
        g.addColorStop(0.4, "rgba(255,122,26," + p.o * 0.55 + ")");
        g.addColorStop(1, "rgba(255,106,22,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4.2, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [gone, stage]);

  // fire ambience, synthesized in the browser, only after the visitor clicks
  const startAudio = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 1.4);
      master.connect(ctx.destination);

      const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 190; warm.connect(master);
      [48, 48.7, 96.2].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = i === 2 ? 0.02 : 0.055;
        o.connect(g); g.connect(warm); o.start();
      });

      const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let i = 0;
      while (i < len) {
        if (Math.random() < 0.0016) {
          const dur = 40 + Math.random() * 280, amp = 0.25 + Math.random() * 0.65;
          const w = (2 * Math.PI * (300 + Math.random() * 2400)) / ctx.sampleRate;
          for (let j = 0; j < dur && i + j < len; j++) d[i + j] += amp * Math.exp(-j / (dur * 0.22)) * Math.sin(w * j) * (0.4 + Math.random() * 0.6);
          i += dur + 400 + Math.random() * 3600;
        } else i++;
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.55;
      const cg = ctx.createGain(); cg.gain.value = 0.12;
      src.connect(bp); bp.connect(cg); cg.connect(master); src.start();

      audioRef.current = { ctx, master };
    } catch (e) {}
  };
  const stopAudio = () => {
    const a = audioRef.current; if (!a) return;
    try {
      a.master.gain.cancelScheduledValues(a.ctx.currentTime);
      a.master.gain.setValueAtTime(a.master.gain.value, a.ctx.currentTime);
      a.master.gain.exponentialRampToValueAtTime(0.0001, a.ctx.currentTime + 1.2);
      setTimeout(() => a.ctx.close(), 1400);
    } catch (e) {}
    audioRef.current = null;
  };

  const finish = (goRegister) => {
    clearTimers(); stopAudio();
    try { localStorage.setItem(SEEN, "1"); } catch (e) {}
    setGone(true);
    document.body.classList.remove("intro-lock");
    if (goRegister) {
      const el = document.getElementById("register");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 350);
    }
  };

  const begin = () => {
    startAudio();
    const RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (RM) { setStage(3); return; }
    setStage(2); setBeat(0);
    const beats = [3400, 3400, 3400, 3200];
    let t = 0, idx = 0;
    for (const b of beats) { t += b; const n = ++idx; if (n < beats.length) track(() => setBeat(n), t); }
    track(() => setStage(3), t + 900);
  };

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape" && !gone && stage >= 2) finish(false); };
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); clearTimers(); stopAudio(); };
  }, [gone, stage]);

  useEffect(() => {
    if (!gone && stage >= 2) document.body.classList.add("intro-lock");
    return () => document.body.classList.remove("intro-lock");
  }, [gone, stage]);

  if (!mounted || gone) return null;

  const t = (i) => ({ opacity: stage === 2 && beat >= i ? 1 : 0 });

  return (
    <div className={"intro" + (stage >= 2 ? " cine" : "")} role="dialog" aria-label="Faith and Fire intro">
      <canvas ref={canvasRef} className="iemb" aria-hidden="true" />
      <div className="imountain" aria-hidden="true" />
      {stage < 2 && PHOTOS.slice(0, 2).map(([p]) => (
        <link key={p} rel="preload" as="image" href={p} />
      ))}

      {stage === 0 && (
        <div className="icore">
          <div className="ihead"><span className="idote" />Faith &amp; Fire Crusade '26 · Abraka</div>
          <h1 className="iq">I have <em>one question</em> for you.</h1>
        </div>
      )}

      {stage === 1 && (
        <div className="icore">
          <div className="ihead"><span className="idote" />Faith &amp; Fire Crusade '26 · Abraka</div>
          <h1 className="iq">Are you ready to <em>catch fire</em>?</h1>
          <button className="ibtn" onClick={begin}>Yes, I&rsquo;m ready</button>
          <p className="ihint">Sound on · about 15 seconds · skip any time</p>
        </div>
      )}

      {stage === 2 && (
        <>
          {PHOTOS.map(([p], i) => (
            <div key={p} className={"iframe" + (i === beat ? " on" : "")} style={{ backgroundImage: "url(" + p + ")" }} />
          ))}
          <div className="icore itop">
            <p className="ibeat" style={t(0)}>{PHOTOS[0][1]}</p>
            <p className="ibeat" style={t(1)}>{PHOTOS[1][1]}</p>
            <p className="ibeat" style={t(2)}>{PHOTOS[2][1]}</p>
            <p className="ibeat" style={t(3)}>{PHOTOS[3][1]}</p>
          </div>
        </>
      )}

      {stage === 3 && (
        <div className="icore">
          <div className="ihead"><span className="idote" />{SITE.edition} · Free entry</div>
          <h1 className="iq">December 6&ndash;8.<br /><em>4:30 PM</em> daily.</h1>
          <button className="ibtn gold" onClick={() => finish(true)}>I&rsquo;ll be there</button>
          <button className="ilink" onClick={() => finish(false)}>Explore the crusade first</button>
        </div>
      )}

      {stage >= 2 && <button className="iskip" onClick={() => finish(false)}>Skip</button>}
    </div>
  );
}
