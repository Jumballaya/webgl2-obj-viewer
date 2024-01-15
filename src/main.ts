import './style.css'

import screenVert from './shaders/texture/vertex.glsl?raw';
import screenFrag from './shaders/texture/fragment.glsl?raw';

import gridVert from './shaders/grid/vertex.glsl?raw';
import gridFrag from './shaders/grid/fragment.glsl?raw';

import phongVert from './shaders/phong-model/vertex.glsl?raw';
import phongFrag from './shaders/phong-model/fragment.glsl?raw';

import lightsVert from './shaders/lights/vertex.glsl?raw';
import lightsFrag from './shaders/lights/fragment.glsl?raw';

import albedoVert from './shaders/albedo/vertex.glsl?raw';
import albedoFrag from './shaders/albedo/fragment.glsl?raw';

import positionVert from './shaders/position/vertex.glsl?raw';
import positionFrag from './shaders/position/fragment.glsl?raw';

import idVert from './shaders/id/vertex.glsl?raw';
import idFrag from './shaders/id/fragment.glsl?raw';

import { WebGL } from './gl/WebGL';
import { vec2, vec3 } from 'gl-matrix';
import { Camera } from './viewer/Camera';
import { Scene } from './viewer/Scene';
import { Loader } from './viewer/Loader';
import { QuadMesh } from './viewer/mesh/QuadMesh';
import { LitMaterial } from './viewer/material/LitMaterial';
import { Mesh } from './viewer/mesh/Mesh';


const upload = document.getElementById('upload-model')! as HTMLInputElement;
upload?.addEventListener('change', e => {
  const target = e.target as HTMLInputElement;
  console.log(target.files);
});

async function main() {
  const dims: vec2 = [800, 600];
  const webgl = new WebGL(dims);
  const loader = new Loader(webgl);
  
  await loader.load([
    { type: 'texture:network', name: 'checker', path: 'checker.jpg' },
    { type: 'shader:src', name: 'screen', vertex: screenVert, fragment: screenFrag },
    { type: 'shader:src', name: 'grid', vertex: gridVert, fragment: gridFrag },
    { type: 'shader:src', name: 'phong', vertex: phongVert, fragment: phongFrag },
    { type: 'shader:src', name: 'lights', vertex: lightsVert, fragment: lightsFrag },
    { type: 'shader:src', name: 'albedo', vertex: albedoVert, fragment: albedoFrag },
    { type: 'shader:src', name: 'position', vertex: positionVert, fragment: positionFrag },
    { type: 'shader:src', name: 'id', vertex: idVert, fragment: idFrag },
    { type: 'obj:network', dir: 'models/windmill', file: 'windmill.obj', shader: 'lights' },
    { type: 'obj:network', dir: 'models/', file: 'suzanne.obj', shader: 'lights' },
    { type: 'obj:network', dir: 'models/', file: 'icosphere.obj', shader: 'lights' },
  ]);
  
  const camera = new Camera(webgl, Math.PI / 180 * 65, dims[0], dims[1], 0.001, 1000);
  const scene = new Scene(webgl, camera);
  scene.darkMode = true;

  const quadMat = new LitMaterial(webgl, 'lights');
  const quad = new QuadMesh(webgl, quadMat);
  quad.rotation = [-Math.PI / 2,0,0];
  quad.scale = [25, 25, 0];
  quad.translation = [0, 0.25, 0];

  scene.add(quad);

  
  const m1 = loader.meshes[0].clone();

  scene.add(m1);

  const s = scene.addLight('spot');
  s.direction = [-3, 3, -3];
  s.position = [15, 10, 15];


  const s2 = scene.addLight('spot');
  s2.direction = [1, -1, -1];
  s2.position = [-10, 10, 10];

  const s3 = scene.addLight('spot');
  s3.direction = [-2, 2, 2];
  s3.position = [10, 10, -10];

  const s4 = scene.addLight('spot');
  s4.direction = [2, 2, 2];
  s4.position = [-10, 10, -10];

  // MOVE TO SCENE
  // const m: vec2 = [0, 0];
  // const d = new Uint8ClampedArray(4);
  // scene.camera.controller.addEventListener('mousemove', (e) => {
  //   m[0] = e.currentPosition[0];
  //   m[1] = webgl.context.canvas.height - e.currentPosition[1];
  // });
  // let i = 0;

  function draw() {
    scene.render();

    // color-id picker MOVE TO SCENE
    // webgl.context.readPixels(m[0], m[1], 1, 1, webgl.context.RGBA, webgl.context.UNSIGNED_BYTE, d);
    // const id: vec3 = [d[0] / 256, d[1] / 256, d[2] / 256];
    // for (const mesh of scene.meshes) {
    //   if (mesh.isId(id)) {
    //     mesh.rotation = [0, Math.PI * i / 180, 0];
    //     i++;
    //   }
    // }

    requestAnimationFrame(draw);
  }

  draw();
}
main();