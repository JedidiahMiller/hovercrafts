import { Camera } from "./lib/camera.js";
import { Matrix4 } from "./lib/matrix.js";
import { Trimesh } from "./lib/trimesh.js";
import { Vector3 } from "./lib/vector.js";
import { VertexArray } from "./lib/vertex-array.js";
import { VertexAttributes } from "./lib/vertex-attributes.js";
import { Mesh } from "./mesh.js";
import { TerrainMesh } from "./terrain.js";
import skyboxFragmentSource from "@/shaders/skybox-vertex.glsl?raw";
import skyboxVertexSource from "@/shaders/skybox-fragment.glsl?raw";
import { ShaderProgram } from "./lib/shader-program.js";
import { loadCubemap } from "./lib/web-utilities.js";
import { Prefab } from "./lib/prefab.js";

export class Scene {
  worldLightPosition?: Vector3;
  clipFromEye: Matrix4;

  groundMeshes: TerrainMesh[] = [];
  meshes: Mesh[] = [];
  skybox!: Trimesh;

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

    this.renderSkybox(camera);
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
    // console.log(mesh.name);
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

  async renderSkybox(camera: Camera) {
    this.skybox = Prefab.skybox();
    const texture = await loadCubemap("/textures/cubemap", ".png", gl.TEXTURE3);
    const attributes = new VertexAttributes();
    attributes.addAttribute(
      "position",
      this.skybox.vertexCount,
      3,
      this.skybox.positionBuffer()
    );

    attributes.addIndices(new Uint32Array(this.skybox.faceBuffer()));

    const shader = new ShaderProgram(skyboxVertexSource, skyboxFragmentSource);
    const vao = new VertexArray(shader, attributes);

    shader.bind();
    shader.setUniformMatrix4fv("clipFromEye", this.clipFromEye.elements);
    shader.setUniformMatrix4fv("eyeFromWorld", camera.eyeFromWorld.elements);
    shader.setUniformMatrix4fv("worldFromModel", Matrix4.identity().elements);
    shader.setUniform1i("skybox", 3);

    vao.bind();
    vao.drawIndexed(gl.TRIANGLES);
    vao.unbind();
    shader.unbind();
  }
}
