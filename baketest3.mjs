import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import fs from 'fs';
const buf = fs.readFileSync('public/models/spectator-d086fe.glb');
const gltf = await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength), '');
const sc = skeletonClone(gltf.scene);
sc.updateMatrixWorld(true);
const mesh = (() => { let m=null; sc.traverse(o=>{ if(o.isSkinnedMesh && !m) m=o; }); return m; })();
console.log('mesh:', mesh.name, 'bindMode:', mesh.bindMode);
console.log('bindMatrix det:', mesh.bindMatrix.determinant().toFixed(3), 'bindMatrixInverse det:', mesh.bindMatrixInverse.determinant().toFixed(3));
// raw position bbox
const p = mesh.geometry.attributes.position;
const bb = new THREE.Box3(); const v = new THREE.Vector3();
for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); bb.expandByPoint(v); }
const s0 = new THREE.Vector3(); bb.getSize(s0); console.log('raw bbox w/d/h:', s0.x.toFixed(2), s0.z.toFixed(2), s0.y.toFixed(2));
// bind bake (no pose change)
const bb2 = new THREE.Box3();
const apply = mesh.applyBoneTransform.bind(mesh);
for (let i=0;i<p.count;i++){ apply(i, v); bb2.expandByPoint(v); }
const s1 = new THREE.Vector3(); bb2.getSize(s1); console.log('baked(no pose) w/d/h:', s1.x.toFixed(2), s1.z.toFixed(2), s1.y.toFixed(2));
console.log('sample raw vs baked first vertex:', p.getX(0).toFixed(2), p.getY(0).toFixed(2), p.getZ(0).toFixed(2), '->', v.x.toFixed(2), v.y.toFixed(2), v.z.toFixed(2));
console.log('skeleton bones:', mesh.skeleton.bones.length, 'boneInverses:', mesh.skeleton.boneInverses.length);
