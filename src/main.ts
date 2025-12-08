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
let clipFromEye1: Matrix4;
let clipFromEye2: Matrix4;

let controls: Controls;

const countdownLength = 5;

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
let player1LapsDisplay: HTMLElement | null;
let player2LapsDisplay: HTMLElement | null;

const countdownTimerAudio = new Audio("/audio/Start.mp3");
const engineAudio1 = new HovercraftAudioEngine();
const engineAudio2 = new HovercraftAudioEngine();

let lastUpdate: number;
let elapsedTime: number;
let wasPaused = false;
let countdownAudioWasPlaying = false;
let player1PassedCheckpoint = false;
let player1Laps = 0;
let player1PreviousX = 0;
let player1FinishedRace = false;
let player2PassedCheckpoint = false;
let player2Laps = 0;
let player2PreviousX = 0;
let player2FinishedRace = false;

const menuDiv = document.getElementById("menu");
const gameDiv = document.getElementById("game");
const pauseMenuDiv = document.getElementById("pauseMenu");
const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");
const continueButton = document.getElementById("continue");

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", resizeCanvas);
  elapsedTime = 0;
  wasPaused = false;
  player1PassedCheckpoint = false;
  player1Laps = 0;
  player1FinishedRace = false;
  player2PassedCheckpoint = false;
  player2Laps = 0;
  player2FinishedRace = false;
  lastUpdate = performance.now() / 1000;
  resizeCanvas();

  controls = new Controls();

  // Start building the scene
  scene = new Scene(clipFromEye1, new Vector3(200, 500, 200));

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
    new Vector3(1234, 60, -310),
    new Vector3(1, 0, 0).normalize(),
    hovercraftMesh1
  );
  hovercraft2 = new Hovercraft(
    new Vector3(1234, 60, -340),
    new Vector3(1, 0, 0).normalize(),
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

  // This essentially clears the audio cache to ensure the audio plays after reloading the game.
  if (engineAudio1) {
    engineAudio1.stop();
  }
  if (engineAudio2) {
    engineAudio2.stop();
  }

  countdownTimerAudio.volume = 0.3;
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
  if (totalSeconds > countdownLength && !controls.gamePaused) {
    controls.update();
    const moveSpeed = 100;
    const turnSpeed = 0.15;

    // Only apply input to player1 if they haven't finished the race
    if (!player1FinishedRace) {
      hovercraft1.linearAcceleration = hovercraft1.direction.scalarMultiply(
        controls.player1Move * moveSpeed
      );
      hovercraft1.rotationalAcceleration.y = controls.player1Turn * turnSpeed;
    } else {
      // When finished, zero out acceleration to let physics naturally slow down
      hovercraft1.linearAcceleration = new Vector3(0, 0, 0);
      hovercraft1.rotationalAcceleration.y = 0;
    }

    // Only apply input to player2 if they haven't finished the race
    if (!player2FinishedRace) {
      hovercraft2.linearAcceleration = hovercraft2.direction.scalarMultiply(
        controls.player2Move * moveSpeed
      );
      hovercraft2.rotationalAcceleration.y = controls.player2Turn * turnSpeed;
    } else {
      // When finished, zero out acceleration to let physics naturally slow down
      hovercraft2.linearAcceleration = new Vector3(0, 0, 0);
      hovercraft2.rotationalAcceleration.y = 0;
    }
  }

  // Open the pause menu and stop rendering.
  if (controls.gamePaused && !wasPaused) {
    // Just became paused - pause all audio
    countdownAudioWasPlaying = !countdownTimerAudio.paused;
    countdownTimerAudio.pause();
    engineAudio1.pause();
    engineAudio2.pause();
    pauseMenu();
    wasPaused = true;
  } else if (!controls.gamePaused && wasPaused) {
    // Just became unpaused - resume audio
    if (countdownAudioWasPlaying) {
      countdownTimerAudio.play();
    }
    engineAudio1.resume();
    engineAudio2.resume();
    // Reset the physics timer so hovercrafts don't go haywire when you continue the game.
    hovercraft1.resetPhysicsTimestamp();
    hovercraft2.resetPhysicsTimestamp();
    wasPaused = false;
  }

  if (!controls.gamePaused) {
    // Update the hovercraft
    hovercraft1.updatePhysics(scene.groundMeshes, barrierMesh);
    hovercraft2.updatePhysics(scene.groundMeshes, barrierMesh);

    engineAudio1.updatePitch(hovercraft1.linearVelocity);
    engineAudio2.updatePitch(hovercraft2.linearVelocity);

    // Check if player 1 passed the checkpoint
    if (!player1PassedCheckpoint && hovercraft1.position.z > 1500) {
      console.log("Player 1 passed checkpoint!");
      player1PassedCheckpoint = true;
    }

    // Check if player 1 crossed the finish line
    const finishLineX = 1300;
    const finishLineZMin = -460;
    const finishLineZMax = -190;

    if (
      !player1FinishedRace &&
      player1PassedCheckpoint &&
      player1PreviousX < finishLineX &&
      hovercraft1.position.x >= finishLineX &&
      hovercraft1.position.z >= finishLineZMin &&
      hovercraft1.position.z <= finishLineZMax
    ) {
      player1Laps++;
      console.log(`Player 1 completed lap ${player1Laps}!`);
      if (player1LapsDisplay) {
        player1LapsDisplay.textContent = `${player1Laps}/3 LAPS`;
      }

      // Reset checkpoint for next lap
      player1PassedCheckpoint = false;

      // Check if player finished 3 laps
      if (player1Laps >= 3) {
        console.log("Player 1 finished the race!");
        player1FinishedRace = true;
      }
    }

    player1PreviousX = hovercraft1.position.x;

    // Check if player 2 passed the checkpoint
    if (!player2PassedCheckpoint && hovercraft2.position.z > 1500) {
      console.log("Player 2 passed checkpoint!");
      player2PassedCheckpoint = true;
    }

    // Check if player 2 crossed the finish line
    if (
      !player2FinishedRace &&
      player2PassedCheckpoint &&
      player2PreviousX < finishLineX &&
      hovercraft2.position.x >= finishLineX &&
      hovercraft2.position.z >= finishLineZMin &&
      hovercraft2.position.z <= finishLineZMax
    ) {
      player2Laps++;
      console.log(`Player 2 completed lap ${player2Laps}!`);
      if (player2LapsDisplay) {
        player2LapsDisplay.textContent = `${player2Laps}/3 LAPS`;
      }

      // Reset checkpoint for next lap
      player2PassedCheckpoint = false;

      // Check if player finished 3 laps
      if (player2Laps >= 3) {
        console.log("Player 2 finished the race!");
        player2FinishedRace = true;
      }
    }

    player2PreviousX = hovercraft2.position.x;

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
      const countdownValue = countdownLength - totalSeconds;

      if (countdownValue > 0) {
        player2Timer.textContent = Math.floor(countdownValue + 1).toString();
        player1Timer.textContent = Math.floor(countdownValue + 1).toString();
        return;
      }

      totalSeconds = totalSeconds - countdownLength; // Ensure time starts at 0.
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.floor((totalSeconds % 1) * 100);

      // Update and format the timer.
      const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`;

      // Only update player2 timer if they haven't finished the race
      if (!player2FinishedRace) {
        player2Timer.textContent = formatted;
      }

      // Only update player1 timer if they haven't finished the race
      if (!player1FinishedRace) {
        player1Timer.textContent = formatted;
      }
    }
  }
}

function updateFOV(velocity: number): number {
  const baseFOV = 50;
  const maxFOV = 75;
  const maxVelocity = 500;

  // Clamp velocity and calculate FOV increase
  const normalizedVelocity = Math.min(velocity, maxVelocity) / maxVelocity;
  return baseFOV + (maxFOV - baseFOV) * normalizedVelocity;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.SCISSOR_TEST);

  // Update FOV for player 1 based on velocity
  const fov1 = updateFOV(hovercraft1.linearVelocity.magnitude);
  clipFromEye1 = Matrix4.perspective(
    fov1,
    canvas.clientWidth / (canvas.clientHeight / 2),
    1,
    50000
  );
  scene.clipFromEye = clipFromEye1;

  gl.viewport(0, canvas.height / 2, canvas.width, canvas.height / 2);
  gl.scissor(0, canvas.height / 2, canvas.width, canvas.height / 2);

  // Render
  scene.render(camera1, true);
  if (controls.resetGame) {
    initialize();
  }

  // Update FOV for player 2 based on velocity
  const fov2 = updateFOV(hovercraft2.linearVelocity.magnitude);
  clipFromEye2 = Matrix4.perspective(
    fov2,
    canvas.clientWidth / (canvas.clientHeight / 2),
    1,
    50000
  );
  scene.clipFromEye = clipFromEye2;

  gl.viewport(0, 0, canvas.width, canvas.height / 2);
  gl.scissor(0, 0, canvas.width, canvas.height / 2);

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
}

function startMenu() {
  player2Timer = document.getElementById("player2time");
  player1Timer = document.getElementById("player1time");
  player2Speed = document.getElementById("speed2");
  player1Speed = document.getElementById("speed1");
  player2LapsDisplay = document.getElementById("player2laps");
  player1LapsDisplay = document.getElementById("player1laps");

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
  if (menuDiv) menuDiv.style.display = "none";
  if (pauseMenuDiv) pauseMenuDiv.style.display = "none";
  if (gameDiv) gameDiv.style.display = "block";
}

function pauseMenu() {
  if (pauseMenuDiv) pauseMenuDiv.style.display = "block";
}

window.addEventListener("load", startMenu);
