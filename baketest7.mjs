import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'fs';
const load = async (f) => { const buf = fs.readFileSync('public/models/'+f); return new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength), ''); };

const bakeSkinned = (mesh) => {
  const g = mesh.geometry, sk = mesh.skeleton;
  const geo = g.clone();
  const pos = geo.attributes.position;
  const si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const p0 = new THREE.Vector3(), out = new THREE.Vector3(), tmp = new THREE.Vector3(), M = new THREE.Matrix4();
  const idx = [0,0,0,0], wts = [0,0,0,0];
  for (let i = 0; i < pos.count; i++) {
    p0.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mesh.bindMatrix);
    out.set(0, 0, 0);
    idx[0]=si.getX(i); idx[1]=si.getY(i); idx[2]=si.getZ(i); idx[3]=si.getW(i);
    wts[0]=sw.getX(i); wts[1]=sw.getY(i); wts[2]=sw.getZ(i); wts[3]=sw.getW(i);
    for (let k = 0; k < 4; k++) {
      const w = wts[k];
      if (w === 0) continue;
      M.multiplyMatrices(sk.bones[idx[k]].matrixWorld, sk.boneInverses[idx[k]]);
      out.addScaledVector(tmp.copy(p0).applyMatrix4(M), w);
    }
    out.applyMatrix4(mesh.bindMatrixInverse);
    pos.setXYZ(i, out.x, out.y, out.z);
  }
  geo.computeVertexNormals();
  return geo;
};

const bakePose = (gltf, mode) => {
  const sc = skeletonClone(gltf.scene);
  const byName = {};
  sc.traverse((o) => { if (o.isBone) byName[o.name.toLowerCase().replace(/mixamorig/g, "").replace(/[^a-z]/g, "")] = o; });
  const a = mode === 1 ? 2.5 : mode === 2 ? 1.05 : 1.3;
  ["leftarm", "rightarm"].forEach((k, i) => { const b = byName[k]; if (b) b.rotation.z += i ? a : -a; });
  ["leftforearm", "rightforearm"].forEach((k) => { const b = byName[k]; if (b) b.rotation.x += mode === 1 ? -0.35 : -0.12; });
  sc.updateMatrixWorld(true);
  const geos = [];
  sc.traverse((o) => {
    if (o.isSkinnedMesh) { const ge = bakeSkinned(o); ['skinIndex','skinWeight','uv','uv2'].forEach(k => ge.deleteAttribute(k)); geos.push(ge); }
    else if (o.isMesh) { const ge = o.geometry.clone(); ['skinIndex','skinWeight','uv','uv2'].forEach(k => ge.deleteAttribute(k)); geos.push(ge); }
  });
  if (!geos.length) return null;
  const geo = mergeGeometries(geos, false);
  if (!geo) return null;
  geo.computeBoundingBox(); const b = geo.boundingBox, c = new THREE.Vector3(); b.getCenter(c);
  geo.translate(-c.x, -b.min.y, -c.z);
  return geo;
};

for (const f of ['spectator-d086fe.glb', 'townswoman-5aa87f.glb', 'seated-office-worker-854671.glb']) {
  const gltf = await load(f);
  for (const mode of [0, 1, 2]) {
    const geo = bakePose(gltf, mode);
    if (!geo) { console.log(f, mode, 'FAILED'); continue; }
    const b = geo.boundingBox; const s = new THREE.Vector3(); b.getSize(s);
    console.log(f.split('-')[0], 'mode', mode, 'w=' + s.x.toFixed(2), 'd=' + s.z.toFixed(2), 'h=' + s.y.toFixed(2), 'color=' + !!geo.attributes.color);
  }
}
