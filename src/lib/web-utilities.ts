export async function fetchText(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

export function downloadBlob(name: string, blob: Blob) {
  // Inject a link element into the page. Clicking on
  // it makes the browser download the binary data.
  let link = document.createElement("a");
  link.download = name;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();

  // Remove the link after a slight pause. Browsers...
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  });
}

export async function takeScreenshot(canvas: HTMLCanvasElement) {
  const png: Blob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
  downloadBlob("screenshot.png", png);
}

export async function fetchImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

export async function loadCubemap(
  directoryUrl: string,
  extension: string,
  textureUnit: GLenum = gl.TEXTURE0,
) {
  const faces = ["posx", "negx", "posy", "negy", "posz", "negz"];

  const images = await Promise.all(
    faces.map((face) => {
      const url = `${directoryUrl}/${face}.${extension}`;
      return fetchImage(url);
    }),
  );

  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  gl.texImage2D(
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    images[0],
  );
  gl.texImage2D(
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    images[1],
  );
  gl.texImage2D(
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    images[2],
  );
  gl.texImage2D(
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    images[3],
  );
  gl.texImage2D(
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    images[4],
  );
  gl.texImage2D(
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    images[5],
  );

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

  return texture;
}
