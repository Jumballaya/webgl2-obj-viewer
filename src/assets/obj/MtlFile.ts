import { MtlMaterial } from "./mtl/MtlMaterial";
import { MtlLineTokenizer } from "./mtl/MtlTokenizer";

export class MtlFile {
  private file: string;
  private baseDir: string;
  private materials: Record<string, MtlMaterial> = {};
  private texturesToLoad: Array<{ name: string; path: string }> = [];

  private currentMaterial = "";

  constructor(file: string, dir: string) {
    this.file = file;
    this.baseDir = dir;
  }

  public static async FromFile(path: string, dir: string): Promise<MtlFile> {
    const res = await fetch(path);
    const text = await res.text();
    return new MtlFile(text, dir);
  }

  public parse() {
    const lines = this.file.split("\n");
    const tokenizer = new MtlLineTokenizer();

    for (const line of lines) {
      const tokens = tokenizer.tokenize(line);
      if (!tokens || tokens.length === 0) continue;
      switch (tokens[0].type) {
        case "new-material": {
          if (tokens[1].type === "string") {
            this.currentMaterial = tokens[1].value;
            const material = new MtlMaterial(this.currentMaterial);
            this.materials[this.currentMaterial] = material;
          }
          break;
        }
        case "albedo-map": {
          if (tokens[1].type === "string") {
            const name = tokens[1].value.split(".")[0];
            this.materials[this.currentMaterial].albedo_texture = name;
            this.texturesToLoad.push({
              name,
              path: `${this.baseDir}${tokens[1].value}`,
            });
          }
          break;
        }
        case "specular-map": {
          if (tokens[1].type === "string") {
            const name = tokens[1].value.split(".")[0];
            this.materials[this.currentMaterial].specular_texture = name;
            this.texturesToLoad.push({
              name,
              path: `${this.baseDir}${tokens[1].value}`,
            });
          }
          break;
        }
        case "normal-map": {
          if (tokens[1].type === "string") {
            const name = tokens[1].value.split(".")[0];
            this.materials[this.currentMaterial].normal_texture = name;
            this.texturesToLoad.push({
              name,
              path: `${this.baseDir}${tokens[1].value}`,
            });
          }
          break;
        }
        case "ambient": {
          this.materials[this.currentMaterial].ambient = [
            tokens[1].value as number,
            tokens[2].value as number,
            tokens[3].value as number,
          ];
          break;
        }
        case "diffuse": {
          this.materials[this.currentMaterial].diffuse = [
            tokens[1].value as number,
            tokens[2].value as number,
            tokens[3].value as number,
          ];
          break;
        }
        case "emissive": {
          this.materials[this.currentMaterial].emissive = [
            tokens[1].value as number,
            tokens[2].value as number,
            tokens[3].value as number,
          ];
          break;
        }
        case "specular": {
          this.materials[this.currentMaterial].specular = [
            tokens[1].value as number,
            tokens[2].value as number,
            tokens[3].value as number,
          ];
          break;
        }
        case "dissolve": {
          if (tokens[1].type === "number") {
            this.materials[this.currentMaterial].opacity = tokens[1].value;
          }
          break;
        }
      }
    }
  }

  public getMaterials() {
    return Object.keys(this.materials).map((k) => {
      return { name: k, config: this.materials[k] };
    });
  }

  public getTexturesToLoad() {
    const textures = [...this.texturesToLoad];
    this.texturesToLoad = [];
    return textures;
  }
}
