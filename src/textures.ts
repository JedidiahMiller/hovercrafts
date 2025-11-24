import { fetchImage } from "./lib/web-utilities.js";

export async function loadTextures() {
  await applyTexture("/textures/dirt.png", gl, gl.TEXTURE0);
  await applyTexture("/textures/grass.png", gl, gl.TEXTURE1);
  await applyTexture("/textures/road.png", gl, gl.TEXTURE2);
}

async function applyTexture(
  source: string,
  gl: WebGL2RenderingContext,
  activeTexture: number
) {
  const image = await fetchImage(source);
  gl.activeTexture(activeTexture);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  // gl.generateMipmap(gl.TEXTURE_2D);
}
