"use client";
import { useState } from "react";
import { SITE } from "../lib/config";

export default function Testimony() {
  const [name, setName] = useState("");
  const [what, setWhat] = useState("");
  const [story, setStory] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState("");
  const [copied, setCopied] = useState(false);

  const msg = "TESTIMONY - Faith & Fire Crusade\n" +
    (name ? "Name: " + name + "\n" : "") +
    (what ? "What the Lord did: " + what + "\n" : "") +
    "\n" + story +
    (contact ? "\n\nReach me on: " + contact : "");

  const submit = (e) => {
    e.preventDefault();
    if (!story.trim()) { setErr("Write your testimony before sending, even if it is one line."); return; }
    if (!consent) { setErr("Please tick the box so the team knows they may hear this from you."); return; }
    setErr("");
    const ok = window.open("https://wa.me/" + SITE.prayerWhatsApp + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    setSent(ok ? "WhatsApp is open with your testimony. Press send there and it lands with the Watchmen."
               : "WhatsApp did not open. Tap Copy below and send the text to " + SITE.enquiries[0] + " on WhatsApp.");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(msg); } catch (err) {
      const ta = document.createElement("textarea"); ta.value = msg; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 4000);
  };

  const inp = { width: "100%", background: "#fff", border: "1px solid rgba(36,20,7,.16)", color: "#241407",
    padding: "15px 16px", borderRadius: 4, fontFamily: "var(--sans)", fontSize: ".95rem", outline: "none" };
  const lab = { fontSize: ".62rem", letterSpacing: ".26em", textTransform: "uppercase", color: "#7a5a22", fontWeight: 500, margin: "20px 0 8px" };

  return (
    <div className="card" style={{ padding: "36px 32px" }}>
      <form onSubmit={submit} noValidate>
        <p style={{ ...lab, margin: 0 }}>First name (optional)</p>
        <input aria-label="First name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chidi" style={inp} />
        <p style={lab}>What the Lord did, in one line</p>
        <input aria-label="What the Lord did" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="e.g. He opened a door I had given up on" style={inp} />
        <p style={lab}>Your testimony</p>
        <textarea aria-label="Your testimony" required value={story} onChange={(e) => setStory(e.target.value)} placeholder="Tell it the way it happened. It can be from this crusade or any season of your life." style={inp} />
        <p style={lab}>How can the team reach you? (optional)</p>
        <input aria-label="Contact information" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or WhatsApp" style={inp} />
        <label className="chk">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I agree to share this testimony with the Watchmen team.</span>
        </label>
        <p className="ferr" role="alert">{err}</p>
        <button type="submit" style={{ width: "100%", marginTop: 16, border: 0, cursor: "pointer", padding: 18, borderRadius: 999, fontFamily: "var(--sans)", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", fontSize: ".72rem", background: "linear-gradient(120deg,var(--gold-l),var(--gold) 55%,var(--gold-d))", color: "#2a1608", boxShadow: "0 14px 40px rgba(169,124,63,.35)" }}>
          Send my testimony
        </button>
      </form>
      {sent ? (
        <div className="pok" style={{ display: "block" }}>
          <h3>Your testimony is on its way.</h3>
          <p>{sent}</p>
          <button type="button" className="ibtn" onClick={copy} style={{ marginTop: 14 }}>{copied ? "Copied" : "Copy the text"}</button>
        </div>
      ) : null}
      <p style={{ color: "#6b5136", fontSize: ".78rem", lineHeight: 1.7, marginTop: 20 }}>
        Testimonies are not published on this site and nothing is stored on the website itself. Your story goes directly to the Watchmen team on WhatsApp, and it stays yours.
      </p>
    </div>
  );
}
