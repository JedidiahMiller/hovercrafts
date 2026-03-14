import { fetchImage, loadCubemap } from "./lib/web-utilities.js";

export function loadTextures() {
  return Promise.all([
    createRgbaTexture2d("textures/dirt.webp", gl, gl.TEXTURE0),
    createRgbaTexture2d("textures/grass.webp", gl, gl.TEXTURE1),
    createRgbaTexture2d("textures/road.webp", gl, gl.TEXTURE2),
    loadCubemap("textures/cubemap", "webp", gl.TEXTURE3),
    createRgbaTexture2d("textures/tallGrass.webp", gl, gl.TEXTURE4),
  ]);
}

async function createRgbaTexture2d(
  source: string,
  gl: WebGL2RenderingContext,
  textureUnit: GLenum = gl.TEXTURE0,
) {
  const image = await fetchImage(source);

  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.generateMipmap(gl.TEXTURE_2D);
}
