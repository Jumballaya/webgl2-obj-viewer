import { MtlNumberToken, MtlStringToken, MtlToken } from "./types/mtl-token.type";


export class MtlLineTokenizer {

  public tokenize(line: string): MtlToken[] {
    const input = line.trim();
    if (input === '') return [];
    let i = 0;
    let char = input[i];
    if (['N', 'i', '#'].includes(char[0])) return [];
    const tokens: MtlToken[] = [];
    while (i < input.length) {
      char = input[i].toLowerCase();
      if (char === ' ') {
        i++;
        continue;
      }

      if (char.toLowerCase() === 'k' && tokens.length === 0) {
        i++;
        char = input[i];
        if (char.toLowerCase() === 'a') {
          i++;
          tokens.push({ type: 'ambient', value: 'Ka'});
          continue;
        }
        if (char.toLowerCase() === 'd') {
          i++;
          tokens.push({ type: 'diffuse', value: 'Kd'});
          continue;
        }
        if (char.toLowerCase() === 's') {
          i++;
          tokens.push({ type: 'specular', value: 'Ks'});
          continue;
        }
        if (char.toLowerCase() === 'e') {
          i++;
          tokens.push({ type: 'emissive', value: 'Ke'});
          continue;
        }
      }

      if (char === 'm'  && tokens.length === 0) {
        let slice = input.slice(i, i+3);
        if (slice === 'map') {
          slice = input.slice(i, i+6);
          if (slice.toLowerCase() === 'map_kd') {
            i += 6;
            tokens.push({ type: 'albedo-map', value: 'map_Kd' });
            continue;
          }
          if (slice.toLowerCase() === 'map_ns' || slice.toLowerCase() === 'map_ks') {
            i += 6;
            tokens.push({ type: 'specular-map', value: 'map_Ns' });
            continue;
          }
          slice = input.slice(i, i+8);
          if (slice.toLowerCase() === 'map_bump') {
            i += 8
            tokens.push({ type: 'normal-map', value: 'map_Bump' });
            continue;
          }
        }
      }

      if (char === 'n'  && tokens.length === 0) {
        const slice = input.slice(i, i+6);
        if (slice === 'newmtl') {
          i += 6;
          tokens.push({ type: 'new-material', value: 'newmtl' });
          continue;
        }
      }

      if (char === 'd' && tokens.length === 0) {
        i++;
        tokens.push({ type: 'dissolve', value: 'd' });
        continue;
      }

      // Numbers
      if (char === '-') {
        i++;
        const [read, token] = this.parseNumber(line.slice(i));
        token.value *= -1;
        i += read;
        tokens.push(token);
        continue;
      }
      if (this.isNumber(char)) {
        const [read, token] = this.parseNumber(line.slice(i));
        i += read+1;
        tokens.push(token);
        continue;
      }

      // Strings
      if (['albedo-map', 'normal-map', 'specular-map', 'new-material'].includes(tokens[0].type)) {
        const [read, token] = this.parseString(line.slice(i));
        i += read+1;
        tokens.push(token);
        break;
      }
      i++;
    }

    return tokens;
  }

  private parseNumber(line: string): [number, MtlNumberToken] {
    let i = 0;
    let periodcount = 0;
    while (line[i] !== ' ' && i < line.length) {
      if (this.isNumber(line[i]) || line[i] === '.') {
        i++;
        if (line[i] === '.') {
          periodcount++;
          if (periodcount > 1) throw new Error(`OBJFile Parser: unable to parse number ${line.slice(0, i)}`);
        }
        continue;
      }
      break;
    }
    return [i, { type: 'number', value: parseFloat(line.slice(0, i)) }]
  }

  private parseString(line: string): [number, MtlStringToken] {
    let i = 0;
    line = line.trim();
    while (line[i] !== ' ' && i < line.length) {
      i++;
    }
    return [i, { type: 'string', value: line.slice(0, i) }];
  }

  private isNumber(char: string): boolean {
    const code = char.charCodeAt(0);
    return (code >= 48 && code <= 57)
  }
}