import { Camera } from "./lib/camera.js";
import { Matrix4 } from "./lib/matrix.js";
import { Vector3 } from "./lib/vector.js";
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
      this.renderMesh(terrainMesh.mesh, camera, includeWorldLight);
    }

    // Scene objects
    for (const mesh of this.meshes) {
      this.renderMesh(mesh, camera, includeWorldLight);
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
    mesh: Mesh,
    camera: Camera,
    includeWorldLight: boolean = true
  ) {
    console.log(mesh.name);
    mesh.shader.bind();
    mesh.shader.setUniformMatrix4fv("clipFromEye", this.clipFromEye.elements);
    mesh.shader.setUniformMatrix4fv(
      "eyeFromWorld",
      camera.eyeFromWorld.elements
    );
    mesh.shader.setUniformMatrix4fv(
      "worldFromModel",
      mesh.worldFromModel
        ? mesh.worldFromModel.elements
        : Matrix4.identity().elements
    );
    if (mesh.textureNumber !== undefined) {
      mesh.shader.setUniform1i("textureSource", mesh.textureNumber);
      mesh.shader.setUniform2f(
        "textureScale",
        mesh.textureScale![0],
        mesh.textureScale![1]
      );
    }
    if (includeWorldLight && this.worldLightPosition) {
      const eyeLightPosition = camera.eyeFromWorld.multiplyPosition(
        this.worldLightPosition
      );
      mesh.shader.setUniform3f(
        "lightPosition",
        eyeLightPosition.x,
        eyeLightPosition.y,
        eyeLightPosition.z
      );
    }

    const vao = mesh.getVao();
    vao.bind();
    vao.drawIndexed(gl.TRIANGLES);
    vao.unbind();
    mesh.shader.unbind();
  }
}
