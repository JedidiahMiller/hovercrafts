import { Camera } from "./lib/camera.js";
import { Matrix4 } from "./lib/matrix.js";
import { ShaderProgram } from "./lib/shader-program.js";
import { Vector3 } from "./lib/vector.js";
import { VertexArray } from "./lib/vertex-array.js";
import { Mesh } from "./mesh.js";
import { TerrainMesh } from "./terrain.js";

export class Scene {
  worldLightPosition?: Vector3;
  clipFromEye: Matrix4;

  groundMeshes: TerrainMesh[] = [];
  meshes: Mesh[] = [];

  constructor(clipFromEye: Matrix4, worldLightPosition?: Vector3) {
    this.worldLightPosition = worldLightPosition;
    this.clipFromEye = clipFromEye;
  }

  /**
   * Render the scene
   *
   * @param shader The shader program to use
   * @param vao The vertex array to use
   * @param camera The camera to use
   * @param worldFromModel The world-from-model matrix
   * @param texture The texture to use
   */
  render(camera: Camera, includeWorldLight: boolean = true) {
    // Terrain
    for (const terrainMesh of this.groundMeshes) {
      this.renderMesh(
        terrainMesh.mesh.shader,
        terrainMesh.mesh.getVao(),
        camera,
        terrainMesh.mesh.worldFromModel,
        terrainMesh.mesh.textureNumber,
        includeWorldLight
      );
    }

    // Scene objects
    for (const mesh of this.meshes) {
      this.renderMesh(
        mesh.shader,
        mesh.getVao(),
        camera,
        mesh.worldFromModel,
        mesh.textureNumber,
        includeWorldLight
      );
    }
  }

  /**
   * Private helper to render a single mesh
   *
   * @param shader The shader program to use
   * @param vao The vertex array to use
   * @param camera The camera to use
   * @param worldFromModel The world-from-model matrix
   * @param texture The texture to use
   */
  private renderMesh(
    shader: ShaderProgram,
    vao: VertexArray,
    camera: Camera,
    worldFromModel: Matrix4 = Matrix4.identity(),
    texture: undefined | number = undefined,
    includeWorldLight: boolean = true
  ) {
    shader.bind();
    shader.setUniformMatrix4fv("clipFromEye", this.clipFromEye.elements);
    shader.setUniformMatrix4fv("eyeFromWorld", camera.eyeFromWorld.elements);
    shader.setUniformMatrix4fv(
      "worldFromModel",
      worldFromModel ? worldFromModel.elements : Matrix4.identity().elements
    );
    if (texture !== undefined) {
      shader.setUniform1i("textureSource", texture);
    }
    if (includeWorldLight && this.worldLightPosition) {
      const eyeLightPosition = camera.eyeFromWorld.multiplyPosition(
        this.worldLightPosition
      );
      shader.setUniform3f(
        "lightPosition",
        eyeLightPosition.x,
        eyeLightPosition.y,
        eyeLightPosition.z
      );
    }

    vao.bind();
    vao.drawIndexed(gl.TRIANGLES);
    vao.unbind();
    shader.unbind();
  }
}
