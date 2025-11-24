import { fetchImage } from "./lib/web-utilities.js";

export async function loadTextures() {
  await createRgbaTexture2d("/textures/dirt.png", gl, gl.TEXTURE0);
  await createRgbaTexture2d("/textures/grass.png", gl, gl.TEXTURE1);
  await createRgbaTexture2d("/textures/road.png", gl, gl.TEXTURE2);
}

async function createRgbaTexture2d(
  source: string,
  gl: WebGL2RenderingContext,
  textureUnit: GLenum = gl.TEXTURE0
) {
  const image = await fetchImage(source);

  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.generateMipmap(gl.TEXTURE_2D);
}
