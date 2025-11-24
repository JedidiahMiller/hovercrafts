import { ShaderProgram } from "@/lib/shader-program.js";
import { Matrix4 } from "@/lib/matrix.js";
import hovercraftVertexSource from "@/shaders/hovercraft-vertex.glsl?raw";
import hovercraftFragmentSource from "@/shaders/hovercraft-fragment.glsl?raw";
import { Vector3 } from "@/lib/vector.js";
import { Mesh } from "./mesh.js";
import { ThirdPersonCamera } from "./lib/camera.js";
import { Scene } from "./scene.js";
import { TerrainMesh } from "./terrain.js";
import { Hovercraft } from "./hovercraft.js";
import { Controls } from "./controls.js";
import { loadTextures } from "./textures.js";
import terrainFragmentSource from "@/shaders/terrain-fragment.glsl?raw";
import terrainVertexSource from "@/shaders/terrain-vertex.glsl?raw";

let canvas: HTMLCanvasElement;
let clipFromEye: Matrix4;

let controls: Controls;

// Camera
let camera: ThirdPersonCamera;

let scene: Scene;
let hovercraft: Hovercraft;

let lastUpdate = 0;

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  controls = new Controls();

  // Start building the scene
  scene = new Scene(clipFromEye, new Vector3(0, 500, 0));

  // Load textures
  await loadTextures();

  // Load track meshes
  let trackMeshes = await Mesh.load("/models/track.gltf");
  const trackTransform = Matrix4.scale(800, 800, 800);
  trackMeshes["track"].worldFromModel = trackTransform;
  trackMeshes["track"].shader = new ShaderProgram(
    terrainVertexSource,
    terrainFragmentSource
  );
  trackMeshes["track"].textureNumber = 2;
  trackMeshes["track"].applyUniformTextureCoordinates();
  trackMeshes["track"].textureScale = [100, 100];

  trackMeshes["grass"].worldFromModel = trackTransform;
  trackMeshes["grass"].shader = new ShaderProgram(
    terrainVertexSource,
    terrainFragmentSource
  );
  trackMeshes["grass"].textureNumber = 1;
  trackMeshes["grass"].applyUniformTextureCoordinates();
  trackMeshes["grass"].textureScale = [500, 500];

  scene.groundMeshes.push(new TerrainMesh(trackMeshes["track"], 0));
  scene.groundMeshes.push(new TerrainMesh(trackMeshes["grass"], 0));

  // Load hovercraft meshes
  let hovercraftMesh = (await Mesh.load("/models/hovercraft.gltf"))["Cube"];
  hovercraftMesh.worldFromModel = Matrix4.scale(1, 1, 1);
  hovercraftMesh.shader = new ShaderProgram(
    hovercraftVertexSource,
    hovercraftFragmentSource
  );
  scene.meshes.push(hovercraftMesh);

  // Create the hovercraft
  hovercraft = new Hovercraft(
    new Vector3(0, 50, -350),
    new Vector3(0, 0, -1),
    hovercraftMesh
  );

  // Create the camera
  camera = new ThirdPersonCamera(
    hovercraft.position,
    hovercraft.direction,
    new Vector3(0, 1, 0),
    new Vector3(0, 3, 15),
    new Vector3(-15, 0, 0)
  );

  requestAnimationFrame(animate);
}

function update() {
  controls.update();

  const moveSpeed = 100;
  const turnSpeed = 0.15;

  hovercraft.linearAcceleration = hovercraft.direction.scalarMultiply(
    controls.player1Move * moveSpeed
  );
  hovercraft.rotationalAcceleration.y = controls.player1Turn * turnSpeed;

  // Update the hovercraft
  hovercraft.updatePhysics(scene.groundMeshes);

  // Update the camera
  camera.updateTarget(hovercraft.position, hovercraft.direction);
}

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // Render
  scene.render(camera, true);
}

function animate(now: number) {
  const t = now / 1000;
  const dt = t - lastUpdate;
  lastUpdate = t;

  update();
  render();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  clipFromEye = Matrix4.perspective(
    70,
    canvas.clientWidth / canvas.clientHeight,
    1,
    50000
  );
}

window.addEventListener("load", initialize);
