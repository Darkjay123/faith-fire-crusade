import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'fs';
const load = async (f) => { const buf = fs.readFileSync('public/models/'+f); return new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength), ''); };

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
    if (o.isSkinnedMesh) {
      const apply = o.applyBoneTransform ? o.applyBoneTransform.bind(o) : o.boneTransform.bind(o);
      const geo = o.geometry.clone();
      const pos = geo.attributes.position; const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) { apply(i, v); pos.setXYZ(i, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      ['skinIndex','skinWeight','uv','uv2'].forEach(k => geo.deleteAttribute(k));
      geos.push(geo);
    } else if (o.isMesh) { const ge = o.geometry.clone(); ['skinIndex','skinWeight','uv','uv2'].forEach(k => ge.deleteAttribute(k)); geos.push(ge); }
  });
  if (!geos.length) return null;
  const geo = mergeGeometries(geos, false);
  if (!geo) return null;
  geo.computeBoundingBox(); const b = geo.boundingBox, c = new THREE.Vector3(); b.getCenter(c);
  geo.translate(-c.x, -b.min.y, -c.z);
  return geo;
};

for (const f of ['spectator-d086fe.glb', 'seated-office-worker-854671.glb']) {
  const gltf = await load(f);
  for (const mode of [0, 1, 2]) {
    const geo = bakePose(gltf, mode);
    if (!geo) { console.log(f, 'mode', mode, 'FAILED'); continue; }
    const b = geo.boundingBox; const size = new THREE.Vector3(); b.getSize(size);
    const hasColor = !!geo.attributes.color;
    console.log(f, 'mode', mode, 'w=%s d=%s h=%s', size.x.toFixed(2), size.z.toFixed(2), size.y.toFixed(2), 'color=' + hasColor, 'tris=' + (geo.index ? geo.index.count/3 : geo.attributes.position.count/3));
  }
}
