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
const trial = async (side, axis, sgn, amt) => {
  const sc = skeletonClone(gltf.scene);
  const byName = {};
  sc.traverse((o) => { if (o.isBone) byName[o.name.toLowerCase().replace(/mixamorig/g, "").replace(/[^a-z]/g, "")] = o; });
  const b = byName[side + 'arm'];
  if (!b) return console.log(side, 'no bone');
  b.rotation.set(0, 0, 0);
  b.rotation[axis] = amt * sgn;
  sc.updateMatrixWorld(true);
  const geos = [];
  sc.traverse((o) => { if (o.isSkinnedMesh) geos.push(bakeSkinned(o)); });
  const geo = mergeGeometries(geos, false);
  geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s);
  console.log(side, axis, sgn * amt, '-> w=' + s.x.toFixed(2), 'd=' + s.z.toFixed(2), 'h=' + s.y.toFixed(2));
};
for (const side of ['left', 'right']) {
  for (const axis of ['x', 'y', 'z']) {
    for (const sgn of [1, -1]) await trial(side, axis, sgn, 1.2);
  }
}
