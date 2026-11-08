import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'fs';
const buf = fs.readFileSync('public/models/spectator-d086fe.glb');
const gltf = await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength), '');
const bakeSkinned = (mesh) => {
  const g = mesh.geometry, sk = mesh.skeleton;
  const geo = g.clone();
  const pos = geo.attributes.position;
  const si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const p0 = new THREE.Vector3(), out = new THREE.Vector3(), tmp = new THREE.Vector3(), M = new THREE.Matrix4();
  for (let i = 0; i < pos.count; i++) {
    p0.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mesh.bindMatrix);
    out.set(0, 0, 0);
    const idx = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)];
    const wts = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)];
    for (let k = 0; k < 4; k++) { if (wts[k] === 0) continue; M.multiplyMatrices(sk.bones[idx[k]].matrixWorld, sk.boneInverses[idx[k]]); out.addScaledVector(tmp.copy(p0).applyMatrix4(M), wts[k]); }
    out.applyMatrix4(mesh.bindMatrixInverse);
    pos.setXYZ(i, out.x, out.y, out.z);
  }
  geo.computeVertexNormals();
  return geo;
};
const poses = [[0, -1.3, 1.3], [1, 1.7, -1.7], [2, 0.9, -0.9]];
const out = [];
for (const [mode, la, ra] of poses) {
  const sc = skeletonClone(gltf.scene);
  const byName = {};
  sc.traverse((o) => { if (o.isBone) byName[o.name.toLowerCase().replace(/mixamorig/g, "").replace(/[^a-z]/g, "")] = o; });
  if (byName.leftarm) byName.leftarm.rotation.z += la;
  if (byName.rightarm) byName.rightarm.rotation.z += ra;
  if (byName.leftforearm) byName.leftforearm.rotation.x += mode === 1 ? -0.35 : -0.12;
  if (byName.rightforearm) byName.rightforearm.rotation.x += mode === 1 ? -0.35 : -0.12;
  sc.updateMatrixWorld(true);
  const geos = [];
  sc.traverse((o) => { if (o.isSkinnedMesh) geos.push(bakeSkinned(o)); else if (o.isMesh) geos.push(o.geometry.clone()); });
  const geo = mergeGeometries(geos, false);
  geo.computeBoundingBox(); const b = geo.boundingBox, c = new THREE.Vector3(); b.getCenter(c);
  geo.translate(-c.x, -b.min.y, -c.z);
  geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s);
  console.log('mode', mode, 'w=' + s.x.toFixed(2), 'h=' + s.y.toFixed(2));
  const pos = geo.attributes.position;
  const pts = [];
  for (let i = 0; i < pos.count; i += 2) pts.push([pos.getX(i), pos.getY(i)]);
  out.push({ mode, pts });
}
fs.writeFileSync('/tmp/posepts2.json', JSON.stringify(out));
