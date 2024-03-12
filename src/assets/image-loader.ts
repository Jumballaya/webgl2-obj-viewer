const BASE = import.meta.env.BASE_URL || "/";

export function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.addEventListener("load", () => res(img));
    img.addEventListener("error", (e) => rej(e));
    let fullpath = BASE + path;
    if (fullpath[0] === "/" && fullpath[1] === "/")
      fullpath = fullpath.slice(1);
    img.src = fullpath;
  });
}
