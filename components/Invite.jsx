"use client";
import { useState } from "react";
import { SITE } from "../lib/config";

const addr = SITE.venue.lines.join(", ");
const base = SITE.name + " (" + "DELSU Prays, 9th Edition" + ")\n" +
  "\n" + SITE.days[0].full.split(",")[0] + " Dec 6 - " + SITE.days[2].full.split(",")[0] + " Dec 8, 2026 · 4:30 PM daily\n" +
  addr + "\nFree entry · Details & seat reservation: " + SITE.url;

export default function Invite() {
  const [you, setYou] = useState("");
  const [them, setThem] = useState("");
  const [copied, setCopied] = useState("");
  const [canShare, setCanShare] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const personal = (them ? them : "Your friend") + (you ? ", " + you + " is saving you a seat at the fire." : ", someone is saving you a seat at the fire.");
  const text = (them ? "Hi " + them + "! " : "") + (you ? you + " is inviting you to " : "You are invited to ") + base;

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied("Copied. Paste it anywhere."); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove(); setCopied("Copied. Paste it anywhere.");
    }
    setTimeout(() => setCopied(""), 4000);
  };

  const native = async () => {
    try { if (navigator.share) { await navigator.share({ title: SITE.name, text }); setCopied("Shared."); } }
    catch (e) { /* user cancelled */ }
  };

  const download = () => {
    try {
      const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
      const x = c.getContext("2d");
      x.fillStyle = "#100707"; x.fillRect(0, 0, 1080, 1350);
      let g = x.createRadialGradient(540, 1350, 40, 540, 1350, 900);
      g.addColorStop(0, "rgba(255,106,22,.55)"); g.addColorStop(.6, "rgba(255,106,22,.12)"); g.addColorStop(1, "rgba(255,106,22,0)");
      x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
      g = x.createRadialGradient(540, 0, 40, 540, 0, 700);
      g.addColorStop(0, "rgba(110,17,23,.6)"); g.addColorStop(1, "rgba(110,17,23,0)");
      x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
      x.textAlign = "center";
      x.fillStyle = "#ffb72e"; x.font = "500 26px 'DM Sans', sans-serif";
      x.fillText("T H E   W A T C H M E N   P R A Y E R   N E T W O R K", 540, 110);
      // logo
      const lg = new Image(); lg.src = "img/logo_mark.jpg";
      try { x.drawImage(lg, 540 - 60, 140, 120, 120); } catch (e) {}
      x.fillStyle = "#fff2d8"; x.font = "400 132px Anton, Impact, sans-serif";
      x.fillText("FAITH & FIRE", 540, 380);
      x.fillStyle = "#ff6a16"; x.font = "400 64px Anton, Impact, sans-serif";
      x.fillText("CRUSADE '26", 540, 452);
      x.fillStyle = "#ffd98a"; x.font = "italic 500 44px Georgia, serif";
      x.fillText("9TH EDITION - DELSU PRAYS", 540, 540);
      x.strokeStyle = "rgba(255,183,46,.5)"; x.lineWidth = 2;
      x.beginPath(); x.moveTo(390, 600); x.lineTo(690, 600); x.stroke();
      x.fillStyle = "#fff2d8"; x.font = "500 40px Georgia, serif";
      x.fillText("Sunday Dec 6 - Tuesday Dec 8, 2026", 540, 668);
      x.fillStyle = "#b8a49a"; x.font = "300 34px 'DM Sans', sans-serif";
      x.fillText("4:30 PM daily · Free entry", 540, 716);
      x.fillStyle = "#fff2d8"; x.font = "italic 36px Georgia, serif";
      wrap(x, personal, 540, 800, 860, 46);
      x.fillStyle = "#b8a49a"; x.font = "300 28px 'DM Sans', sans-serif";
      wrap(x, addr, 540, 950, 880, 38);
      x.fillStyle = "#ffb72e"; x.font = "500 30px 'DM Sans', sans-serif";
      x.fillText("faith-fire-crusade.vercel.app", 540, 1270);
      const url = c.toDataURL("image/png");
      const a = document.createElement("a"); a.href = url; a.download = "faith-fire-invite.png"; a.click();
      setCopied("Invitation image downloaded.");
    } catch (e) { setImgOk(false); setCopied("Image export is not supported on this browser. Use Copy or WhatsApp."); }
    setTimeout(() => setCopied(""), 5000);
  };
  return (
    <div className="invite">
      <div className="card" style={{ padding: "34px 30px" }}>
        <p style={{ fontSize: ".62rem", letterSpacing: ".26em", textTransform: "uppercase", color: "#7a5a22", fontWeight: 500, margin: 0 }}>Your name (optional)</p>
        <input aria-label="Your name" value={you} onChange={(e) => setYou(e.target.value)} placeholder="e.g. Chidi" style={{ width: "100%", background: "#fff", border: "1px solid rgba(36,20,7,.16)", color: "#241407", padding: "15px 16px", borderRadius: 4, fontFamily: "var(--sans)", fontSize: ".95rem", outline: "none", marginTop: 8 }} />
        <p style={{ fontSize: ".62rem", letterSpacing: ".26em", textTransform: "uppercase", color: "#7a5a22", fontWeight: 500, margin: "20px 0 8px" }}>Friend&apos;s name (optional)</p>
        <input aria-label="Friend's name" value={them} onChange={(e) => setThem(e.target.value)} placeholder="Who are you bringing?" style={{ width: "100%", background: "#fff", border: "1px solid rgba(36,20,7,.16)", color: "#241407", padding: "15px 16px", borderRadius: 4, fontFamily: "var(--sans)", fontSize: ".95rem", outline: "none" }} />
        <p style={{ color: "#6b5136", fontSize: ".85rem", lineHeight: 1.7, marginTop: 20 }}>The invitation updates as you type. Nothing is sent anywhere until you tap share.</p>
        <div className="ibtns">
          <button type="button" className="ibtn solid" onClick={copy}>Copy invitation</button>
          <a className="ibtn" href={"https://wa.me/?text=" + encodeURIComponent(text)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          {canShare ? <button type="button" className="ibtn" onClick={native}>More apps</button> : null}
          {imgOk ? <button type="button" className="ibtn" onClick={download}>Download image</button> : null}
        </div>
        <p className="icopied" role="status">{copied}</p>
      </div>
      <div className="iprev" aria-live="polite">
        <img src="img/logo_mark.jpg" alt="" />
        <div className="pt">Faith <span>&</span> Fire</div>
        <div className="pe">Crusade &rsquo;26 &middot; DELSU Prays</div>
        <div className="pline">{personal}</div>
        <div className="pchip">Dec 6 &ndash; 8 &middot; 4:30 PM daily</div>
        <div className="pvenue">{addr}</div>
      </div>
    </div>
  );
}
