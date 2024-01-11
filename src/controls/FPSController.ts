import { mat4, quat, vec2, vec3 } from "gl-matrix";
import { Controller } from "./Controller";

export class FPSController {
  private enabled = false;
  private eye: vec3;
  private viewDirection: vec3;
  private upVector: vec3;
  private screenSize: vec2;
  public speed = 0.6;

  private controller?: Controller;

  constructor(eye: vec3, viewDirection: vec3, upVector: vec3, screenSize: vec2) {
    this.eye = eye;
    this.viewDirection = viewDirection;
    this.upVector = upVector;
    this.screenSize = screenSize;
  }
  
  public update() {
    if (this.controller && this.enabled) {
      const speedVec: vec3 = vec3.create();
      const speed = vec3.fromValues(this.speed, this.speed, this.speed);
      const normDir = vec3.normalize(vec3.create(), this.viewDirection);
      vec3.mul(speedVec, normDir, speed);
      if (this.controller.keyIsPressed('w')) {
        vec3.add(this.eye, this.eye, speedVec);
      }
      if (this.controller.keyIsPressed('s')) {
        vec3.sub(this.eye, this.eye, speedVec);
      }
      if (this.controller.keyIsPressed('a')) {
        vec3.mul(speedVec, normDir, speed);
        const rightVec = vec3.cross(vec3.create(), this.upVector, this.viewDirection);
        vec3.mul(speedVec, vec3.normalize(vec3.create(), rightVec), speed);
        vec3.add(this.eye, this.eye, speedVec);
      }
      if (this.controller.keyIsPressed('d')) {
        vec3.mul(speedVec, normDir, speed);
        const rightVec = vec3.cross(vec3.create(), this.upVector, this.viewDirection);
        vec3.mul(speedVec, vec3.normalize(vec3.create(), rightVec), speed);
        vec3.sub(this.eye, this.eye, speedVec);
      }
      if (this.controller.keyIsPressed(' ')) {
        vec3.add(this.eye, this.eye, vec3.fromValues(0, this.speed, 0));
      }
      if (this.controller.keyIsPressed('c')) {
        vec3.add(this.eye, this.eye, vec3.fromValues(0, -this.speed, 0));
      }
    }
  }

  public registerController(controller: Controller) {
    this.controller = controller;

    let phi = 0;
    let theta = 0;
    this.controller.addEventListener('mousemove', e => {
      if (this.enabled) {
        const deltaX = e.event.movementX;
        const deltaY = e.event.movementY;

        phi += deltaX / 500;
        const tScalar = this.viewDirection[2] > 0 ? 1 : -1;
        theta = clamp(theta + (tScalar * -deltaY / 500), -Math.PI / 3, Math.PI / 3);
        const qx = quat.create();
        quat.setAxisAngle(qx, [0, 1, 0], phi);
        const qz = quat.create();
        quat.setAxisAngle(qz, [1, 0, 0], theta);
  
        const q = quat.create();
        quat.mul(q, q, qx);
        quat.mul(q, q, qz);

        const rotMat = mat4.fromQuat(mat4.create(), q);
        this.viewDirection[0] = rotMat[2];
        this.viewDirection[1] = rotMat[6];
        this.viewDirection[2] = rotMat[10];

        vec3.normalize(this.viewDirection, this.viewDirection);
        
        // vec3.rotateX(this.viewDirection, this.viewDirection, this.eye, Math.PI * -deltaY / 1440 / 10);
        // vec3.rotateY(this.viewDirection, this.viewDirection, this.eye, Math.PI * -deltaX / 1440 / 10);
      }
    });
    this.controller.addEventListener('pointerlockchange', (e) => {
      if (document.pointerLockElement === e.canvas && !this.enabled) {
        this.enabled = true;
      } else if (document.pointerLockElement !== e.canvas) {
        this.enabled = false;
      }
    })
  }

  public get viewMatrix(): mat4 {
    return mat4.lookAt(
      mat4.create(),
      this.eye,
      vec3.add(vec3.create(), this.eye, this.viewDirection),
      this.upVector
    );
  }

  public eyePos(): vec3 {
    return this.eye;
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}