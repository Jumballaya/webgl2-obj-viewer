
export type MtlToken =
  | MtlNumberToken
  | MtlStringToken
  | MtlNewMtlToken
  | MtlDissolveToken
  | MtlSpecularMapToken
  | MtlAlbedoMapToken
  | MtlNormalMapToken
  | MtlAmbientToken
  | MtlDiffuseToken
  | MtlSpecularToken
  | MtlEmissiveToken;

export type MtlNewMtlToken = {
  type: 'new-material';
  value: 'newmtl';
}

export type MtlSpecularMapToken = {
  type: 'specular-map';
  value: 'map_Ns';
}

export type MtlAlbedoMapToken = {
  type: 'albedo-map';
  value: 'map_Kd';
}

export type MtlNormalMapToken = {
  type: 'normal-map';
  value: 'map_Bump';
}

export type MtlAmbientToken = {
  type: 'ambient';
  value: 'Ka';
}

export type MtlSpecularToken = {
  type: 'specular';
  value: 'Ks';
}

export type MtlEmissiveToken = {
  type: 'emissive';
  value: 'Ke';
}

export type MtlDiffuseToken = {
  type: 'diffuse';
  value: 'Kd';
}

export type MtlNumberToken = {
  type: 'number';
  value: number;
};

export type MtlStringToken = {
  type: 'string';
  value: string;
};

export type MtlDissolveToken = {
  type: 'dissolve';
  value: 'd';
};