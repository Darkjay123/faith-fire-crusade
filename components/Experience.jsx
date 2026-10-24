"use client";
import { useEffect } from "react";
import { SITE } from "../lib/config";
import Invite from "./Invite";
import Prayer from "./Prayer";


const GAL = [
  ["crowd_laser.jpg", "Light beams over the crowd at a night session", "s-a"],
  ["preacher_truss.jpg", "The word on stage under the truss lights", "s-b"],
  ["night_backlight_a.jpg", "Silhouetted in smoke and light", "s-d"],
  ["worshipper_closeup.jpg", "A worshipper lost in the moment", "s-c"],
  ["mc_daylight.jpg", "Anchoring the night", "s-e"],
  ["art_daytime.jpg", "The ground by day, hands lifted", "s-f"],
  ["night_crowd_wide.jpg", "The field at night, packed", "s-g"],
];

const NIGHTS = [
  ["Night I", "Sun 6 Dec", "Opening Night", "The gates open. Worship goes up, the word comes down, and the 9th edition is declared burning.", "img/preacher_truss.jpg"],
  ["Night II", "Mon 7 Dec", "The Fire Altars", "Prophetic prayer lines and altar calls. Come with your point of contact; leave with your testimony.", "img/night_crowd_wide.jpg"],
  ["Night III", "Tue 8 Dec", "Commissioning", "The final charge. The watchmen are sent out with fire in their bones.", "img/art_daytime.jpg"],
];

const ADDR = SITE.venue.lines.join(", ");
const MAPS = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SITE.venue.mapQuery);

const pad = (n) => String(n).padStart(2, "0");
const cell = (n, l) => '<div class="cd-cell"><div class="n">' + n + '</div><div class="l">' + l + "</div></div>";

export default function Experience() {
  useEffect(() => {
    const RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gate = document.getElementById("gate");
    setTimeout(() => gate && gate.classList.add("open"), RM ? 300 : 1400);

    const D = SITE.days.map((d) => Date.parse(d.start));
    const END = Date.parse(SITE.eventEnd);

    const tick = () => {
      const now = Date.now();
      let state = "pre";
      if (now >= END) state = "post";
      else if (now >= D[2]) state = "day3";
      else if (now >= D[1]) state = "day2";
      else if (now >= D[0]) state = "day1";

      const est = document.getElementById("estate");
      const cd = document.getElementById("cd"), cd2 = document.getElementById("cd2");
      if (state === "post") {
        const done = '<div class="cd-cell" style="min-width:280px"><div class="n" style="font-size:1.5rem">The 9th edition has concluded</div><div class="l" style="margin-top:10px">Photos, replays and the next announcement will appear here</div></div>';
        if (cd) cd.innerHTML = done; if (cd2) cd2.innerHTML = done;
        if (est) est.textContent = "Thank you for standing with us.";
        return;
      }
      if (state === "day3" && now >= D[2]) {
        const on = '<div class="cd-cell" style="min-width:240px"><div class="n" style="font-size:1.4rem">Final night is on</div><div class="l" style="margin-top:10px">Commissioning · Crusade Ground</div></div>';
        if (cd) cd.innerHTML = on; if (cd2) cd2.innerHTML = on;
        if (est) est.textContent = "It is the final night. Come.";
        return;
      }
      const target = state === "pre" ? D[0] : state === "day1" ? D[1] : D[2];
      let d = target - now; if (d < 0) d = 0;
      const html =
        cell(pad(Math.floor(d / 864e5)), "Days") +
        cell(pad(Math.floor((d % 864e5) / 36e5)), "Hours") +
        cell(pad(Math.floor((d % 36e5) / 6e4)), "Mins") +
        cell(pad(Math.floor((d % 6e4) / 1e3)), "Secs");
      if (cd) cd.innerHTML = html; if (cd2) cd2.innerHTML = html;
      if (est) {
        if (state === "pre") est.textContent = "Counting down to Opening Night · 4:30 PM WAT";
        else if (state === "day1") est.textContent = "Day One is underway · next service Monday 4:30 PM";
        else est.textContent = "Day Two is underway · final night Tuesday 4:30 PM";
      }
    };
    tick(); const iv = setInterval(tick, 1000);

    const cv = document.getElementById("embers");
    let raf; let running = true; let rs = null;
    if (cv && !RM) {
      const cx = cv.getContext("2d");
      const N = Math.max(22, Math.min(70, Math.round(innerWidth / (innerWidth < 760 ? 26 : 14))));
      let ps = [], mx = 0.5;
      for (let i = 0; i < N; i++) ps.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + 0.5, s: Math.random() * 0.3 + 0.1, w: Math.random() * 6.28, a: Math.random() * 0.5 + 0.2 });
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
      if (RM) return;
      if (hb) hb.style.transform = "scale(1.06) translate(" + ((mx - 0.5) * -20) + "px," + ((e.clientY / innerHeight - 0.5) * -12) + "px)";
      if (cur) { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; }
    };
    addEventListener("mousemove", mm);

    const bg = document.getElementById("burger"), mn = document.getElementById("mnav");
    const tg = () => { if (!mn || !bg) return; const on = mn.classList.toggle("on"); bg.setAttribute("aria-expanded", on ? "true" : "false"); };
    if (bg) bg.addEventListener("click", tg);
    if (mn) mn.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { mn.classList.remove("on"); bg && bg.setAttribute("aria-expanded", "false"); }));

    document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
      const t = b.getAttribute("data-copy"), old = b.textContent;
      const done = () => { b.textContent = "Address copied"; setTimeout(() => { b.textContent = old; }, 2500); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done).catch(() => {});
      else { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); }
    }));

    const hd = document.getElementById("hd"), pr = document.getElementById("progress");
    let lastY = 0;
    const sc = () => {
      const y = scrollY;
      if (pr) pr.style.width = (y / (document.body.scrollHeight - innerHeight) * 100) + "%";
      if (hd) { hd.classList.toggle("solid", y > 60); hd.classList.toggle("hide", y > lastY && y > 420); }
      lastY = y;
    };
    addEventListener("scroll", sc, { passive: true });
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
      const chEl = document.getElementById("ch"); const rec = { n: document.getElementById("fn").value, p: document.getElementById("ph").value, d: document.getElementById("dy").value, c: chEl ? chEl.value : "", t: Date.now() };
      try { const reg = JSON.parse(localStorage.getItem("ff_reg") || "[]"); reg.push(rec); localStorage.setItem("ff_reg", JSON.stringify(reg)); } catch (x) {}
      form.style.display = "none";
      const ok = document.getElementById("regok"); if (ok) ok.style.display = "block";
      const wa = document.getElementById("regwa");
      if (wa) wa.href = "https://wa.me/" + SITE.prayerWhatsApp + "?text=" + encodeURIComponent("SEAT RESERVATION - Faith & Fire Crusade\nName: " + rec.n + "\nPhone: " + rec.p + "\nNight(s): " + rec.d + (rec.c ? "\nFellowship: " + rec.c : ""));
    };
    if (form) form.addEventListener("submit", onSubmit);

    return () => {
      clearInterval(iv); running = false; cancelAnimationFrame(raf);
      removeEventListener("mousemove", mm); removeEventListener("scroll", sc); removeEventListener("keydown", key);
      if (rs) removeEventListener("resize", rs);
      if (bg) bg.removeEventListener("click", tg);
    };
  }, []);

  return (
    <main id="main">
      <a className="skip" href="#main">Skip to content</a>
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
        <nav className="nav" aria-label="Main">
          <a href="#nights">Three Nights</a>
          <a href="#invite">Invite</a>
          <a href="#venue">Venue</a>
          <a href="#prayer">Prayer</a>
        </nav>
        <a className="hbtn" href="#register">Reserve a Seat</a>
        <button id="burger" className="burger" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><i /><i /><i /></button>
      </header>

      <div id="mnav" className="mnav" role="dialog" aria-label="Menu">
        <p className="msm">Faith &amp; Fire Crusade &rsquo;26</p>
        <a href="#nights">Three Nights</a>
        <a href="#invite">Invite a Friend</a>
        <a href="#live">Updates</a>
        <a href="#venue">Venue</a>
        <a href="#prayer">Prayer Request</a>
        <a href="#register">Reserve a Seat</a>
      </div>

      <div className="hero" id="top">
        <div id="hbg" className="hbg" style={{ backgroundImage: "url(img/hero_night_a.jpg)" }} />
        <div className="hveil" />
        <canvas id="embers" className="embers" aria-hidden="true" />
        <div className="hin">
          <span className="eyebrow"><span className="dot" />&nbsp;The 9th Edition &middot; December 2026</span>
          <h1 className="h1a">Faith <span className="amp">&amp;</span> Fire</h1>
          <div className="h1b">Crusade &middot; DELSU Prays &middot; The 9th Edition</div>
          <div className="hwhen">
            <div className="chip"><b>Sun 6 Dec</b>Opening Night</div>
            <div className="chip"><b>Mon 7 Dec</b>The Fire Altars</div>
            <div className="chip"><b>Tue 8 Dec</b>Commissioning</div>
          </div>
          <p id="estate" className="estate" />
          <div id="cd" className="cdown" role="timer" aria-live="off" />
          <p className="sr">Counting down to Sunday, December 6, 2026, 4:30 PM West Africa Time, Crusade Ground, Abraka.</p>
          <div className="cta">
            <a className="btn gold" href="#register">I&rsquo;m Coming</a>
            <a className="btn line" href="#nights">Explore the Crusade</a>
          </div>
        </div>
        <div className="scrollhint">Scroll</div>
      </div>

      <div className="mobbar">
        <a className="a1" href="#register">Reserve a Seat</a>
        <a className="a2" href="#invite">Invite a Friend</a>
      </div>

      <div className="ticker">
        <span>{SITE.name}&nbsp;&nbsp;&middot;&nbsp;&nbsp;{SITE.edition}&nbsp;&nbsp;&middot;&nbsp;&nbsp;December 6th &ndash; 8th, 2026&nbsp;&nbsp;&middot;&nbsp;&nbsp;4:30 PM Daily&nbsp;&nbsp;&middot;&nbsp;&nbsp;Free Entry&nbsp;&nbsp;&middot;&nbsp;&nbsp;DELSU Prays&nbsp;&nbsp;&middot;&nbsp;&nbsp;Abraka, Delta State&nbsp;&nbsp;&middot;&nbsp;&nbsp;{SITE.name}&nbsp;&nbsp;&middot;&nbsp;&nbsp;{SITE.edition}&nbsp;&nbsp;&middot;&nbsp;&nbsp;December 6th &ndash; 8th, 2026&nbsp;&nbsp;&middot;&nbsp;&nbsp;4:30 PM Daily&nbsp;&nbsp;&middot;&nbsp;&nbsp;Free Entry&nbsp;&nbsp;&middot;&nbsp;&nbsp;DELSU Prays&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
      </div>


      <div className="quote">
        <div className="bg" style={{ backgroundImage: "url(img/hero_night_a.jpg)" }} />
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
          <p className="slead">Every December since 2018, this field behind Ese-G Hostel becomes the loudest place in Delta.</p>
        </div>
        <div className="gal">
          {GAL.map(([f, cap, span], i) => (
            <figure key={i} className={"gi reveal " + span}>
              <img src={"img/" + f} alt={cap} loading="lazy" decoding="async" />
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
              <img src={img} alt={title} loading="lazy" decoding="async" />
              <div className="nin">
                <div className="no">{no} &middot; {date}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pad" id="invite" style={{ paddingTop: 20 }}>
        <div className="shead reveal">
          <p className="eyebrow">The invitation</p>
          <h2>Bring <em>someone</em> with you</h2>
          <p className="slead">Nobody should hear about this fire alone. Build a branded invite in seconds, then send it on WhatsApp or anywhere else.</p>
        </div>
        <Invite />
      </section>

      <section className="pad" id="live" style={{ paddingTop: 20 }}>
        <div className="shead reveal">
          <p className="eyebrow">Official updates</p>
          <h2>Updates &amp; <em>livestream</em></h2>
        </div>
        <div className="livecard reveal">
          {SITE.streamUrl ? (
            <iframe src={SITE.streamUrl} title="Faith & Fire Crusade livestream" width="560" height="315" style={{ maxWidth: "100%", border: 0, borderRadius: 6 }} loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <>
              <p className="ldot"><i />No broadcast yet</p>
              <h3>The stream will appear here</h3>
              <p>When a verified broadcast goes live, it plays right on this page. Until then, daily countdown flyers and official announcements land on the Telegram channel first.</p>
              <a className="btn line" href={SITE.telegram} target="_blank" rel="noopener" rel="noopener noreferrer" style={{ marginTop: 24 }}>Join the Telegram channel</a>
            </>
          )}
        </div>
      </section>

      <section className="pad" id="venue" style={{ paddingTop: 20 }}>
        <div className="shead reveal">
          <p className="eyebrow">The destination</p>
          <h2>Find the <em>fire</em></h2>
        </div>
        <div className="vcard reveal">
          <p className="vaddr">{SITE.venue.lines.map((l, i) => <span key={i}>{l}<br /></span>)}</p>
          <div className="vmarks">
            {SITE.venue.landmarks.map((m, i) => <span key={i}>{m}</span>)}
          </div>
          <div className="vbtns">
            <a className="btn gold" href={MAPS} target="_blank" rel="noopener" rel="noopener noreferrer">Get directions</a>
            <button type="button" className="btn line" data-copy={ADDR} style={{ background: "none", cursor: "pointer" }}>Copy address</button>
          </div>
          <p className="vnote">Coming from DELSU? Head toward Olori 19 Road and ask for Ese-G Hostel; the ground is directly behind it, opposite Gospel Stars Church.</p>
        </div>
      </section>

      <section className="pad" id="prayer" style={{ paddingTop: 20 }}>
        <div className="shead reveal">
          <p className="eyebrow">Before you come</p>
          <h2>Send a <em>prayer request</em></h2>
          <p className="slead">The watchmen pray over every request that reaches them. Write yours here and it goes straight to the prayer team.</p>
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Prayer />
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
          <form id="rform" noValidate={false}>
            <label htmlFor="fn">Full name</label><input id="fn" name="fn" required placeholder="Your full name" />
            <div className="row">
              <div><label htmlFor="ph">Phone (WhatsApp)</label><input id="ph" name="ph" required type="tel" placeholder="0801 234 5678" /></div>
              <div><label htmlFor="dy">Night(s)</label>
                <select id="dy" name="dy">
                  <option>All three nights</option><option>Sun 6 &middot; Opening</option>
                  <option>Mon 7 &middot; Fire Altars</option><option>Tue 8 &middot; Commissioning</option>
                </select>
              </div>
            </div>
            <button type="submit">Reserve my seat</button>
          </form>
          <div id="regok" className="regok">
            <img src="img/logo_mark.jpg" alt="" />
            <h3>Your seat is lit.</h3>
            <p>Reservation noted on this device. To make sure the team&rsquo;s desk has it, send it over in one tap:</p>
            <a id="regwa" className="ibtn solid" style={{ display: "inline-block", width: "auto", padding: "14px 28px", marginTop: 14 }} target="_blank" rel="noopener" rel="noopener noreferrer">Send on WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <img src="img/logo_mark.jpg" alt="The Watchmen Prayer Network International logo" />
        <div className="fm">The Watchmen Prayer Network Int&rsquo;l</div>
        <p className="verse">&ldquo;Raising a people of the Word, the Spirit, and Prayer&rdquo; &mdash; Ezekiel 33:7</p>
        <p className="meta">
          Pioneer: {SITE.pastor}<br />
          Crusade Ground, opposite Gospel Stars Church, off Olori 19 Road, behind Ese-G Hostel, Abraka, Delta State<br />
          Enquiries: {SITE.enquiries[0]} &middot; {SITE.enquiries[1]} &nbsp;&middot;&nbsp; <a href={SITE.telegram}>t.me/thewatchmenprayernetworkintl</a>
        </p>
      </footer>

      <div id="lb" className="lb" role="dialog" aria-label="Image viewer">
        <span id="lbx" className="x" role="button" aria-label="Close">&times;</span>
        <span id="lbpv" className="pv" role="button" aria-label="Previous image">&lsaquo;</span>
        <span id="lbnx" className="nx" role="button" aria-label="Next image">&rsaquo;</span>
        <img id="lbi" src="" alt="" />
        <div className="cap" id="lbc" />
      </div>
    </main>
  );
}
