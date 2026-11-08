import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'fs';
const buf = fs.readFileSync('public/models/spectator-d086fe.glb');
const gltf = await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength), '');
console.log('has bake?', typeof gltf.scene.children[0] !== 'undefined');
let skinned = 0, plain = 0;
gltf.scene.traverse(o => { if (o.isSkinnedMesh) skinned++; else if (o.isMesh) plain++; });
console.log('skinned meshes:', skinned, 'plain meshes:', plain);
const bones = [];
gltf.scene.traverse(o => { if (o.isBone) bones.push(o.name); });
console.log('bones sample:', bones.slice(0, 12));
try {
  const sc = skeletonClone(gltf.scene);
  console.log('clone ok');
  const byName = {};
  sc.traverse(o => { if (o.isBone) byName[o.name.toLowerCase().replace(/mixamorig/g, '').replace(/[^a-z]/g, '')] = o; });
  console.log('leftarm?', !!byName['leftarm'], 'rightarm?', !!byName['rightarm']);
  const geos = [];
  sc.traverse(o => {
    if (o.isSkinnedMesh) {
      try {
        const baked = o.bake();
        const ge = baked.geometry.clone();
        console.log('baked attrs:', Object.keys(ge.attributes).join('+'), 'hasColor attr:', !!ge.attributes.color);
        geos.push(ge);
      } catch (e) { console.log('BAKE ERR:', e.message); }
    } else if (o.isMesh) { geos.push(o.geometry.clone()); }
  });
  console.log('geos:', geos.length);
  const sets = new Set(geos.map(g => Object.keys(g.attributes).sort().join('+')));
  console.log('attr sets:', [...sets].join(' ;; '));
  if (geos.length) {
    geos.forEach(g => ['skinIndex','skinWeight','uv','uv2'].forEach(k => g.deleteAttribute(k)));
    const merged = mergeGeometries(geos, false);
    console.log('merged:', !!merged, merged ? 'tris=' + (merged.index.count/3) : '');
  }
} catch (e) { console.log('ERR', e.message); }
