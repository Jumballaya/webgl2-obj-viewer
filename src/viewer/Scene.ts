import { WebGL } from '../gl/WebGL';
import { mat4, vec3 } from 'gl-matrix';
import { Camera } from './Camera';
import { Mesh } from './mesh/Mesh';
import { UBO } from '../gl/UBO';
import { Surface } from '../gl/Surface';
import { GridMesh } from './mesh/GridMesh';
import { LightManager } from './light/LightManager';
import { Light } from './light/Light';
import { LightTypes } from './light/types/light-types.type';


export class Scene {
  private webgl: WebGL;
  private meshes: Mesh[] = [];
  private lights: Light[] = [];
  private camera: Camera;
  private modelUBO: UBO;
  private materialUBO: UBO;

  private screen: Surface;
  private _darkMode = false;
  private gridFloor: GridMesh;
  private lightManager: LightManager;

  constructor(webgl: WebGL, camera: Camera) {
    this.camera = camera;
    this.webgl = webgl;
    webgl.enable('depth', 'cull_face', 'blend');
    webgl.blendFunc(
      WebGL2RenderingContext.SRC_ALPHA,
      WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA
    );

    this.modelUBO = webgl.createUBO('Model', [
      { name: 'matrix', type: 'mat4' },
      { name: 'inv_trans_matrix', type: 'mat4' },
    ]);
    this.modelUBO.bind();
    this.modelUBO.set('matrix', mat4.create());
    this.modelUBO.setupShader(webgl.shaders['lights']);
    this.modelUBO.setupShader(webgl.shaders['phong']);
    this.modelUBO.setupShader(webgl.shaders['grid']);
    this.modelUBO.unbind();
    
    this.materialUBO = webgl.createUBO('Material', [
      { name: 'ambient', type: 'vec4' },
      { name: 'diffuse', type: 'vec4' },
      { name: 'specular', type: 'vec4' },
      { name: 'opacity', type: 'vec4' },
      { name: 'textures', type: 'vec4' },
    ]);
    this.materialUBO.bind();
    this.materialUBO.setupShader(webgl.shaders['lights']);
    this.materialUBO.setupShader(webgl.shaders['phong'])
    this.materialUBO.unbind();

    this.camera.setupUBO([
      this.webgl.shaders['lights'],
      this.webgl.shaders['phong'],
      this.webgl.shaders['screen'],
      this.webgl.shaders['grid'],
    ]);

    this.lightManager = new LightManager(webgl);
    this.lightManager.registerShaders([
      this.webgl.shaders['lights'],
    ]);

    this.screen = webgl.createSurface('screen', this.camera.screenSize, true);
    this.screen.disable();
    
    this.backgroundColor = [0.92, 0.92, 0.92];
    this.gridFloor = new GridMesh(webgl, [30, 30]);
  }

  public set backgroundColor(c: vec3) {
    this.webgl.clearColor(c);
    this.screen.clearColor = [c[0], c[1], c[2], 1];
  }

  public set darkMode(m: boolean) {
    this._darkMode = m;
    this.gridFloor.uniform('u_dark_mode', { type: 'boolean', value: this._darkMode });
    if (this._darkMode) {
      this.backgroundColor = [0.05, 0.05, 0.05];
    } else {
      this.backgroundColor = [0.92, 0.92, 0.92];
    }
  }

  public add(mesh: Mesh) {
    this.meshes.push(mesh);
    this.meshes.sort((a, b) => {
      return (b.material.opacity  - a.material.opacity);
    });
  }

  public addLight<T extends keyof LightTypes>(type: T): LightTypes[T] {
    const l = this.lightManager.createLight(type);
    this.lights.push(l);
    return l as LightTypes[T];
  }

  public render() {
    this.webgl.clear('color', 'depth');
    this.webgl.viewport(0, 0, this.camera.screenSize);
    this.camera.update();
    this.screen.enable();
    for (const mesh of this.meshes) {
      mesh.draw(this.webgl, this.modelUBO, this.materialUBO);
    }
    this.gridFloor.draw(this.webgl, this.modelUBO, this.materialUBO);
    this.screen.disable();
    this.screen.draw(this.camera.ubo);
  }
}
