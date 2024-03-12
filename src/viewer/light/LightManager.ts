import { Shader } from "../../gl/Shader";
import { UBO } from "../../gl/UBO";
import { WebGL } from "../../gl/WebGL";
import { Light } from "./Light";
import { PointLight } from "./PointLight";
import { SpotLight } from "./SpotLight";
import { LightTypes } from "./types/light-types.type";

export class LightManager {
  private capacity = {
    pointLight: 10,
    spotLight: 10,
  };
  private pointer = {
    pointLight: 0,
    spotLight: 0,
  };

  private data: Float32Array;

  private lights = {
    pointLight: [] as Array<PointLight>,
    spotLight: [] as Array<SpotLight>,
  };

  private webgl: WebGL;
  private ubo: UBO;

  public showHelpers = false;

  constructor(webgl: WebGL) {
    this.webgl = webgl;
    this.data = new Float32Array(
      this.capacity.pointLight * 4 + this.capacity.spotLight * 12,
    ).fill(0);
    this.ubo = this.webgl.createUBO("Lighting", this.data);
  }

  public bindBuffer() {
    this.ubo.bind();
  }

  public registerShaders(shaders: Shader[]) {
    for (const shader of shaders) {
      this.ubo.setupShader(shader);
    }
  }

  public createLight(type: keyof LightTypes): Light {
    const light = this.newLight(type);
    if (light instanceof PointLight) {
      this.lights.pointLight.push(light);
      return light;
    }
    this.lights.spotLight.push(light);
    return light;
  }

  public newLight(type: keyof LightTypes) {
    switch (type) {
      case "point":
        return this.createPointLight();
      case "spot":
        return this.createSpotLight();
    }
  }

  public updateLight(light: Light) {
    switch (light.type) {
      case "point":
        this.updatePointLight(light as PointLight);
        break;
      case "spot":
        this.updateSpotLight(light as SpotLight);
        break;
    }
    this.ubo.bind();
    this.ubo.update(this.data);
    this.ubo.unbind();
  }

  private createPointLight(): PointLight {
    if (this.pointer.pointLight >= this.capacity.pointLight) {
      throw new Error(`reached PointLight capacity`);
    }
    const light = new PointLight(this, this.webgl);
    light.id = this.pointer.pointLight;
    this.pointer.pointLight++;
    this.updateLight(light);
    return light;
  }

  private updatePointLight(light: PointLight) {
    const idx = this.capacity.spotLight * 12 + light.id * 4;

    // Position
    this.data[idx + 0] = light.position[0];
    this.data[idx + 1] = light.position[1];
    this.data[idx + 2] = light.position[2];
    this.data[idx + 3] = light.active ? 1 : 0;
  }

  private createSpotLight(): SpotLight {
    if (this.pointer.spotLight >= this.capacity.spotLight) {
      throw new Error(`reached SpotLight capacity`);
    }
    const light = new SpotLight(this, this.webgl);
    light.id = this.pointer.spotLight;
    this.pointer.spotLight++;
    this.updateLight(light);
    return light;
  }

  private updateSpotLight(light: SpotLight) {
    const idx = light.id * 12;

    // Position
    this.data[idx + 0] = light.position[0];
    this.data[idx + 1] = light.position[1];
    this.data[idx + 2] = light.position[2];
    this.data[idx + 3] = 0;

    // Direction
    this.data[idx + 4] = light.direction[0];
    this.data[idx + 5] = light.direction[1];
    this.data[idx + 6] = light.direction[2];
    this.data[idx + 7] = 0;

    // Angle
    this.data[idx + 8] = light.innerAngle;
    this.data[idx + 9] = light.outerAngle;
    this.data[idx + 10] = light.active ? 1 : 0;
    this.data[idx + 11] = 0;
  }
}
