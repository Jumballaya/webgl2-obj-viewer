import { WebGL } from '../gl/WebGL';
import { mat4, vec2, vec4 } from 'gl-matrix';
import { UBO } from '../gl/UBO';
import { CameraController } from '../controls/types/camera-controller';
import { Shader } from '../gl/Shader';

export class Camera {
  private input: CameraController;
  private cameraUBO: UBO;

  private projMatrix: mat4;

  private screenDims: vec2;

  constructor(webgl: WebGL, fov: number, width: number, height: number, near: number, far: number, input: CameraController) {
    this.screenDims = [width, height];
    this.projMatrix = mat4.create();
    mat4.perspective(this.projMatrix, fov, width / height, near, far);
    this.input = input;
  
    this.cameraUBO = webgl.createUBO('Camera', [
      { name: 'projection', type: 'mat4', },
      { name: 'view', type: 'mat4', },
      { name: 'position', type: 'vec4' },
    ]);
    this.cameraUBO.bind();
    this.cameraUBO.set('projection', this.projMatrix);
    this.cameraUBO.set('view', this.input.viewMatrix);
    this.cameraUBO.set('position', [...this.input.eyePos(), 0.0] as vec4);
    this.cameraUBO.unbind();
  }

  public setupUBO(shaders: Shader[]) {
    this.cameraUBO.bind();
    for (const shader of shaders) {
      this.cameraUBO.setupShader(shader);
    }
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

