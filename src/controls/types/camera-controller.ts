import { mat4, vec3 } from "gl-matrix";
import { Controller } from "../Controller";

export interface CameraController {
  registerController: (controller: Controller) => void;
  viewMatrix: mat4;
  eyePos: () => vec3;
  update: () => void;
}
