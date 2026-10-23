"use client";
import { useEffect } from "react";

const SLIDES = [
  { year: "2018", theme: "The Beginning",
    line: "It started with one altar and a field of students. No lights, no stage, just a cry: if God can burn in one campus, He can burn in a nation.",
    bg: "img/night_stage_lights.jpg", img: null },
  { year: "2021", theme: "Prophecy",
    line: "An apostolic and prophetic prayer conference. The ground learned to hear the word of the Lord and declare it back to Him, night after night.",
    bg: "img/night_backlight_a.jpg", img: null },
  { year: "2022", theme: "The Burning Ones",
    line: "A generation set alight. The crowd outgrew the ground, and the fire stopped being an event. It became an identity.",
    bg: "img/crowd_laser.jpg", img: null },
  { year: "2025", theme: "Inheritance Of Faith Possibilities",
    line: "With Rev. Kolawole Williams Ogoigbe as guest minister. The watchmen inherited the promise: what faith can see, faith can hold.",
    bg: "img/art_flyer2025.jpg", img: "img/art_flyer2025.jpg" },
  { year: "2026", theme: "Faith & Fire",
    line: "The 9th edition. December 6th to 8th, the same ground, a bigger fire. This is the chapter you get to stand in.",
    bg: "img/flyer2026.jpg", img: null, now: true },
];

const GAL = [
  ["crowd_laser.jpg", "Light beams over the crowd · night session", "s-a"],
  ["preacher_truss.jpg", "The word on stage", "s-b"],
  ["night_backlight_a.jpg", "Silhouetted in smoke and light", "s-d"],
  ["worshipper_closeup.jpg", "A worshipper lost in it", "s-c"],
  ["mc_daylight.jpg", "Anchoring the night", "s-e"],
  ["art_daytime.jpg", "The ground by day, hands lifted", "s-f"],
  ["night_crowd_wide.jpg", "The field at night", "s-g"],
];

const NIGHTS = [
  ["Night I", "Sun 6 Dec", "Opening Night", "The gates open. Worship goes up, the word comes down, and the 9th edition is declared burning.", "img/preacher_truss.jpg"],
  ["Night II", "Mon 7 Dec", "The Fire Altars", "Prophetic prayer lines and altar calls. Come with your point of contact; leave with your testimony.", "img/night_crowd_wide.jpg"],
  ["Night III", "Tue 8 Dec", "Commissioning", "The final charge. The watchmen are sent out with fire in their bones.", "img/art_daytime.jpg"],
];

export default function Experience() {
  useEffect(() => {
    const gate = document.getElementById("gate");
    setTimeout(() => gate && gate.classList.add("open"), 2500);

    const T = new Date("2026-12-06T16:30:00+01:00").getTime();
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let d = T - Date.now(); if (d < 0) d = 0;
      const html =
        '<div class="cd-cell"><div class="n">' + pad(Math.floor(d / 864e5)) + '</div><div class="l">Days</div></div>' +
        '<div class="cd-cell"><div class="n">' + pad(Math.floor((d % 864e5) / 36e5)) + '</div><div class="l">Hours</div></div>' +
        '<div class="cd-cell"><div class="n">' + pad(Math.floor((d % 36e5) / 6e4)) + '</div><div class="l">Mins</div></div>' +
        '<div class="cd-cell"><div class="n">' + pad(Math.floor((d % 6e4) / 1e3)) + '</div><div class="l">Secs</div></div>';
      const a = document.getElementById("cd"), b = document.getElementById("cd2");
      if (a) a.innerHTML = html; if (b) b.innerHTML = html;
    };
    tick(); const iv = setInterval(tick, 1000);

    const cv = document.getElementById("embers");
    let raf; let running = true; let rs = null;
    if (cv) {
      const cx = cv.getContext("2d");
      let ps = [], mx = 0.5;
      for (let i = 0; i < 70; i++) ps.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + 0.5, s: Math.random() * 0.3 + 0.1, w: Math.random() * 6.28, a: Math.random() * 0.5 + 0.2 });
      rs = () => { cv.width = innerWidth; cv.height = innerHeight; }; rs();
      addEventListener("resize", rs);
      const loop = () => {
        if (!running) return;
        cx.clearRect(0, 0, cv.width, cv.height);
        for (const p of ps) {
          p.y -= p.s / 620; p.w += 0.018;
          if (p.y < -0.03) { p.y = 1.03; p.x = Math.random(); }
          const x = p.x * cv.width + Math.sin(p.w) * 22 + (mx - 0.5) * 30, y = p.y * cv.height;
          const g = cx.createRadialGradient(x, y, 0, x, y, p.r * 5);
          g.addColorStop(0, "rgba(255," + Math.floor(150 + p.a * 80) + ",50," + p.a + ")");
          g.addColorStop(1, "rgba(255,70,0,0)");
          cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r * 5, 0, 6.29); cx.fill();
        }
        raf = requestAnimationFrame(loop);
      }; loop();
    }

    const hb = document.getElementById("hbg"), cur = document.getElementById("cursor");
    const mm = (e) => {
      mx = e.clientX / innerWidth;
      if (hb) hb.style.transform = "scale(1.06) translate(" + ((mx - 0.5) * -20) + "px," + ((e.clientY / innerHeight - 0.5) * -12) + "px)";
      if (cur) { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; }
    };
    addEventListener("mousemove", mm);

    const hd = document.getElementById("hd"), pr = document.getElementById("progress");
    let lastY = 0;
    const sc = () => {
      const y = scrollY;
      if (pr) pr.style.width = (y / (document.body.scrollHeight - innerHeight) * 100) + "%";
      if (hd) { hd.classList.toggle("solid", y > 60); hd.classList.toggle("hide", y > lastY && y > 420); }
      lastY = y;
      const jEl = document.getElementById("journey");
      if (jEl) {
        const r = jEl.getBoundingClientRect();
        const p = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 0.999);
        const idx = Math.floor(p * SLIDES.length);
        if (String(idx) !== jEl.dataset.idx) {
          jEl.dataset.idx = String(idx);
          document.querySelectorAll(".jslide").forEach((s, i) => s.classList.toggle("on", i === idx));
          document.querySelectorAll("#jdots i").forEach((dd, i) => dd.classList.toggle("on", i === idx));
        }
      }
    };
    addEventListener("scroll", sc, { passive: true });
    document.querySelectorAll("#jdots i").forEach((d, i) => d.addEventListener("click", () => {
      const jEl = document.getElementById("journey"); if (!jEl) return;
      const r = jEl.getBoundingClientRect();
      scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * (i / SLIDES.length) + 2, behavior: "smooth" });
    }));
    sc();

    const items = [].slice.call(document.querySelectorAll(".gi img"));
    const lb = document.getElementById("lb"), lbi = document.getElementById("lbi"), lbc = document.getElementById("lbc");
    let li = 0;
    const open = (i) => {
      li = (i + items.length) % items.length;
      if (lbi) lbi.src = items[li].src; if (lbc) lbc.textContent = items[li].alt;
      if (lb) lb.classList.add("on");
    };
    items.forEach((im, i) => im.parentElement.addEventListener("click", () => open(i)));
    const close = () => lb && lb.classList.remove("on");
    const x = document.getElementById("lbx"), pv = document.getElementById("lbpv"), nx = document.getElementById("lbnx");
    if (x) x.onclick = close; if (pv) pv.onclick = () => open(li - 1); if (nx) nx.onclick = () => open(li + 1);
    if (lb) lb.onclick = (e) => { if (e.target === lb) close(); };
    const key = (e) => { if (!lb || !lb.classList.contains("on")) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") open(li + 1); if (e.key === "ArrowLeft") open(li - 1); };
    addEventListener("keydown", key);

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("on"); }), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const form = document.getElementById("rform");
    const onSubmit = (e) => {
      e.preventDefault();
      const rec = { n: document.getElementById("fn").value, p: document.getElementById("ph").value, d: document.getElementById("dy").value, c: document.getElementById("ch").value, t: Date.now() };
      try { const reg = JSON.parse(localStorage.getItem("ff_reg") || "[]"); reg.push(reg && reg.length >= 0 ? rec : rec); localStorage.setItem("ff_reg", JSON.stringify(reg)); } catch (x) {}
      form.style.display = "none";
      const ok = document.getElementById("regok"); if (ok) ok.style.display = "block";
    };
    if (form) form.addEventListener("submit", onSubmit);

    return () => { clearInterval(iv); running = false; cancelAnimationFrame(raf); removeEventListener("mousemove", mm); removeEventListener("scroll", sc); removeEventListener("keydown", key); if (rs) removeEventListener("resize", rs); };
  }, []);

  return (
    <main>
      <div className="grain" />
      <div id="cursor" className="cursor" />
      <div id="progress" className="progress" />

      <div id="gate" className="gate">
        <img src="img/logo_mark.jpg" alt="The Watchmen Prayer Network International" />
        <div className="gname">The Watchmen Prayer Network Int&rsquo;l</div>
        <div className="gbar"><i /></div>
        <div className="gtag">Raising a people of the Word, the Spirit, and Prayer</div>
      </div>

      <header id="hd" className="header">
        <a className="brand" href="#top">
          <img src="img/logo_mark.jpg" alt="Watchmen logo" />
          <span className="t"><b>Faith &amp; Fire &rsquo;26</b>The Watchmen Prayer Network</span>
        </a>
        <nav className="nav">
          <a href="#journey">The Journey</a>
          <a href="#gallery">Gallery</a>
          <a href="#nights">Three Nights</a>
        </nav>
        <a className="hbtn" href="#register">Reserve a Seat</a>
      </header>

      <div className="hero" id="top">
        <div id="hbg" className="hbg" style={{ backgroundImage: "url(img/night_backlight_b.jpg)" }} />
        <div className="hveil" />
        <canvas id="embers" className="embers" />
        <div className="hin">
          <span className="eyebrow"><span className="dot" />&nbsp;The 9th Edition &middot; December 2026</span>
          <h1 className="h1a"><em>Faith</em> <span className="amp">&amp;</span> Fire</h1>
          <div className="h1b">Crusade &middot; DELSU Prays</div>
          <div className="hwhen">
            <div className="chip"><b>Sun 6 Dec</b>Opening Night</div>
            <div className="chip"><b>Mon 7 Dec</b>The Fire Altars</div>
            <div className="chip"><b>Tue 8 Dec</b>Commissioning</div>
          </div>
          <div id="cd" className="cdown" />
          <div className="cta">
            <a className="btn gold" href="#register">Reserve My Seat</a>
            <a className="btn line" href="#journey">Begin the Journey</a>
          </div>
        </div>
        <div className="scrollhint">Scroll</div>
      </div>

      <div className="ticker">
        <span>Faith &amp; Fire Crusade&nbsp;&nbsp;&middot;&nbsp;&nbsp;The 9th Edition&nbsp;&nbsp;&middot;&nbsp;&nbsp;December 6th &ndash; 8th, 2026&nbsp;&nbsp;&middot;&nbsp;&nbsp;4:30 PM Daily&nbsp;&nbsp;&middot;&nbsp;&nbsp;Free Entry&nbsp;&nbsp;&middot;&nbsp;&nbsp;DELSU Prays&nbsp;&nbsp;&middot;&nbsp;&nbsp;Faith &amp; Fire Crusade&nbsp;&nbsp;&middot;&nbsp;&nbsp;The 9th Edition&nbsp;&nbsp;&middot;&nbsp;&nbsp;December 6th &ndash; 8th, 2026&nbsp;&nbsp;&middot;&nbsp;&nbsp;4:30 PM Daily&nbsp;&nbsp;&middot;&nbsp;&nbsp;Free Entry&nbsp;&nbsp;&middot;&nbsp;&nbsp;DELSU Prays&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
      </div>

      <section id="journey" className="journey">
        <div className="jsticky">
          {SLIDES.map((s, i) => (
            <div key={i} className={"jslide" + (i === 0 ? " on" : "")}>
              <div className="bg" style={{ backgroundImage: `url(${s.bg})` }} />
              <div className="veil" />
              <div className="jgrid">
                <div>
                  <div className="jnum">{s.year}</div>
                  <div className="jtheme">{s.theme}{s.now ? <span style={{ color: "var(--gold)" }}> &middot; you are here</span> : null}</div>
                  <div className="jline">{s.line}</div>
                </div>
                {s.img ? <div className="jframe"><img src={s.img} alt={"DELSU Prays " + s.year + " flyer"} /></div> : null}
              </div>
            </div>
          ))}
          <div id="jdots" className="jdots">{SLIDES.map((_, i) => <i key={i} className={i === 0 ? "on" : ""} />)}</div>
          <div className="jhint">Nine editions &middot; keep scrolling</div>
        </div>
      </section>

      <div className="quote">
        <div className="bg" style={{ backgroundImage: "url(img/night_backlight_b.jpg)" }} />
        <div className="qin reveal">
          <p className="eyebrow">The word over the city</p>
          <p className="qbig" style={{ marginTop: 22 }}>&ldquo;We have <em>taken</em> this city&rdquo;</p>
          <p className="qsrc">The Watchmen Prayer Network Int&rsquo;l</p>
        </div>
      </div>

      <section className="pad" id="gallery">
        <div className="shead reveal">
          <p className="eyebrow">The Crusade Ground &middot; Abraka</p>
          <h2>Where the <em>fire falls</em></h2>
          <div className="divider">&spades;</div>
          <p className="slead">Opposite Gospel Stars Church Street, off Olori 19 Road, behind Ese-G Hostel, Abraka, Delta State. Every December since 2018, this field becomes the loudest place in Delta.</p>
        </div>
        <div className="gal">
          {GAL.map(([f, cap, span], i) => (
            <figure key={i} className={"gi reveal " + span}>
              <img src={"img/" + f} alt={cap} />
              <figcaption className="cap">{cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="pad" id="nights" style={{ paddingTop: 20 }}>
        <div className="shead reveal">
          <p className="eyebrow">December 6 &middot; 7 &middot; 8 &middot; 4:30 PM daily</p>
          <h2>Three nights, <em>one altar</em></h2>
        </div>
        <div className="nights">
          {NIGHTS.map(([no, date, title, body, img], i) => (
            <div key={i} className="night reveal">
              <img src={img} alt={title} />
              <div className="nin">
                <div className="no">{no} &middot; {date}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="quote" style={{ minHeight: "60vh" }}>
        <div className="bg" style={{ backgroundImage: "url(img/crowd_laser.jpg)" }} />
        <div className="qin reveal">
          <p className="eyebrow">Counting down to the fire</p>
          <div id="cd2" className="cdown" style={{ marginTop: 30 }} />
        </div>
      </div>

      <section className="reg" id="register">
        <div className="rt reveal">
          <p className="eyebrow">Free entry &middot; 4:30 PM daily</p>
          <h2>Reserve your <em>seat at the fire</em></h2>
          <p className="lead">Seats on the ground are open to everyone, but a reservation keeps you on the list for the nightly countdown flyers from the Watchmen, and first notice when the guest ministers are announced.</p>
        </div>
        <div className="card reveal">
          <form id="rform">
            <label>Full name</label><input id="fn" required placeholder="Your full name" />
            <div className="row">
              <div><label>Phone (WhatsApp)</label><input id="ph" required placeholder="0801 234 5678" /></div>
              <div><label>Night(s)</label>
                <select id="dy">
                  <option>All three nights</option><option>Sun 6 &middot; Opening</option>
                  <option>Mon 7 &middot; Fire Altars</option><option>Tue 8 &middot; Commissioning</option>
                </select>
              </div>
            </div>
            <label>Church / campus fellowship (optional)</label><input id="ch" placeholder="Where you worship" />
            <button type="submit">Reserve my seat</button>
          </form>
          <div id="regok" className="regok">
            <img src="img/logo_mark.jpg" alt="" />
            <h3>Your seat is lit.</h3>
            <p>See you at the ground, 4:30 PM. The countdown flyers will find you.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <img src="img/logo_mark.jpg" alt="The Watchmen Prayer Network International logo" />
        <div className="fm">The Watchmen Prayer Network Int&rsquo;l</div>
        <p className="verse">&ldquo;Raising a people of the Word, the Spirit, and Prayer&rdquo; &mdash; Ezekiel 33:7</p>
        <p className="meta">
          Pioneer: Pastor Ikechukwuka Ubabudike<br />
          Crusade Ground, opposite Gospel Stars Church Street, off Olori 19 Road, behind Ese-G Hostel, Abraka, Delta State<br />
          Enquiries: 0703 534 4774 &middot; 0704 781 8950 &nbsp;&middot;&nbsp; <a href="https://t.me/thewatchmenprayernetworkintl">t.me/thewatchmenprayernetworkintl</a>
        </p>
      </footer>

      <div id="lb" className="lb">
        <span id="lbx" className="x">&times;</span>
        <span id="lbpv" className="pv">&lsaquo;</span>
        <span id="lbnx" className="nx">&rsaquo;</span>
        <img id="lbi" src="" alt="" />
        <div className="cap" id="lbc"></div>
      </div>
    </main>
  );
}
