import { ShaderProgram } from "@/lib/shader-program.js";
import { Matrix4 } from "@/lib/matrix.js";
import simpleVertexSource from "@/shaders/simple-vertex.glsl?raw";
import simpleFragmentSource from "@/shaders/simple-fragment.glsl?raw";
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
let barrierMesh: Mesh;

let timeElement: HTMLElement | null;

let lastUpdate = 0;
let elapsedTime = 0;

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", resizeCanvas);
  timeElement = document.getElementById("time");
  elapsedTime = 0;
  resizeCanvas();

  controls = new Controls();

  // Start building the scene
  scene = new Scene(clipFromEye, new Vector3(200, 500, 200));

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
  scene.groundMeshes.push(new TerrainMesh(trackMeshes["track"], 0));

  trackMeshes["grass"].worldFromModel = trackTransform;
  trackMeshes["grass"].shader = new ShaderProgram(
    terrainVertexSource,
    terrainFragmentSource
  );
  trackMeshes["grass"].textureNumber = 1;
  trackMeshes["grass"].applyUniformTextureCoordinates();
  trackMeshes["grass"].textureScale = [500, 500];
  scene.groundMeshes.push(new TerrainMesh(trackMeshes["grass"], 0));

  trackMeshes["decor"].worldFromModel = trackTransform;
  trackMeshes["decor"].shader = new ShaderProgram(
    simpleVertexSource,
    simpleFragmentSource
  );
  scene.meshes.push(trackMeshes["decor"]);

  barrierMesh = trackMeshes["barrier"];
  barrierMesh.worldFromModel = trackTransform;
  barrierMesh.shader = new ShaderProgram(
    simpleVertexSource,
    simpleFragmentSource
  );
  scene.meshes.push(barrierMesh);

  // Load hovercraft meshes
  let hovercraftMesh = (await Mesh.load("/models/hovercraft.gltf"))["Cube"];
  hovercraftMesh.worldFromModel = Matrix4.scale(1, 1, 1);
  hovercraftMesh.shader = new ShaderProgram(
    simpleVertexSource,
    simpleFragmentSource
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
  let totalSeconds = elapsedTime;

  // If countdown is finished, allow the player to control the hovercraft.
  if (totalSeconds > 5) {
    controls.update();
    const moveSpeed = 100;
    const turnSpeed = 0.15;

    hovercraft.linearAcceleration = hovercraft.direction.scalarMultiply(
      controls.player1Move * moveSpeed
    );
    hovercraft.rotationalAcceleration.y = controls.player1Turn * turnSpeed;
  }

  // Update the hovercraft
  hovercraft.updatePhysics(scene.groundMeshes, barrierMesh);

  // Update the camera
  camera.updateTarget(hovercraft.position, hovercraft.direction);

  // Update time
  if (timeElement) {
    // Race countdown
    if (totalSeconds < 1) {
      timeElement.textContent = "5";
      return;
    } else if (totalSeconds < 2) {
      timeElement.textContent = "4";
      return;
    } else if (totalSeconds < 3) {
      timeElement.textContent = "3";
      return;
    } else if (totalSeconds < 4) {
      timeElement.textContent = "2";
      return;
    } else if (totalSeconds < 5) {
      timeElement.textContent = "1";
      return;
    }

    totalSeconds = totalSeconds - 5; // Take away 5 seconds so time starts at 0.
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 100);

    // Update and format the timer.
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`;
    timeElement.textContent = formatted;
  }
}

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // Render
  scene.render(camera, true);
  if (controls.resetGame) {
    initialize();
  }
}

function animate(now: number) {
  const t = now / 1000;
  const dt = t - lastUpdate;
  lastUpdate = t;

  elapsedTime += dt;

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
  clipFromEye = Matrix4.perspective(
    70,
    canvas.clientWidth / canvas.clientHeight,
    1,
    50000
  );
  if (scene) {
    scene.clipFromEye = clipFromEye;
  }
}

window.addEventListener("load", initialize);
