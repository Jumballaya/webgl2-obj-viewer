
export function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.addEventListener('load', () => res(img));
    img.addEventListener('error', e => rej(e));
    img.src = path;
  })
}