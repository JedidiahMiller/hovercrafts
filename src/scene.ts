import { Camera } from "./lib/camera.js";
import { Matrix4 } from "./lib/matrix.js";
import { Trimesh } from "./lib/trimesh.js";
import { Vector3 } from "./lib/vector.js";
import { VertexArray } from "./lib/vertex-array.js";
import { VertexAttributes } from "./lib/vertex-attributes.js";
import { Mesh } from "./mesh.js";
import { TerrainMesh } from "./terrain.js";
import skyboxVertexSource from "@/shaders/skybox-vertex.glsl?raw";
import skyboxFragmentSource from "@/shaders/skybox-fragment.glsl?raw";
import { ShaderProgram } from "./lib/shader-program.js";
import { loadCubemap } from "./lib/web-utilities.js";
import { Prefab } from "./lib/prefab.js";

export class Scene {
  worldLightPosition?: Vector3;
  clipFromEye: Matrix4;

  groundMeshes: TerrainMesh[] = [];
  meshes: Mesh[] = [];
  skybox!: Trimesh;
  skyboxShader?: ShaderProgram;
  skyboxVAO?: VertexArray;
  skyboxInitialized = false;

  constructor(clipFromEye: Matrix4, worldLightPosition?: Vector3) {
    this.worldLightPosition = worldLightPosition;
    this.clipFromEye = clipFromEye;
    this.initializeSkybox();
  }

  async initializeSkybox() {
    try {
      this.skybox = Prefab.skybox();
      console.log("Skybox geometry created");

      try {
        await loadCubemap("/textures/cubemap", "png", gl.TEXTURE3);
        // console.log("Cubemap loaded successfully");
      } catch (cubemapError) {
        console.error("Cubemap loading error:", cubemapError);
        throw cubemapError;
      }

      const attributes = new VertexAttributes();
      attributes.addAttribute(
        "position",
        this.skybox.vertexCount,
        3,
        this.skybox.positionBuffer(),
      );

      attributes.addIndices(new Uint32Array(this.skybox.faceBuffer()));

      this.skyboxShader = new ShaderProgram(
        skyboxVertexSource,
        skyboxFragmentSource,
      );
      this.skyboxVAO = new VertexArray(this.skyboxShader, attributes);
      this.skyboxInitialized = true;
      // console.log("Skybox successfully created.")
    } catch (error) {
      console.error("Failed to initialize skybox:", error);
    }
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
    // Render skybox first (background) without writing to depth buffer
    if (this.skyboxInitialized) {
      gl.depthMask(false);
      this.renderSkybox(camera);
      gl.depthMask(true);
    }

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
    includeWorldLight: boolean = true,
  ) {
    // console.log(mesh.name);
    mesh.shader.bind();
    mesh.shader.setUniformMatrix4fv("clipFromEye", this.clipFromEye.elements);
    mesh.shader.setUniformMatrix4fv(
      "eyeFromWorld",
      camera.eyeFromWorld.elements,
    );
    mesh.shader.setUniformMatrix4fv(
      "worldFromModel",
      mesh.worldFromModel
        ? mesh.worldFromModel.elements
        : Matrix4.identity().elements,
    );
    if (mesh.textureNumber !== undefined) {
      mesh.shader.setUniform1i("textureSource", mesh.textureNumber);
      mesh.shader.setUniform2f(
        "textureScale",
        mesh.textureScale![0],
        mesh.textureScale![1],
      );
    }
    if (includeWorldLight && this.worldLightPosition) {
      const eyeLightPosition = camera.eyeFromWorld.multiplyPosition(
        this.worldLightPosition,
      );
      mesh.shader.setUniform3f(
        "lightPosition",
        eyeLightPosition.x,
        eyeLightPosition.y,
        eyeLightPosition.z,
      );
    }

    const vao = mesh.getVao();
    vao.bind();
    vao.drawIndexed(gl.TRIANGLES);
    vao.unbind();
    mesh.shader.unbind();
  }

  private renderSkybox(camera: Camera) {
    if (!this.skyboxShader || !this.skyboxVAO) return;

    // Cast to ThirdPersonCamera to access position
    const thirdPersonCamera = camera as any;
    const cameraPosition = thirdPersonCamera.position;

    this.skyboxShader.bind();
    this.skyboxShader.setUniformMatrix4fv(
      "clipFromEye",
      this.clipFromEye.elements,
    );
    this.skyboxShader.setUniformMatrix4fv(
      "eyeFromWorld",
      camera.eyeFromWorld.elements,
    );

    // Position skybox at camera location and scale it up
    const worldFromModel = Matrix4.translate(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z,
    ).multiplyMatrix(Matrix4.scale(1000, 1000, 1000));
    this.skyboxShader.setUniformMatrix4fv(
      "worldFromModel",
      worldFromModel.elements,
    );
    this.skyboxShader.setUniform1i("skybox", 3); // Bind to texture unit 3

    this.skyboxVAO.bind();
    this.skyboxVAO.drawIndexed(gl.TRIANGLES);
    this.skyboxVAO.unbind();
    this.skyboxShader.unbind();

    // console.log("Skybox succesfully rendered.")
  }
}
