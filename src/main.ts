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
import { HovercraftAudioEngine } from "./engine.js";
import terrainFragmentSource from "@/shaders/terrain-fragment.glsl?raw";
import terrainVertexSource from "@/shaders/terrain-vertex.glsl?raw";

let canvas: HTMLCanvasElement;
let clipFromEye: Matrix4;

let controls: Controls;

// Camera
let camera1: ThirdPersonCamera;
let camera2: ThirdPersonCamera;

let scene: Scene;
let hovercraft1: Hovercraft;
let hovercraft2: Hovercraft;
let barrierMesh: Mesh;

let player1Timer: HTMLElement | null;
let player2Timer: HTMLElement | null;
let player1Speed: HTMLElement | null;
let player2Speed: HTMLElement | null;

const countdownTimerAudio = new Audio("/audio/Start.mp3");
const engineAudio1 = new HovercraftAudioEngine();
const engineAudio2 = new HovercraftAudioEngine();

let lastUpdate: number;
let elapsedTime: number;
let wasPaused = false;

const background = document.getElementById("menu");
const gameTitle = document.getElementById("gameTitle");
const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");
const continueButton = document.getElementById("continue");

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", resizeCanvas);
  elapsedTime = 0;
  wasPaused = false;
  lastUpdate = performance.now() / 1000;
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

  trackMeshes["finish"].worldFromModel = trackTransform;
  trackMeshes["finish"].shader = new ShaderProgram(
    simpleVertexSource,
    simpleFragmentSource
  );
  scene.meshes.push(trackMeshes["finish"]);

  barrierMesh = trackMeshes["barrier"];
  barrierMesh.worldFromModel = trackTransform;

  // Load hovercraft meshes
  const hovercraftMeshes = await Mesh.load("/models/hovercraft.gltf");

  let hovercraftMesh1 = hovercraftMeshes["hovercraft1"];
  hovercraftMesh1.shader = new ShaderProgram(
    simpleVertexSource,
    simpleFragmentSource
  );
  scene.meshes.push(hovercraftMesh1);

  let hovercraftMesh2 = hovercraftMeshes["hovercraft2"];
  hovercraftMesh2.shader = new ShaderProgram(
    simpleVertexSource,
    simpleFragmentSource
  );
  scene.meshes.push(hovercraftMesh2);

  // Create the hovercraft
  hovercraft1 = new Hovercraft(
    new Vector3(0, 50, -350),
    new Vector3(0, 0, -1),
    hovercraftMesh1
  );
  hovercraft2 = new Hovercraft(
    new Vector3(10, 50, -350),
    new Vector3(0, 0, -1),
    hovercraftMesh2
  );

  // Create the camera
  camera1 = new ThirdPersonCamera(
    hovercraft1.position,
    hovercraft1.direction,
    new Vector3(0, 1, 0),
    new Vector3(0, 8, 30),
    new Vector3(-15, 0, 0)
  );

  camera2 = new ThirdPersonCamera(
    hovercraft2.position,
    hovercraft2.direction,
    new Vector3(0, 1, 0),
    new Vector3(0, 8, 30),
    new Vector3(-15, 0, 0)
  );

  if (engineAudio1) {
    engineAudio1.stop();
  }
  if (engineAudio2) {
    engineAudio2.stop();
  }

  countdownTimerAudio.volume = 0.5;
  countdownTimerAudio.play();
  // Initialize and load audio
  await engineAudio1.loadAudio("/audio/Engine.mp3");
  engineAudio1.setVolume(0.8);
  engineAudio1.start();

  await engineAudio2.loadAudio("/audio/Engine2.mp3");
  engineAudio2.setVolume(1);
  engineAudio2.start();

  requestAnimationFrame(animate);
}

function update() {
  let totalSeconds = elapsedTime;

  // If countdown is finished, allow the player to control the hovercraft.
  if (totalSeconds > 5 && !controls.gamePaused) {
    controls.update();
    const moveSpeed = 100;
    const turnSpeed = 0.15;

    hovercraft1.linearAcceleration = hovercraft1.direction.scalarMultiply(
      controls.player1Move * moveSpeed
    );
    hovercraft1.rotationalAcceleration.y = controls.player1Turn * turnSpeed;

    hovercraft2.linearAcceleration = hovercraft2.direction.scalarMultiply(
      controls.player2Move * moveSpeed
    );
    hovercraft2.rotationalAcceleration.y = controls.player2Turn * turnSpeed;
  }

  // Update the hovercraft
  hovercraft1.updatePhysics(scene.groundMeshes, barrierMesh);
  hovercraft2.updatePhysics(scene.groundMeshes, barrierMesh);

  engineAudio1.updatePitch(hovercraft1.linearVelocity);
  engineAudio2.updatePitch(hovercraft2.linearVelocity);

  // Update the camera
  camera1.updateTarget(hovercraft1.position, hovercraft1.direction);
  camera2.updateTarget(hovercraft2.position, hovercraft2.direction);

  if (player1Speed && player2Speed) {
    player1Speed.textContent =
      Math.round(hovercraft1.linearVelocity.magnitude / 4)
        .toString()
        .padStart(3, "0") + " MPH";
    player2Speed.textContent =
      Math.round(hovercraft2.linearVelocity.magnitude / 4)
        .toString()
        .padStart(3, "0") + " MPH";
  }

  if (!controls.gamePaused) {
    // Update the hovercraft
    hovercraft1.updatePhysics(scene.groundMeshes, barrierMesh);
    hovercraft2.updatePhysics(scene.groundMeshes, barrierMesh);

    engineAudio1.updatePitch(hovercraft1.linearVelocity);
    engineAudio2.updatePitch(hovercraft2.linearVelocity);

    // Update the camera
    camera1.updateTarget(hovercraft1.position, hovercraft1.direction);
    camera2.updateTarget(hovercraft2.position, hovercraft2.direction);

    if (player1Speed && player2Speed) {
      player1Speed.textContent =
        Math.round(hovercraft1.linearVelocity.magnitude / 4)
          .toString()
          .padStart(3, "0") + " MPH";
      player2Speed.textContent =
        Math.round(hovercraft2.linearVelocity.magnitude / 4)
          .toString()
          .padStart(3, "0") + " MPH";
    }
    // Update time
    if (player2Timer && player1Timer) {
      // Race countdown
      if (totalSeconds < 1) {
        player2Timer.textContent = "5";
        player1Timer.textContent = "5";
        return;
      } else if (totalSeconds < 2) {
        player2Timer.textContent = "4";
        player1Timer.textContent = "4";
        return;
      } else if (totalSeconds < 3) {
        player2Timer.textContent = "3";
        player1Timer.textContent = "3";
        return;
      } else if (totalSeconds < 4) {
        player2Timer.textContent = "2";
        player1Timer.textContent = "2";
        return;
      } else if (totalSeconds < 5) {
        player2Timer.textContent = "1";
        player1Timer.textContent = "1";
        return;
      }

      totalSeconds = totalSeconds - 5; // Take away 5 seconds so time starts at 0.
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.floor((totalSeconds % 1) * 100);

      // Update and format the timer.
      const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`;
      player2Timer.textContent = formatted;
      player1Timer.textContent = formatted;
    }
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.SCISSOR_TEST);
  gl.viewport(0, 0, canvas.width, canvas.height / 2);
  gl.scissor(0, 0, canvas.width, canvas.height / 2);

  // Render
  scene.render(camera1, true);
  if (controls.resetGame) {
    initialize();
  }

  gl.viewport(0, canvas.height / 2, canvas.width, canvas.height / 2);
  gl.scissor(0, canvas.height / 2, canvas.width, canvas.height / 2);

  scene.render(camera2, true);
  if (controls.resetGame) {
    initialize();
  }
}

function animate(now: number) {
  const t = now / 1000;
  // Only update when not in pause menu since phsyics/timers are based on these variables.
  if (!controls.gamePaused) {
    const dt = t - lastUpdate;
    lastUpdate = t;
    elapsedTime += dt;
  } else {
    lastUpdate = t;
  }

  update();
  render();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  clipFromEye = Matrix4.perspective(
    50,
    canvas.clientWidth / (canvas.clientHeight / 2),
    1,
    50000
  );
  if (scene) {
    scene.clipFromEye = clipFromEye;
  }
}

function startMenu() {
  player2Timer = document.getElementById("player2time");
  player1Timer = document.getElementById("player1time");
  player2Speed = document.getElementById("speed2");
  player1Speed = document.getElementById("speed1");

  startButton?.addEventListener("click", () => {
    hideMenu();
    initialize();
  });

  restartButton?.addEventListener("click", () => {
    hideMenu();
    initialize();
  });

  continueButton?.addEventListener("click", () => {
    hideMenu();
    controls.gamePaused = false;
  });
}

function hideMenu() {
  if (background) background.style.display = "none";
  if (gameTitle) gameTitle.style.display = "none";
  if (startButton) startButton.style.display = "none";
  if (restartButton) restartButton.style.display = "none";
  if (continueButton) continueButton.style.display = "none";
  if (player1Speed) player1Speed.style.display = "block";
  if (player2Speed) player2Speed.style.display = "block";
  if (player1Timer) player1Timer.style.display = "block";
  if (player2Timer) player2Timer.style.display = "block";
}

function pauseMenu() {
  if (background) background.style.display = "block";
  if (gameTitle) gameTitle.style.display = "block";
  if (restartButton) restartButton.style.display = "block";
  if (continueButton) continueButton.style.display = "block";
}

window.addEventListener("load", startMenu);
