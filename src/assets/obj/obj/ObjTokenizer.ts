import {
  ObjFaceListToken,
  ObjNumberToken,
  ObjStringToken,
  ObjToken,
} from "./types/obj-token.type";

export class ObjLineTokenizer {
  public tokenize(line: string): ObjToken[] {
    const input = line.trim();
    if (input === "") return [];
    let i = 0;
    let char = input[i];
    if (["g", "#", "s"].includes(char[0])) return [];
    const tokens: ObjToken[] = [];
    while (i < input.length) {
      char = input[i];
      if (char === " ") {
        i++;
        continue;
      }
      if (char === "u") {
        const slice = input.slice(i, i + 6);
        if (slice === "usemtl") {
          i += 6;
          tokens.push({ type: "use-material", value: "usemtl" });
          continue;
        }
      }
      if (char === "m") {
        const slice = input.slice(i, i + 6);
        if (slice === "mtllib") {
          i += 6;
          tokens.push({ type: "material", value: "mtllib" });
          continue;
        }
      }
      if (char === "o") {
        i++;
        tokens.push({ type: "object", value: "o" });
        continue;
      }
      if (char === "v") {
        i++;
        const peek = line[i];
        if (peek === "t") {
          i++;
          tokens.push({ type: "texCoord", value: "vt" });
          continue;
        }
        if (peek === "n") {
          i++;
          tokens.push({ type: "normal", value: "vn" });
          continue;
        }
        tokens.push({ type: "vertex", value: "v" });
        continue;
      }
      if (char === "f") {
        i++;
        tokens.push({ type: "face", value: "f" });
        continue;
      }
      if (char === "-") {
        i++;
        const [read, token] = this.parseNumber(line.slice(i));
        token.value *= -1;
        i += read;
        tokens.push(token);
        continue;
      }
      if (this.isNumber(char) && tokens[0].type !== "face") {
        const [read, token] = this.parseNumber(line.slice(i));
        i += read + 1;
        tokens.push(token);
        continue;
      }
      if (this.isNumber(char) && tokens[0].type === "face") {
        const [read, token] = this.parseFaceList(line.slice(i));
        i += read + 1;
        tokens.push(token);
        continue;
      }
      if (["material", "use-material", "object"].includes(tokens[0].type)) {
        const [read, token] = this.parseString(line.slice(i));
        i += read + 1;
        tokens.push(token);
        break;
      }
      i++;
    }
    return tokens;
  }

  private parseNumber(line: string): [number, ObjNumberToken] {
    let i = 0;
    let periodcount = 0;
    while (line[i] !== " " && i < line.length) {
      if (this.isNumber(line[i]) || line[i] === ".") {
        i++;
        if (line[i] === ".") {
          periodcount++;
          if (periodcount > 1)
            throw new Error(
              `OBJFile Parser: unable to parse number ${line.slice(0, i)}`,
            );
        }
        continue;
      }
      break;
    }
    return [i, { type: "number", value: parseFloat(line.slice(0, i)) }];
  }

  private parseString(line: string): [number, ObjStringToken] {
    let i = 0;
    line = line.trim();
    while (line[i] !== " " && i < line.length) {
      i++;
    }
    return [i, { type: "string", value: line.slice(0, i) }];
  }

  private parseFaceList(line: string): [number, ObjFaceListToken] {
    let i = 0;
    while (line[i] !== " " && i < line.length) {
      i++;
    }
    return [i, { type: "facelist", value: line.slice(0, i) }];
  }

  private isNumber(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57;
  }
}
