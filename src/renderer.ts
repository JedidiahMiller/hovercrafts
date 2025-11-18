import { Camera } from "./lib/camera.js";
import { Matrix4 } from "./lib/matrix.js";
import { ShaderProgram } from "./lib/shader-program.js";
import { Vector3 } from "./lib/vector.js";
import { VertexArray } from "./lib/vertex-array.js";

export class Renderer {
  worldLightPosition: Vector3;
  clipFromEye: Matrix4;

  constructor(worldLightPosition: Vector3, clipFromEye: Matrix4) {
    this.worldLightPosition = worldLightPosition;
    this.clipFromEye = clipFromEye;
  }

  render(
    shader: ShaderProgram,
    vao: VertexArray,
    camera: Camera,
    worldFromModel?: Matrix4
  ) {
    shader.bind();
    shader.setUniformMatrix4fv("clipFromEye", this.clipFromEye.elements);
    shader.setUniformMatrix4fv("eyeFromWorld", camera.eyeFromWorld.elements);
    shader.setUniformMatrix4fv(
      "worldFromModel",
      worldFromModel ? worldFromModel.elements : Matrix4.identity().elements
    );
    shader.setUniform1i("terrainTexture", 0);
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
