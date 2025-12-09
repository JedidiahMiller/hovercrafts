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
import tallgrassVertexSource from "@/shaders/tallgrass-vertex.glsl?raw";
import tallgrassFragmentSource from "@/shaders/tallgrass-fragment.glsl?raw";
import { ShaderProgram } from "./lib/shader-program.js";
import { loadCubemap, fetchImage } from "./lib/web-utilities.js";
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

  tallGrassShader?: ShaderProgram;
  tallGrassVAO?: VertexArray;
  tallGrassTexture?: WebGLTexture;
  tallGrassInitialized = false;

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

  async initializeTallGrass() {
    try {
      // Load tall grass texture
      const grassImage = await fetchImage("/textures/tallGrass.png");

      gl.activeTexture(gl.TEXTURE4);
      this.tallGrassTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.tallGrassTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        grassImage,
      );
      gl.generateMipmap(gl.TEXTURE_2D);

      this.tallGrassShader = new ShaderProgram(
        tallgrassVertexSource,
        tallgrassFragmentSource,
      );

      // Generate random grass positions across the entire map
      const grassCount = 1000;
      const positions: number[] = [];
      const texPositions: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i < grassCount; i++) {
        let validPosition = false;
        let x = 0,
          y = 0,
          z = 0;

        // Try to find a valid position
        let attempts = 0;
        while (!validPosition && attempts < 5) {
          x = (Math.random() - 0.5) * 7000;
          z = (Math.random() - 0.5) * 5500;

          // Make sure the grass is on the grass mesh
          if (this.groundMeshes.length > 1) {
            const hit = this.groundMeshes[1].mesh.raycastMesh(
              new Vector3(x, 1000, z),
              new Vector3(0, -1, 0),
            );
            if (hit) {
              // Add 5 for more visibility
              y = 1000 - hit.distance + 5;
              validPosition = true;
            }
          }
          attempts++;
        }

        if (!validPosition) {
          continue;
        }

        positions.push(x, y, z);
        positions.push(x, y, z);
        positions.push(x, y, z);
        positions.push(x, y, z);

        texPositions.push(0, 0);
        texPositions.push(1, 0);
        texPositions.push(0, 1);
        texPositions.push(1, 1);

        const grassIndex = (positions.length / 3 - 4) / 4;
        indices.push(grassIndex * 4, grassIndex * 4 + 1, grassIndex * 4 + 3);
        indices.push(grassIndex * 4, grassIndex * 4 + 3, grassIndex * 4 + 2);
      }

      const attributes = new VertexAttributes();
      const actualGrassCount = positions.length / 3 / 4;
      attributes.addAttribute(
        "position",
        positions.length / 3,
        3,
        new Float32Array(positions),
      );
      attributes.addAttribute(
        "texPosition",
        texPositions.length / 2,
        2,
        new Float32Array(texPositions),
      );
      attributes.addIndices(new Uint32Array(indices));

      this.tallGrassVAO = new VertexArray(this.tallGrassShader, attributes);
      this.tallGrassInitialized = true;
      console.log(
        `Tall grass initialized successfully with ${Math.round(actualGrassCount)} grass instances`,
      );
    } catch (error) {
      console.error("Failed to initialize tall grass:", error);
    }
  }

  // Render tall grass billboards
  private renderTallGrass(camera: Camera) {
    if (
      !this.tallGrassInitialized ||
      !this.tallGrassShader ||
      !this.tallGrassVAO
    )
      return;

    this.tallGrassShader.bind();

    const cameraRight = new Vector3(
      camera.eyeFromWorld.get(0, 0),
      camera.eyeFromWorld.get(0, 1),
      camera.eyeFromWorld.get(0, 2),
    ).normalize();
    const cameraUp = new Vector3(
      camera.eyeFromWorld.get(1, 0),
      camera.eyeFromWorld.get(1, 1),
      camera.eyeFromWorld.get(1, 2),
    ).normalize();

    this.tallGrassShader.setUniformMatrix4fv(
      "clipFromEye",
      this.clipFromEye.elements,
    );
    this.tallGrassShader.setUniformMatrix4fv(
      "eyeFromWorld",
      camera.eyeFromWorld.elements,
    );
    this.tallGrassShader.setUniformMatrix4fv(
      "worldFromModel",
      Matrix4.identity().elements,
    );
    this.tallGrassShader.setUniform3f(
      "cameraRight",
      cameraRight.x,
      cameraRight.y,
      cameraRight.z,
    );
    this.tallGrassShader.setUniform3f(
      "cameraUp",
      cameraUp.x,
      cameraUp.y,
      cameraUp.z,
    );
    this.tallGrassShader.setUniform1f("grassScale", 10.0);
    this.tallGrassShader.setUniform1i("tallGrassTexture", 4);

    this.tallGrassVAO.bind();
    this.tallGrassVAO.drawIndexed(gl.TRIANGLES);
    this.tallGrassVAO.unbind();
    this.tallGrassShader.unbind();
  }

  render(
    camera: Camera,
    includeWorldLight: boolean = true,
    deltaTime: number = 0,
  ) {
    // Update animations for all meshes
    for (const mesh of this.meshes) {
      if (mesh.hasAnimations() && deltaTime > 0) {
        mesh.updateAnimation(deltaTime * 1000); // Convert to milliseconds
      }
    }

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

    // Tall grass
    this.renderTallGrass(camera);
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

    // Pass animation transforms if this mesh has skeletal animation
    if (mesh.hasSkeleton()) {
      const jointMatrices = mesh.getAnimationTransforms();
      if (jointMatrices.length > 0) {
        // Flatten the array of Matrix4 into a single Float32Array
        const matrixArray = new Float32Array(jointMatrices.length * 16);
        for (let i = 0; i < jointMatrices.length; i++) {
          matrixArray.set(jointMatrices[i].elements, i * 16);
        }
        // WebGL allows setting entire array at once using the [0] element
        mesh.shader.setUniformMatrix4fv("jointMatrices[0]", matrixArray);
      }
    }

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
