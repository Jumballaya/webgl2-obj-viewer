import { WebGL } from "../gl/WebGL";
import { mat4, vec3 } from "gl-matrix";
import { Camera } from "./Camera";
import { Mesh } from "./mesh/Mesh";
import { UBO } from "../gl/UBO";
import { Surface } from "../gl/Surface";
import { GridMesh } from "./mesh/GridMesh";
import { LightManager } from "./light/LightManager";
import { Light } from "./light/Light";
import { LightTypes } from "./light/types/light-types.type";
import { FrameBuffer } from "../gl/FrameBuffer";
import { Material } from "./material/Material";
import { Controller } from "../controls/Controller";

export class Scene {
  private webgl: WebGL;
  private meshes: Mesh[] = [];
  private lights: Light[] = [];
  private camera: Camera;
  private modelUBO: UBO;
  private materialUBO: UBO;

  private screen: Surface;
  private clearColor: vec3 = [1, 1, 1];
  private _darkMode = false;
  private gridFloor: GridMesh;
  private lightManager: LightManager;

  private controller: Controller;
  private onMeshHover: ((mesh: Mesh) => void) | null = null;
  private hoverBuffer: FrameBuffer;
  private idMaterial: Material;
  private hoverColorBuffer = new Uint8ClampedArray(4);

  constructor(webgl: WebGL, camera: Camera, controller: Controller) {
    this.controller = controller;
    this.camera = camera;
    this.webgl = webgl;
    webgl.enable("depth", "cull_face", "blend");
    webgl.blendFunc(
      WebGL2RenderingContext.SRC_ALPHA,
      WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
    );
    this.modelUBO = webgl.createUBO("Model", [
      { name: "matrix", type: "mat4" },
      { name: "inv_trans_matrix", type: "mat4" },
      { name: "id", type: "vec4" },
    ]);
    this.materialUBO = webgl.createUBO("Material", [
      { name: "ambient", type: "vec4" },
      { name: "diffuse", type: "vec4" },
      { name: "specular", type: "vec4" },
      { name: "opacity", type: "vec4" },
      { name: "textures", type: "vec4" },
    ]);
    this.lightManager = new LightManager(webgl);
    this.setupUbos({
      model: ["lights", "phong", "grid", "albedo", "position", "id"],
      material: ["lights", "phong", "albedo"],
      camera: ["lights", "phong", "screen", "grid", "albedo", "position", "id"],
      lights: ["lights"],
    });

    this.screen = webgl.createSurface("screen", this.camera.screenSize, true);
    this.screen.disable();

    this.backgroundColor = [0.92, 0.92, 0.92];
    this.gridFloor = new GridMesh(webgl, [30, 30]);

    this.hoverBuffer = webgl.createFrameBuffer();
    this.hoverBuffer.attachment({
      type: "color",
      size: this.camera.screenSize,
    });
    this.idMaterial = new Material(webgl, "id");
  }

  public addEventListener(_: "hover", handler: (mesh: Mesh) => void) {
    this.onMeshHover = handler;
  }

  public get backgroundColor(): vec3 {
    return this.clearColor;
  }

  public set backgroundColor(c: vec3) {
    this.webgl.clearColor(c);
    this.screen.clearColor = [c[0], c[1], c[2], 1];
    this.clearColor[0] = c[0];
    this.clearColor[1] = c[1];
    this.clearColor[2] = c[2];
  }

  public set darkMode(m: boolean) {
    this._darkMode = m;
    this.gridFloor.uniform("u_dark_mode", {
      type: "boolean",
      value: this._darkMode,
    });
    if (this._darkMode) {
      this.backgroundColor = [0.05, 0.05, 0.05];
    } else {
      this.backgroundColor = [0.92, 0.92, 0.92];
    }
  }

  public add(mesh: Mesh) {
    this.meshes.push(mesh);
    this.meshes.sort((a, b) => {
      return b.material.opacity - a.material.opacity;
    });
  }

  public addLight<T extends keyof LightTypes>(type: T): LightTypes[T] {
    const l = this.lightManager.createLight(type);
    this.lights.push(l);
    return l as LightTypes[T];
  }

  public update() {
    this.hoverBuffer.bind();
    this.renderHover();
    this.handleHover();
    this.hoverBuffer.unbind();
    this.render();
  }

  public render() {
    this.webgl.clear("color", "depth");
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

  public renderHover() {
    this.webgl.clearColor(this.backgroundColor);
    this.webgl.clear("color", "depth");
    this.camera.update();
    for (const mesh of this.meshes) {
      mesh.draw(this.webgl, this.modelUBO, this.materialUBO, this.idMaterial);
    }
  }

  public handleHover() {
    const mouse = this.controller.mouse;
    this.webgl.readPixels(
      mouse[0],
      this.screen.size[1] - mouse[1],
      1,
      1,
      WebGL2RenderingContext.RGBA,
      WebGL2RenderingContext.UNSIGNED_BYTE,
      this.hoverColorBuffer,
    );
    const id: vec3 = [
      this.hoverColorBuffer[0] / 256,
      this.hoverColorBuffer[1] / 256,
      this.hoverColorBuffer[2] / 256,
    ];
    for (const mesh of this.meshes) {
      if (mesh.isId(id)) {
        mesh.isHovered = true;
        this.onMeshHover?.(mesh);
      } else {
        mesh.isHovered = false;
      }
    }
  }

  private setupUbos(config: {
    model: string[];
    material: string[];
    camera: string[];
    lights: string[];
  }) {
    this.modelUBO.bind();
    this.modelUBO.set("matrix", mat4.create());
    for (const shader of config.model) {
      this.modelUBO.setupShader(this.webgl.shaders[shader]);
    }
    this.modelUBO.unbind();

    this.materialUBO.bind();
    for (const shader of config.material) {
      this.materialUBO.setupShader(this.webgl.shaders[shader]);
    }
    this.materialUBO.unbind();

    this.camera.setupUBO(config.camera.map((s) => this.webgl.shaders[s]));
    this.lightManager.registerShaders(
      config.lights.map((s) => this.webgl.shaders[s]),
    );
  }
}
