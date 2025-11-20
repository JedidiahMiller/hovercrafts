import { Camera } from "./lib/camera.js";
import { Matrix4 } from "./lib/matrix.js";
import { ShaderProgram } from "./lib/shader-program.js";
import { Vector3 } from "./lib/vector.js";
import { VertexArray } from "./lib/vertex-array.js";

/**
 * Contains the common render parameters for a scene
 */
export class Renderer {
  worldLightPosition: Vector3;
  clipFromEye: Matrix4;

  constructor(worldLightPosition: Vector3, clipFromEye: Matrix4) {
    this.worldLightPosition = worldLightPosition;
    this.clipFromEye = clipFromEye;
  }

  /**
   * Render an object with the standard uniforms
   *
   * @param shader The shader program to use
   * @param vao The vertex array to use
   * @param camera The camera to use
   * @param worldFromModel The world-from-model matrix
   * @param texture The texture to use
   */
  render(
    shader: ShaderProgram,
    vao: VertexArray,
    camera: Camera,
    worldFromModel: Matrix4 = Matrix4.identity(),
    texture: undefined | number = undefined
  ) {
    shader.bind();
    shader.setUniformMatrix4fv("clipFromEye", this.clipFromEye.elements);
    shader.setUniformMatrix4fv("eyeFromWorld", camera.eyeFromWorld.elements);
    shader.setUniformMatrix4fv(
      "worldFromModel",
      worldFromModel ? worldFromModel.elements : Matrix4.identity().elements
    );
    if (texture) {
      shader.setUniform1i("textureSource", texture);
    }
    const eyeLightPosition = camera.eyeFromWorld.multiplyPosition(
      this.worldLightPosition
    );
    shader.setUniform3f(
      "lightPosition",
      eyeLightPosition.x,
      eyeLightPosition.y,
      eyeLightPosition.z
    );

    vao.bind();
    vao.drawIndexed(gl.TRIANGLES);
    vao.unbind();
    shader.unbind();
  }
}
