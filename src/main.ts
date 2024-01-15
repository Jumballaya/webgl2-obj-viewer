import './style.css'

import screenVert from './shaders/texture/vertex.glsl?raw';
import screenFrag from './shaders/texture/fragment.glsl?raw';

import gridVert from './shaders/grid/vertex.glsl?raw';
import gridFrag from './shaders/grid/fragment.glsl?raw';

import phongVert from './shaders/phong-model/vertex.glsl?raw';
import phongFrag from './shaders/phong-model/fragment.glsl?raw';

import lightsVert from './shaders/lights/vertex.glsl?raw';
import lightsFrag from './shaders/lights/fragment.glsl?raw';

import { WebGL } from './gl/WebGL';
import { vec2, vec3 } from 'gl-matrix';
import { Camera } from './viewer/Camera';
import { Scene } from './viewer/Scene';
import { Loader } from './viewer/Loader';
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
    { type: 'obj:network', dir: 'models/windmill', file: 'windmill.obj', shader: 'lights' },
    { type: 'obj:network', dir: 'models', file: 'cube.obj', shader: 'lights' },
    { type: 'obj:network', dir: 'models', file: 'suzanne.obj', shader: 'lights' },
    { type: 'obj:network', dir: 'models', file: 'teapot.obj', shader: 'lights' },
    { type: 'obj:network', dir: 'models/chair/', file: 'chair.obj', shader: 'lights' },

  ]);
  
  const camera = new Camera(webgl, Math.PI / 180 * 65, dims[0], dims[1], 0.001, 1000);
  const scene = new Scene(webgl, camera);

  const wm: Mesh[] = [];
  const m1 = loader.meshes[0].clone();
  const m2 = loader.meshes[1].clone();
  const m3 = loader.meshes[2].clone();
  const m4 = loader.meshes[3].clone();
  const m5 = loader.meshes[4].clone();

  let a = false;
  for (let y = -10; y < 10; y++) {
    for (let x = -10; x < 10; x++) {
      const n = Math.floor(Math.random() * 5);
      const m = [m1, m2, m3, m4, m5][n].clone();
      m.translation = [x * 6, 0, y * 6];
      scene.add(m);
      wm.push(m);
      a = true;
    }
  }
  
  scene.darkMode = true;

  const l = scene.addLight('point');
  l.position = [0, 15, 0];

  const s_dir: vec3 = [4, 0, 4];
  const s = scene.addLight('spot');
  s.direction = [...s_dir];
  s.position = [-8, 30, -8];
  
  let i = 0;
  const d: vec3 = [0, 0, 0];
  function draw() {
    scene.render();

    d[0] = s_dir[0] + (Math.cos(i / 100) * 10);
    d[1] = s_dir[1];
    d[2] = s_dir[2] + (Math.sin(i / 100) * 10);
    s.direction = d;

    i++;
    requestAnimationFrame(draw);
  }

  draw();
}
main();