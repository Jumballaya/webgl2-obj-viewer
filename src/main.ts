import './style.css'

import screenVert from './shaders/texture/vertex.glsl?raw';
import screenFrag from './shaders/texture/fragment.glsl?raw';

import gridVert from './shaders/grid/vertex.glsl?raw';
import gridFrag from './shaders/grid/fragment.glsl?raw';

import modelVert from './shaders/phong-model/vertex.glsl?raw';
import modelFrag from './shaders/phong-model/fragment.glsl?raw';

import { WebGL } from './gl/WebGL';
import { vec2 } from 'gl-matrix';
import { Camera } from './viewer/Camera';
import { Scene } from './viewer/Scene';
import { Loader } from './viewer/Loader';


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
    { type: 'shader:src', name: 'basic', vertex: modelVert, fragment: modelFrag },
    { type: 'obj:network', dir: 'models/windmill/', file: 'windmill.obj', shader: 'basic' },
  ]);
  
  const camera = new Camera(webgl, Math.PI / 180 * 65, dims[0], dims[1], 0.001, 1000);
  const scene = new Scene(webgl, camera);
  
  scene.darkMode = true;
  loader.meshes.forEach(m => scene.add(m));
  
  function draw() {
    scene.render();
    requestAnimationFrame(draw);
  }

  draw();
}
main();