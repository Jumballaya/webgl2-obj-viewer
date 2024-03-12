export type ObjToken =
  | ObjVertexToken
  | ObjTexCoordToken
  | ObjNormalToken
  | ObjFaceToken
  | ObjNumberToken
  | ObjFaceListToken
  | ObjStringToken
  | ObjObjToken
  | ObjMtlToken
  | ObjUseMtlToken;

export type ObjVertexToken = {
  type: "vertex";
  value: "v";
};

export type ObjTexCoordToken = {
  type: "texCoord";
  value: "vt";
};

export type ObjNormalToken = {
  type: "normal";
  value: "vn";
};

export type ObjFaceToken = {
  type: "face";
  value: "f";
};

export type ObjFaceListToken = {
  type: "facelist";
  value: string;
};

export type ObjNumberToken = {
  type: "number";
  value: number;
};

export type ObjStringToken = {
  type: "string";
  value: string;
};

export type ObjObjToken = {
  type: "object";
  value: "o";
};

export type ObjMtlToken = {
  type: "material";
  value: "mtllib";
};

export type ObjUseMtlToken = {
  type: "use-material";
  value: "usemtl";
};
