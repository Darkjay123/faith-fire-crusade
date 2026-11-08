"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SITE } from "../lib/config";

/* The Ground 3D — a true 3D reproduction of the crusade ground at night,
   built from photos of past editions. Orbit to look around, tap a flame
   to fly to a place, panels carry the details. #site returns to the scroll site. */

const STATIONS = {
  stage: { fb: ["57%","43%"], label: "The Stage", pos: [0, 3.6, -2.5], tgt: [0, 3.0, -14.5], anchor: [-4.8, 6.3, -13.4] },
  screen: { fb: ["33%","24%"], label: "Programme", pos: [4.2, 4.0, -5.5], tgt: [5.4, 3.8, -14.5], anchor: [5.4, 5.95, -14.6] },
  gate: { fb: ["55%","88%"], label: "The Gate", pos: [2.5, 4.2, 20], tgt: [0, 2.2, 13.5], anchor: [0, 3.95, 13.5] },
  fire: { fb: ["30%","78%"], label: "Fire Altars", pos: [-8.0, 3.4, 9.0], tgt: [-11, 1.2, 3], anchor: [-11, 2.4, 3] },
  gallery: { fb: ["82%","60%"], label: "Moments", pos: [10, 3.2, 11], tgt: [0, 1.6, 0], anchor: [10, 2.6, 9] },
  roads: { fb: ["12%","88%"], label: "Directions", pos: [0, 26, 10], tgt: [0, 0, -6], anchor: [-7, 0.8, 13] },
};
const WIDE = { pos: [0, 9.5, 31], tgt: [0, 2.5, -10] };
const WIDE_M = { pos: [0, 5.4, 24], tgt: [0, 3.3, -7] };
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

/* canvas texture helpers */
function cnv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }

function dirtTex() {
  const c = cnv(512, 512), x = c.getContext("2d");
  x.fillStyle = "#2b1d12"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(${140 + Math.random() * 60},${90 + Math.random() * 40},${50 + Math.random() * 30},${0.04 + Math.random() * 0.09})`;
    const r = 1 + Math.random() * 2.4;
    x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, r, 0, 7); x.fill();
  }
  for (let i = 0; i < 40; i++) {
    x.fillStyle = "rgba(20,12,8,0.10)";
    x.beginPath(); x.ellipse(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 60, 10 + Math.random() * 30, Math.random() * 3, 0, 7); x.fill();
  }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t;
}

function backdropTex() {
  const c = cnv(512, 256), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#3a0f3e"); g.addColorStop(0.5, "#57104a"); g.addColorStop(1, "#1c0716");
  x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  const rg = x.createRadialGradient(256, 90, 10, 256, 90, 210);
  rg.addColorStop(0, "rgba(255,120,220,0.55)"); rg.addColorStop(1, "rgba(255,120,220,0)");
  x.fillStyle = rg; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = "rgba(255,180,240,0.22)"; x.lineWidth = 2;
  for (let i = 0; i < 14; i++) { const a = (i / 13) * Math.PI - Math.PI / 2; x.beginPath(); x.moveTo(256, 120); x.lineTo(256 + Math.cos(a) * 340, 120 + Math.sin(a) * 240); x.stroke(); }
  x.font = "bold 44px Georgia, serif"; x.fillStyle = "rgba(255,225,170,0.9)"; x.textAlign = "center";
  x.fillText("FAITH \u0026 FIRE", 256, 150);
  x.font = "18px Georgia, serif"; x.fillStyle = "rgba(255,210,160,0.75)";
  x.fillText("DELSU PRAYS \u00b7 THE 9TH EDITION", 256, 184);
  return tex(c);
}

function ledTex() { const c = cnv(512, 256); return { c, t: tex(c) }; }
function drawLED(c, cd) {
  const x = c.getContext("2d");
  x.fillStyle = "#06060c"; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = "rgba(255,140,40,0.35)"; x.lineWidth = 3; x.strokeRect(8, 8, 496, 240);
  x.textAlign = "center";
  x.font = "bold 58px Georgia, serif"; x.fillStyle = "#ffb72e";
  x.fillText("FAITH \u0026 FIRE", 256, 86);
  x.font = "bold 46px monospace"; x.fillStyle = "#ff6a16";
  x.fillText(cd || "LIVE", 256, 150);
  x.font = "22px Georgia, serif"; x.fillStyle = "rgba(255,242,216,0.8)";
  x.fillText("3 DAYS \u00b7 4:30 PM DAILY", 256, 200);
}
function bannerTex(text, bg, fg, size) {
  const c = cnv(512, 96), x = c.getContext("2d");
  x.fillStyle = bg; x.fillRect(0, 0, 512, 96);
  x.strokeStyle = "rgba(255,183,46,0.6)"; x.lineWidth = 4; x.strokeRect(4, 4, 504, 88);
  x.font = "bold " + (size || 40) + "px Georgia, serif"; x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, 256, 50);
  return tex(c);
}
function containerTex() {
  const c = cnv(512, 160), x = c.getContext("2d");
  x.fillStyle = "#7c3a1a"; x.fillRect(0, 0, 512, 160);
  for (let i = 0; i < 16; i++) { x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(i * 32, 0, 3, 160); }
  x.fillStyle = "#e8d9b8"; x.font = "bold 44px sans-serif"; x.textAlign = "center";
  x.fillText("THE WATCHMEN", 256, 70);
  x.font = "24px sans-serif"; x.fillStyle = "#ffb72e";
  x.fillText("PRAYER NETWORK INT'L", 256, 112);
  return tex(c);
}

export default function Ground3D() {
  const [station, setStation] = useState(null);
  const [mode, setMode] = useState("ground");
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState(true);
  const [light, setLight] = useState(null);
  const [cd, setCd] = useState("--");
  const [failed, setFailed] = useState("");
  const boxRef = useRef(null);       // canvas container
  const cdRef = useRef("--");
  const hotRef = useRef({});        // hotspot buttons
  const sceneRef = useRef(null);    // { flyTo(k), ledDraw(c, cd), dispose() }
  const ambRef = useRef(null);

  useEffect(() => {
    const read = () => {
      const h = (location.hash || "").replace("#", "");
      if (h === "site") setMode("site");
      else if (h === "ground" || h === "" || (h.startsWith("g") && !SITE_SECTIONS.includes(h))) setMode("ground");
      else setMode("site");
      const st = Object.keys(STATIONS).find((k) => h === "g" + k);
      setStation(st || null);
    };
    read(); addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("in-ground", mode === "ground");
    return () => document.body.classList.remove("in-ground");
  }, [mode]);
  useEffect(() => { const t = setTimeout(() => setHint(false), 8000); return () => clearTimeout(t); }, []);
  useEffect(() => { if (mode !== "ground") return; const t = setInterval(() => setCd(msToNext() || "LIVE"), 1000); setCd(msToNext() || "LIVE"); return () => clearInterval(t); }, [mode]);
  useEffect(() => { cdRef.current = cd; }, [cd]);

  /* fire ambience (Web Audio, on demand) */
  useEffect(() => {
    if (!sound) { if (ambRef.current) { try { ambRef.current.ctx.close(); } catch (e) {} ambRef.current = null; } return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC(); const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
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

  /* the 3D world */
  useEffect(() => {
    if (mode !== "ground" || !boxRef.current) return;
    const box = boxRef.current;
    let renderer, raf, disposed = false;
    const MOBILE = (typeof matchMedia !== "undefined" && matchMedia("(max-width: 820px)").matches) || (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
    const CAP = MOBILE ? 380 : 640, SCAP = MOBILE ? 90 : 150;
    try {
    const handle = { flyTo: null, drawLED: null };
    sceneRef.current = handle;

      renderer = new THREE.WebGLRenderer({ antialias: !MOBILE, powerPreference: MOBILE ? "low-power" : "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.2 : 1.6));
    renderer.setSize(box.clientWidth, box.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    box.appendChild(renderer.domElement);
    renderer.setClearColor(0x0a0608);
    renderer.domElement.className = "g3-canvas";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050308);
    scene.fog = new THREE.FogExp2(0x070409, 0.016);
    const camera = new THREE.PerspectiveCamera(58, box.clientWidth / box.clientHeight, 0.1, 220);

    /* sky: stars + faint moon */
    {
      const n = MOBILE ? 260 : 420, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const th = Math.random() * Math.PI * 2;
        pos[i * 3] = (Math.random() - 0.5) * 240; pos[i * 3 + 1] = 14 + Math.random() * 110; pos[i * 3 + 2] = (Math.random() - 0.5) * 240;
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fb4d8, size: 0.55, sizeAttenuation: false, transparent: true, opacity: 0.75 })));
    }

    /* lights */
    scene.add(new THREE.HemisphereLight(0x2a2136, 0x140d08, 1.1));
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const stageWash1 = new THREE.SpotLight(0xff4fd8, 400, 60, 0.55, 0.6); stageWash1.position.set(-4.5, 6.8, -15); stageWash1.target.position.set(0, 2.2, -12); scene.add(stageWash1, stageWash1.target);
    const stageWash2 = new THREE.SpotLight(0x4f7dff, 350, 60, 0.55, 0.6); stageWash2.position.set(4.5, 6.8, -15); stageWash2.target.position.set(0, 2.2, -12); scene.add(stageWash2, stageWash2.target);
    const crowdWashL = new THREE.SpotLight(0xfff2d8, 1600, 90, 0.5, 0.7); crowdWashL.position.set(-13, 9, 6); crowdWashL.target.position.set(-2, 0, 2); scene.add(crowdWashL, crowdWashL.target);
    const crowdWashR = new THREE.SpotLight(0xfff2d8, 1600, 90, 0.5, 0.7); crowdWashR.position.set(13, 9, 6); crowdWashR.target.position.set(2, 0, 2); scene.add(crowdWashR, crowdWashR.target);
    const moon = new THREE.DirectionalLight(0x8090b8, 0.6); moon.position.set(-30, 40, 20); scene.add(moon);

    /* materials */
    const M = {
      truss: new THREE.MeshStandardMaterial({ color: 0x7a8088, roughness: 0.5, metalness: 0.7 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x1b1414, roughness: 0.9 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.95 }),
      white: new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.85 }),
      black: new THREE.MeshStandardMaterial({ color: 0x0c0a0a, roughness: 0.7 }),
    };
    const add = (m, g, mat, x, y, z, ry) => { const o = new THREE.Mesh(g, mat); o.position.set(x, y, z); if (ry) o.rotation.y = ry; m.add(o); return o; };

    /* ground */
    const texLoader = new THREE.TextureLoader();
    const dirtMap = texLoader.load("tex/dirt_diff.jpg"); const dirtNor = texLoader.load("tex/dirt_nor.jpg"); const dirtRough = texLoader.load("tex/dirt_rough.jpg");
    [dirtMap, dirtNor, dirtRough].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 22); });
    dirtMap.colorSpace = THREE.SRGBColorSpace;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 80), new THREE.MeshStandardMaterial({ map: dirtMap, normalMap: dirtNor, normalScale: new THREE.Vector2(0.75, 0.75), roughnessMap: dirtRough, roughness: 1, color: 0xcdb494 }));
    ground.rotation.x = -Math.PI / 2; ground.position.z = 2; scene.add(ground);
    /* roads */
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x3d2e1e, roughness: 1, transparent: true, opacity: 0.85 });
    const roadL = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 46), roadMat); roadL.rotation.x = -Math.PI / 2; roadL.rotation.z = 0.18; roadL.position.set(-16, 0.02, 8); scene.add(roadL);
    const roadR = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 46), roadMat); roadR.rotation.x = -Math.PI / 2; roadR.rotation.z = -0.18; roadR.position.set(16, 0.02, 8); scene.add(roadR);

    /* ===== STAGE ===== */
    const stage = new THREE.Group(); scene.add(stage);
    add(stage, new THREE.BoxGeometry(13, 0.9, 6.5), M.dark, 0, 0.45, -15);
    add(stage, new THREE.BoxGeometry(13.4, 0.14, 6.9), new THREE.MeshStandardMaterial({ color: 0x2e1a16, roughness: 0.8, emissive: 0x180a10, emissiveIntensity: 0.4 }), 0, 0.96, -15);
    /* truss towers */
    const trussTower = (x, z, h) => {
      const t = new THREE.Group();
      const legs = [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]];
      legs.forEach(([lx, lz]) => add(t, new THREE.CylinderGeometry(0.055, 0.055, h, 6), M.truss, lx, h / 2, lz));
      for (let y = 0.8; y < h; y += 0.8) {
        add(t, new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), M.truss, 0, y, -0.55).rotation.z = Math.PI / 2;
        add(t, new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), M.truss, 0, y, 0.55).rotation.z = Math.PI / 2;
        add(t, new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), M.truss, -0.55, y, 0).rotation.x = Math.PI / 2;
        add(t, new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), M.truss, 0.55, y, 0).rotation.x = Math.PI / 2;
        const d1 = add(t, new THREE.CylinderGeometry(0.032, 0.032, 1.55, 5), M.truss, 0, y, 0); d1.rotation.z = Math.PI / 4;
      }
      return t;
    };
    const towerL = trussTower(-6, -13.4); towerL.position.set(-6, 0, -13.4); stage.add(towerL);
    const towerR = trussTower(6, -13.4); towerR.position.set(6, 0, -13.4); stage.add(towerR);
    const towerBL = trussTower(-6, -17.4); towerBL.position.set(-6, 0, -17.4); stage.add(towerBL);
    const towerBR = trussTower(6, -17.4); towerBR.position.set(6, 0, -17.4); stage.add(towerBR);
    /* roof truss beams across */
    const beamTop = (z, rotX) => { const b = new THREE.Group(); for (let i = 0; i < 9; i++) add(b, new THREE.CylinderGeometry(0.045, 0.045, 0.72, 6), M.truss, -6 + i * 1.5, 0, 0); const chord = add(b, new THREE.CylinderGeometry(0.05, 0.05, 12, 6), M.truss, 0, 0.3, 0); chord.rotation.z = Math.PI / 2; const chord2 = add(b, new THREE.CylinderGeometry(0.05, 0.05, 12, 6), M.truss, 0, -0.3, 0); chord2.rotation.z = Math.PI / 2; b.position.set(0, 6.6, z); b.rotation.x = rotX; stage.add(b); return b; };
    beamTop(-13.4, 0); beamTop(-17.4, 0); beamTop(-15.4, 0).position.y = 6.9;
    /* backdrop + LED */
    add(stage, new THREE.PlaneGeometry(11.6, 4.6), new THREE.MeshStandardMaterial({ map: backdropTex(), roughness: 0.9, emissive: 0x30102a, emissiveIntensity: 0.5, emissiveMap: backdropTex() }), 0, 3.3, -17.8);
    const led = ledTex(); drawLED(led.c, "--");
    const ledMesh = add(stage, new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: led.t }), 5.2, 3.9, -14.2); ledMesh.rotation.y = -0.12;
    /* speakers */
    const spk = (x) => { const s = new THREE.Group(); add(s, new THREE.BoxGeometry(1.15, 0.95, 0.95), M.black, 0, 1.35, 0); add(s, new THREE.BoxGeometry(1.15, 0.95, 0.95), M.black, 0, 2.35, 0); add(s, new THREE.BoxGeometry(1.3, 1.0, 1.0), M.black, 0, 0.5, 0); s.position.set(x, 0, -12.6); stage.add(s); };
    spk(-5.6); spk(5.6);
    /* performers: simple silhouettes */
    const silh = new THREE.MeshStandardMaterial({ color: 0x120b0e, roughness: 0.95 });
    const figure = (x, z, s) => { const g = new THREE.Group(); add(g, new THREE.CapsuleGeometry(0.18, 0.6, 4, 8), silh, 0, 0.75, 0); add(g, new THREE.SphereGeometry(0.14, 8, 8), silh, 0, 1.42, 0); const mic = add(g, new THREE.CylinderGeometry(0.02, 0.02, 1.3, 5), M.truss, 0.22, 0.85, 0.1); mic.rotation.z = 0.12; g.position.set(x, 1.0, z); g.scale.setScalar(s); stage.add(g); };
    figure(-2.2, -13.6, 1.1); figure(0.4, -14.2, 1.05); figure(2.6, -13.8, 1.1); figure(-4.4, -14.0, 1.0);
    /* drum kit suggestion */
    add(stage, new THREE.CylinderGeometry(0.55, 0.55, 0.5, 12), M.black, -0.6, 1.25, -16.2);
    add(stage, new THREE.CylinderGeometry(0.02, 0.02, 1.2, 5), M.truss, -0.6, 1.9, -16.2);
    /* stairs */
    add(stage, new THREE.BoxGeometry(1.6, 0.3, 0.5), M.wood, 0, 0.15, -11.4); add(stage, new THREE.BoxGeometry(1.6, 0.6, 0.5), M.wood, 0, 0.3, -11.95);

    /* ===== CROWD: real low-poly people (Polyfork free GLBs, vertex-coloured) ===== */
    const chairParts = [];
    const seat0 = new THREE.BoxGeometry(0.44, 0.06, 0.42); seat0.translate(0, 0.42, 0); chairParts.push(seat0);
    const back0 = new THREE.BoxGeometry(0.42, 0.5, 0.05); back0.translate(0, 0.66, -0.185); chairParts.push(back0);
    [[-0.18, 0.16], [0.18, 0.16], [-0.18, -0.16], [0.18, -0.16]].forEach(([lx, lz]) => { const leg0 = new THREE.BoxGeometry(0.045, 0.4, 0.045); leg0.translate(lx, 0.2, lz); chairParts.push(leg0); });
    const chairGeo = mergeGeometries(chairParts, false);
    const chairMesh = new THREE.InstancedMesh(chairGeo, new THREE.MeshStandardMaterial({ roughness: 0.8 }), CAP);
    const dummy = new THREE.Object3D(); const col = new THREE.Color();
    const slots = { seated: [], standing: [] };
    let ci = 0;
    for (let row = 0; row < 12 && ci < CAP; row++) {
      const r = 12.5 + row * 2.05, spread = 0.72 + row * 0.055;
      const n = Math.round(14 + r * 0.75);
      for (let k = 0; k < n && ci < CAP; k++) {
        const a = -spread + (k / (n - 1)) * 2 * spread;
        if (Math.abs(a) < 0.09 && row > 1) continue; // centre aisle
        const x = Math.sin(a) * r + (Math.random() - 0.5) * 0.35;
        const z = -12 + Math.cos(a) * r + (Math.random() - 0.5) * 0.35;
        if (z > 20) continue;
        const s = 0.93 + Math.random() * 0.2;
        const yaw = a + (Math.random() - 0.5) * 0.6;
        if (row < 4) slots.seated.push({ x, z, s, yaw });
        else slots.standing.push({ x, z, s, yaw });
        if (row < 4 || Math.random() < 0.3) {
          dummy.position.set(x, 0.27, z); dummy.rotation.set(0, a, 0); dummy.updateMatrix();
          chairMesh.setMatrixAt(ci, dummy.matrix);
          chairMesh.setColorAt(ci, col.setHex(Math.random() < 0.45 ? 0xdfe4e8 : 0x2f6fb8));
          ci++;
        }
      }
    }
    chairMesh.count = ci; scene.add(chairMesh);
    for (let i = 0; i < SCAP; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      slots.standing.push({ x: side * (9 + Math.random() * 14), z: -6 + Math.random() * 24, s: 0.9 + Math.random() * 0.25, yaw: side * (Math.PI / 2) + (Math.random() - 0.5) * 0.5 });
    }
    /* one instanced mesh per character model, filled as each model arrives */
    const FLIP = true; // models face +z by default; stage is toward -z
    const prep = (gltf) => {
      const geos = [];
      gltf.scene.traverse((o) => { if (o.isMesh) { const ge = o.geometry.clone(); ["skinIndex", "skinWeight", "uv", "uv2"].forEach((k) => ge.deleteAttribute(k)); geos.push(ge); } });
      if (!geos.length) return null;
      const geo = mergeGeometries(geos, false);
      if (!geo) return null;
      geo.computeBoundingBox(); const b = geo.boundingBox, c = new THREE.Vector3(); b.getCenter(c);
      geo.translate(-c.x, -b.min.y, -c.z);
      return geo;
    };
    const place = (file, spots) => {
      new GLTFLoader().load("models/" + file + ".glb", (gltf) => {
        if (disposed) return;
        try {
          const geo = prep(gltf);
          if (!geo) return;
          const inst = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }), spots.length);
          spots.forEach((sp, i) => {
            dummy.position.set(sp.x, sp.y || 0, sp.z);
            dummy.rotation.set(0, (FLIP ? Math.PI : 0) + sp.yaw, 0);
            dummy.scale.setScalar(sp.s || 1); dummy.updateMatrix();
            inst.setMatrixAt(i, dummy.matrix);
            const v = 0.66 + Math.random() * 0.42;
            inst.setColorAt(i, col.setRGB(v, v * 0.94, v * 0.88));
          });
          inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
          scene.add(inst);
        } catch (e) { /* one bad model never kills the world */ }
      });
    };
    const standFiles = MOBILE ? ["spectator-d086fe", "villager-40255c"] : ["spectator-d086fe", "villager-40255c", "cafe-customer-ca7e8e", "townswoman-5aa87f"];
    standFiles.forEach((f, i) => place(f, slots.standing.filter((_, j) => j % standFiles.length === i)));
    place("seated-office-worker-854671", slots.seated.map((sp) => ({ ...sp, y: 0.18 })));

    /* ===== ENVIRONMENT ===== */
    const tent = (x, z, s) => { const g = new THREE.Group(); const c = add(g, new THREE.ConeGeometry(3.1, 2.6, 8), new THREE.MeshStandardMaterial({ color: 0xe9e2d4, roughness: 0.9, emissive: 0x35302a, emissiveIntensity: 0.35 }), 0, 1.7, 0); c.rotation.y = Math.PI / 8; add(g, new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), M.truss, 0, 3.4, 0); add(g, new THREE.BoxGeometry(0.25, 0.35, 0.02), new THREE.MeshStandardMaterial({ color: 0xff6a16, emissive: 0xff6a16, emissiveIntensity: 0.7 }), 0, 3.9, 0); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g); };
    tent(-11.5, -13.5, 1.1); tent(14.5, -10.5, 0.9); tent(-16, 6, 0.8);
    /* light masts with beams */
    const sway = [];
    const mast = (x, z, tx, tz) => {
      const g = new THREE.Group();
      add(g, new THREE.CylinderGeometry(0.14, 0.18, 9, 8), M.truss, 0, 4.5, 0);
      add(g, new THREE.BoxGeometry(1.7, 0.35, 0.35), M.truss, 0, 9.1, 0);
      const heads = [-0.6, 0.6].map((o) => add(g, new THREE.BoxGeometry(0.5, 0.3, 0.4), M.black, o, 8.95, 0.1));
      g.position.set(x, 0, z); g.lookAt(tx, 0, tz); g.rotation.x = 0; g.rotation.z = 0;
      const spot = new THREE.SpotLight(0xfff2d8, 2500, 110, 0.42, 0.55); spot.position.set(x, 9, z); spot.target.position.set(tx, 0, tz); scene.add(spot, spot.target);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(5.5, 15, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9c0, transparent: true, opacity: 0.055, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      beam.position.set(x, 9, z);
      const dir = new THREE.Vector3(tx - x, -9, tz - z).normalize();
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
      beam.geometry.translate(0, -7.5, 0);
      const holder = new THREE.Group(); holder.add(beam); scene.add(holder);
      sway.push({ holder, base: beam.quaternion.clone(), phase: Math.random() * 6, amp: 0.02 + Math.random() * 0.02 });
      scene.add(g);
    };
    mast(-13, 7, 2, -8); mast(13, 7, -2, -8); mast(-17, -6, 0, 2);

    /* buildings behind the fence */
    const bldg = (x, z, w, d, h, ry) => {
      const g = new THREE.Group();
      add(g, new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x2a2119, roughness: 0.95 }), 0, h / 2, 0);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x17110c, roughness: 0.9 });
      const r1 = add(g, new THREE.BoxGeometry(w + 0.6, 0.12, Math.hypot(d / 2 + 0.4, h * 0.35)), roofMat, 0, h + h * 0.18, -d / 4); r1.rotation.x = -Math.atan2(h * 0.35, d / 2 + 0.4);
      const r2 = add(g, new THREE.BoxGeometry(w + 0.6, 0.12, Math.hypot(d / 2 + 0.4, h * 0.35)), roofMat, 0, h + h * 0.18, d / 4); r2.rotation.x = Math.atan2(h * 0.35, d / 2 + 0.4);
      const win = new THREE.MeshStandardMaterial({ color: 0xffb066, emissive: 0xffb066, emissiveIntensity: 0.8 });
      for (let i = 0; i < 3; i++) add(g, new THREE.PlaneGeometry(0.5, 0.6), win, -w / 3 + i * (w / 3), h * 0.55, d / 2 + 0.01);
      g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g);
    };
    bldg(23, -8, 7, 5, 3.4, -0.2); bldg(25, 2, 6, 6, 4.2, 0.1); bldg(24, 12, 8, 5, 3.2, -0.15); bldg(-24, -4, 7, 5, 3.6, 0.2); bldg(-25, 10, 6, 5, 3, -0.1);
    /* palm trees, market stalls and stacks: real low-poly models */
    place("palm-tree-a307da", [[-21, -14, 1.15], [-23, -6, 1.25], [-22, 2, 1.05], [-20, 14, 1.15], [-24, 20, 1], [22, -16, 1.3], [20, -20, 1], [-8, -22, 1.1], [6, -22, 1.3], [0, -24, 1]]);
    place("market-stall-94937d", [[-16.5, -9, 1.15, 0.5], [16, -13, 1.1, -0.6], [17.5, 6, 1, 2.2]]);
    place("portable-party-speaker-92cdc1", [[-4.9, -12.2, 1.35, 0], [4.9, -12.2, 1.35, Math.PI]]);
    /* container + fence + banners */
    const cont = new THREE.Mesh(new THREE.BoxGeometry(9, 2.4, 2.4), new THREE.MeshStandardMaterial({ map: containerTex(), roughness: 0.85 }));
    cont.position.set(18.5, 1.2, -2); cont.rotation.y = 0.1; scene.add(cont);
    const fence = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.7, 34), new THREE.MeshStandardMaterial({ color: 0x4a443c, roughness: 0.95 }));
    fence.position.set(21.5, 0.85, 2); scene.add(fence);
    const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex("FAITH \u0026 FIRE \u00b7 DELSU PRAYS", "#4a1010", "#ffb72e", 30), roughness: 0.9, emissive: 0x2a0c08, emissiveIntensity: 0.5 });
    [-8, 4, 14].forEach((z) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.05), bannerMat); b.position.set(21.3, 1.6, z); b.rotation.y = -Math.PI / 2; scene.add(b); });
    /* gate at the front */
    const gate = new THREE.Group();
    add(gate, new THREE.CylinderGeometry(0.12, 0.14, 3.4, 6), M.truss, -2.6, 1.7, 0);
    add(gate, new THREE.CylinderGeometry(0.12, 0.14, 3.4, 6), M.truss, 2.6, 1.7, 0);
    const gban = add(gate, new THREE.PlaneGeometry(5.0, 0.8), new THREE.MeshStandardMaterial({ map: bannerTex("WELCOME \u00b7 FAITH & FIRE", "#2a0f0f", "#ffdf9e", 28), emissive: 0x6a2a10, emissiveIntensity: 1.5 }), 0, 3.05, 0);
    gate.position.set(0, 0, 13.5); scene.add(gate);
    /* parked cars */
    const car = (x, z, c, ry) => { const g = new THREE.Group(); add(g, new THREE.BoxGeometry(2.5, 0.75, 1.25), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.3 }), 0, 0.55, 0); add(g, new THREE.BoxGeometry(1.4, 0.55, 1.1), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.3 }), -0.15, 1.2, 0); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); };
    car(19.5, 15, 0x1a1d22, 0.25); car(23, 17, 0x352038, -0.1); car(19, 18.6, 0x3a1c1c, 0.3);

    /* fire altars */
    const flames = [], fireLights = [];
    const altar = (x, z) => {
      const g = new THREE.Group();
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; add(g, new THREE.BoxGeometry(0.28, 0.2, 0.22), new THREE.MeshStandardMaterial({ color: 0x55504a, roughness: 1 }), Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5); }
      const f = add(g, new THREE.ConeGeometry(0.3, 1.05, 8), new THREE.MeshBasicMaterial({ color: 0xff8a1e, transparent: true, opacity: 0.92 }), 0, 0.68, 0);
      const fl = new THREE.PointLight(0xff7a1e, 60, 16, 2); fl.position.set(0, 1, 0); g.add(fl);
      g.position.set(x, 0, z); scene.add(g); flames.push(f); fireLights.push(fl);
    };
    altar(-11, 3); altar(11, 3);
    /* drifting embers over the field */
    const emN = MOBILE ? 70 : 130, emPos = new Float32Array(emN * 3), emSeed = [];
    for (let i = 0; i < emN; i++) { emPos[i * 3] = (Math.random() - 0.5) * 44; emPos[i * 3 + 1] = Math.random() * 8; emPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 2; emSeed.push({ s: 0.008 + Math.random() * 0.02, p: Math.random() * 6 }); }
    const emGeo = new THREE.BufferGeometry(); emGeo.setAttribute("position", new THREE.BufferAttribute(emPos, 3));
    const embers = new THREE.Points(emGeo, new THREE.PointsMaterial({ color: 0xffa04a, size: 0.09, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(embers);

    /* cinematic bloom on desktop */
    let composer = null;
    if (!MOBILE) {
      try {
        composer = new EffectComposer(renderer);
        composer.setPixelRatio(renderer.getPixelRatio());
        composer.setSize(box.clientWidth, box.clientHeight);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(box.clientWidth, box.clientHeight), 0.55, 0.85, 0.68));
        composer.addPass(new OutputPass());
      } catch (e) { composer = null; }
    }

    /* camera + controls */
    const wide = MOBILE ? WIDE_M : WIDE;
    camera.position.set(...wide.pos);
    const look = new THREE.Vector3(...wide.tgt);
    const sph = { radius: Math.hypot(camera.position.x - look.x, camera.position.y - look.y, camera.position.z - look.z), theta: Math.atan2(camera.position.x - look.x, camera.position.z - look.z), phi: Math.acos((camera.position.y - look.y) / camera.position.distanceTo(look)) };
    let flight = null;
    const flyTo = (p, t) => { flight = { p: p.slice(), t: t.slice(), k: 0 }; };
    handle.flyTo = (k) => { const s = k ? STATIONS[k] : (MOBILE ? WIDE_M : WIDE); flyTo(s.pos, s.tgt); };
    let dragging = false, moved = false, px = 0, py = 0, pinch = 0;
    const el = renderer.domElement;
    const onDown = (e) => { dragging = true; moved = false; px = e.clientX; py = e.clientY; flight = null; };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      px = e.clientX; py = e.clientY;
      sph.theta -= dx * 0.0042; sph.phi = Math.min(1.32, Math.max(0.18, sph.phi - dy * 0.0034));
    };
    const onUp = () => { dragging = false; };
    const onWheel = (e) => { e.preventDefault(); sph.radius = Math.min(58, Math.max(6, sph.radius + e.deltaY * 0.02)); };
    const touchMove = (e) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (pinch) sph.radius = Math.min(58, Math.max(6, sph.radius - (d - pinch) * 0.06));
        pinch = d;
      } else pinch = 0;
    };
    el.addEventListener("pointerdown", onDown); addEventListener("pointermove", onMove); addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", touchMove, { passive: true });
    el.addEventListener("touchend", () => { pinch = 0; });

    let t0 = performance.now(), lastSec = 0, ftAcc = 0, ftN = 0, qLevel = 0;
    const loop = (now) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      try {
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      if (!MOBILE ? false : (ftN++, ftAcc += dt, ftN >= 50)) {
        const avg = ftAcc / ftN; ftAcc = 0; ftN = 0;
        if (avg > 0.038 && qLevel === 0) { qLevel = 1; renderer.setPixelRatio(1); fixSize(); }
        else if (avg > 0.038 && qLevel === 1) { qLevel = 2; sway.forEach((s2) => { s2.holder.visible = false; }); embers.visible = false; }
      }
      /* flight */
      if (flight) {
        flight.k = Math.min(1, flight.k + dt * 0.9);
        const e = 1 - Math.pow(1 - flight.k, 3);
        const p = new THREE.Vector3(...flight.p), tg = new THREE.Vector3(...flight.t);
        const from = new THREE.Vector3().setFromSpherical(sph).add(look);
        const fromL = new THREE.Vector3().lerpVectors(look, tg, e);
        camera.position.lerpVectors(from, p, e); look.lerpVectors(look.clone(), tg, e);
        const cur = camera.position.clone().sub(fromL);
        if (flight.k >= 1) { sph.radius = cur.length(); sph.theta = Math.atan2(cur.x, cur.z); sph.phi = Math.acos(Math.max(-1, Math.min(1, cur.y / cur.length()))); look.copy(tg); flight = null; }
        camera.lookAt(fromL);
      } else {
        camera.position.setFromSpherical(sph).add(look);
        camera.lookAt(look);
      }
      /* sway + fire + embers */
      const t = now / 1000;
      sway.forEach((s) => { s.holder.quaternion.copy(s.base); s.holder.rotateZ(Math.sin(t * 0.5 + s.phase) * s.amp); });
      flames.forEach((f, i) => { const k = 1 + Math.sin(t * 9 + i * 2.4) * 0.16 + Math.sin(t * 23 + i) * 0.07; f.scale.set(k, 1 + (k - 1) * 1.6, k); });
      fireLights.forEach((l, i) => { l.intensity = 34 + Math.sin(t * 11 + i * 3) * 8; });
      const pos = emGeo.attributes.position.array;
      for (let i = 0; i < emN; i++) { pos[i * 3 + 1] += emSeed[i].s; pos[i * 3] += Math.sin(t + emSeed[i].p) * 0.004; if (pos[i * 3 + 1] > 9) { pos[i * 3 + 1] = 0.1; } }
      emGeo.attributes.position.needsUpdate = true;
      if (now - lastSec > 950 && handle.drawLED) { handle.drawLED(); lastSec = now; }
      /* project hotspot buttons */
      const hv = new THREE.Vector3();
      for (const k of Object.keys(STATIONS)) {
        const btn = hotRef.current[k]; if (!btn) continue;
        const a = STATIONS[k].anchor;
        hv.set(a[0], a[1], a[2]).project(camera);
        if (hv.z > 1) { btn.style.display = "none"; continue; }
        btn.style.display = "";
        btn.style.left = `${(hv.x * 0.5 + 0.5) * 100}%`;
        btn.style.top = `${(-hv.y * 0.5 + 0.5) * 100}%`;
      }
      if (composer) composer.render(); else renderer.render(scene, camera);
      } catch (err) {
        disposed = true; cancelAnimationFrame(raf);
        setFailed("3D frame error: " + (err && err.message ? err.message : String(err)));
      }
    };
    raf = requestAnimationFrame(loop);

    /* LED refresh bridge */
    handle.drawLED = () => { drawLED(led.c, cdRef.current); led.t.needsUpdate = true; };

    const fixSize = () => {
      const w = box.clientWidth || innerWidth, h = box.clientHeight || innerHeight;
      if (renderer.domElement.width !== Math.round(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(h * renderer.getPixelRatio())) renderer.setSize(w, h);
      const a = w / h;
      if (composer) composer.setSize(w, h);
      if (isFinite(a) && Math.abs(camera.aspect - a) > 0.001) { camera.aspect = a; camera.updateProjectionMatrix(); }
    };
    const onResize = () => fixSize();
    fixSize();
    addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fixSize) : null;
    if (ro) ro.observe(box);

    return () => {
      disposed = true; cancelAnimationFrame(raf);
      removeEventListener("resize", onResize); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); if (ro) ro.disconnect();
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("wheel", onWheel); el.removeEventListener("touchmove", touchMove);
      renderer.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => { if (mm.map) mm.map.dispose(); mm.dispose(); }); } });
    };
    } catch (err) {
      setFailed("3D build error: " + (err && err.message ? err.message : String(err)));
      return () => {};
    }
    /* eslint-disable-next-line */
  }, [mode]);

  /* fly when the station changes */
  useEffect(() => {
    if (mode !== "ground") return;
    sceneRef.current && sceneRef.current.flyTo && sceneRef.current.flyTo(station);
  }, [station, mode]);

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

  return (
    <div className={`ground ${station ? "focused" : ""}`} role="region" aria-label="Interactive crusade ground in 3D">
      <div ref={boxRef} className="g3-stagebox" />
      {failed ? (
        <div className="g3-fail"><span>{failed}</span>Your browser could not open the 3D ground. <button className="g-hbtn gold" onClick={() => toSite("site")}>Open the simple view</button></div>
      ) : null}
      {/* hotspots projected onto the world */}
      {Object.keys(STATIONS).map((k) => (
        <button key={k} ref={(r) => { hotRef.current[k] = r; }} className={`g3-hot ${station === k ? "on" : ""}`} onClick={() => go(station === k ? null : k)} aria-label={STATIONS[k].label} style={{ left: STATIONS[k].fb[0], top: STATIONS[k].fb[1] }}>
          <i /><span>{STATIONS[k].label}</span>
        </button>
      ))}
      <header className="g-head">
        <span className="g-brand"><i className="g-flame" />FAITH &amp; FIRE <em>&rsquo;26</em></span>
        <nav className="g-hnav" aria-label="Ground navigation">
          <button className="g-hbtn" onClick={() => setSound(!sound)} aria-pressed={sound}>{sound ? "Sound on" : "Sound"}</button>
          <button className="g-hbtn gold" onClick={() => toSite("site")}>Simple view</button>
        </nav>
      </header>
      {hint && !station ? <div className="g-hint">Drag to walk the ground &middot; pinch to zoom &middot; tap a flame to enter a place</div> : null}
      <nav className="g-chips" aria-label="Places on the ground">
        <button className={station === null ? "on" : ""} onClick={() => go(null)}>Whole ground</button>
        <button className={station === "stage" ? "on" : ""} onClick={() => go("stage")}>Stage</button>
        <button className={station === "screen" ? "on" : ""} onClick={() => go("screen")}>Programme</button>
        <button className={station === "gate" ? "on" : ""} onClick={() => go("gate")}>The Gate</button>
        <button className={station === "fire" ? "on" : ""} onClick={() => go("fire")}>Fire Altars</button>
        <button className={station === "gallery" ? "on" : ""} onClick={() => go("gallery")}>Moments</button>
        <button className={station === "roads" ? "on" : ""} onClick={() => go("roads")}>Directions</button>
      </nav>
      {st ? (
        <aside className="g-panel" role="dialog" aria-label={st.label}>
          <button className="g-close" onClick={() => go(null)} aria-label="Back to the whole ground">&larr; Whole ground</button>
          {station === "stage" ? (
            <>
              <h2>The Stage</h2>
              <figure className="g-photo"><img src="img/ground_preacher.jpg" alt="The pioneer ministering on the crusade ground" loading="lazy" /></figure>
              <p className="g-lead">Every night, the Word comes first.</p>
              <div className="g-card"><b>Pioneer</b><strong>{SITE.pastor}</strong><span>The Watchmen Prayer Network Int&rsquo;l &middot; {SITE.edition}</span></div>
              <p className="g-note">Guest ministers for the 9th edition are announced closer to the dates. Follow the channel so you hear it first.</p>
              <a className="g-cta" href={SITE.telegram} target="_blank" rel="noopener noreferrer">Follow on Telegram &nearr;</a>
            </>
          ) : null}
          {station === "screen" ? (
            <>
              <h2>Programme</h2>
              <div className="g-count"><span>{cd}</span><small>until the next session begins</small></div>
              <ul className="g-days">
                {SITE.days.map((d) => (<li key={d.start}><b>{d.label}</b><span>{d.full.replace(", 2026", "")} &middot; 4:30 PM</span><em>{d.title}</em></li>))}
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
                  <button key={src} onClick={() => setLight(src)} aria-label={cap}><img src={src} alt={cap} loading="lazy" /><span>{cap}</span></button>
                ))}
              </div>
            </>
          ) : null}
          {station === "roads" ? (
            <>
              <h2>Directions</h2>
              <address>{SITE.venue.lines.map((l) => <span key={l}>{l}<br /></span>)}</address>
              <a className="g-cta" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.venue.mapQuery)}`} target="_blank" rel="noopener noreferrer">Get directions &nearr;</a>
              <p className="g-note">Look for Gospel Stars Church; the ground is directly opposite. Behind Ese-G Hostel, off Olori 19 Road.</p>
              <div className="g-card"><b>Enquiries</b>{SITE.enquiries.map((p) => <span key={p}>{p}</span>)}</div>
            </>
          ) : null}
        </aside>
      ) : null}
      {light ? (<div className="g-light" role="dialog" aria-label="Photo" onClick={() => setLight(null)}><img src={light} alt="" /></div>) : null}
    </div>
  );
}
