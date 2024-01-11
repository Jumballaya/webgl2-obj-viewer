import { WebGL } from '../gl/WebGL';
import { mat4, vec2, vec4 } from 'gl-matrix';
import { Controller } from '../controls/Controller';
import { UBO } from '../gl/UBO';
import { FPSController } from '../controls/FPSController';
import { CameraController } from '../controls/types/camera-controller';
import { ArcballCamera } from '../controls/Arcball';

export class Camera {
  private webgl: WebGL;
  private input: CameraController;
  private controller: Controller;
  private cameraUBO: UBO;

  private projMatrix: mat4;

  private screenDims: vec2;

  constructor(webgl: WebGL, fov: number, width: number, height: number, near: number, far: number) {
    this.webgl = webgl;
    this.screenDims = [width, height];
    this.projMatrix = mat4.create();
    mat4.perspective(this.projMatrix, fov, width / height, near, far);
    this.input = new ArcballCamera([0, 1, -5], [0, 0, 0], [0, 1, 0], 10, this.screenDims);
    this.controller = new Controller();
    this.input.registerController(this.controller);
    this.webgl.registerController(this.controller);
    //this.controller.requestPointerLock();
  
    this.cameraUBO = webgl.createUBO('Camera', [
      { name: 'projection', type: 'mat4', },
      { name: 'view', type: 'mat4', },
      { name: 'position', type: 'vec4' },
    ]);
    this.cameraUBO.bind();
    this.cameraUBO.set('projection', this.projMatrix);
    this.cameraUBO.set('view', this.input.viewMatrix);
    this.cameraUBO.set('position', [...this.input.eyePos(), 0.0] as vec4);
    this.cameraUBO.setupShader(webgl.shaders.basic);
    this.cameraUBO.setupShader(webgl.shaders.screen);
    this.cameraUBO.setupShader(webgl.shaders.grid);
    this.cameraUBO.unbind();
  
  }

  public update() {
    this.input.update();
    this.cameraUBO.bind();
    this.cameraUBO.set('projection', this.projMatrix);
    this.cameraUBO.set('view', this.input.viewMatrix);
    this.cameraUBO.set('position', [...this.input.eyePos(), 0.0] as vec4);
    this.cameraUBO.unbind();
  }

  public get ubo(): UBO {
    return this.cameraUBO;
  }

  public get screenSize(): vec2 {
    return this.screenDims;
  }

}

