import { Mesh } from "../viewer/mesh/Mesh";
import { WebGL } from "../gl/WebGL";
import { ObjFile } from "./obj/ObjFile";
import { Material } from "../viewer/material/Material";
import { LitMaterial } from "../viewer/material/LitMaterial";

//const BASE = import.meta.env.BASE_URL || "/";

export async function loadObj(
  base: string,
  file: string,
  webgl: WebGL,
  modelShader: string,
): Promise<Mesh> {
  const objFile = await ObjFile.FromFile(file, base);
  const contents = await objFile.parse();

  for (const material of contents.materials) {
    for (const texToLoad of material.getTexturesToLoad()) {
      await webgl.loadTexture(texToLoad.name, texToLoad.path);
    }
  }

  const mats: Record<string, Material> = {};
  for (const material of contents.materials) {
    const list = material.getMaterials();
    for (const mat of list) {
      mats[mat.name] = new LitMaterial(webgl, modelShader, mat.config);
    }
  }

  const defaultMaterial = new LitMaterial(webgl, modelShader, {
    name: "default",
  });

  const meshes: Mesh[] = [];
  for (const obj of contents.meshes) {
    const vertexArray = webgl.createVertexArray({
      drawType: WebGL2RenderingContext.STATIC_DRAW,
      buffers: obj.buffers,
    });
    meshes.push(
      new Mesh(
        vertexArray,
        obj.material ? mats[obj.material] : defaultMaterial,
      ),
    );
  }

  if (meshes.length === 1) return meshes[0];
  const root = meshes[0];
  root.children.push(...meshes.slice(1));
  return root;
}
