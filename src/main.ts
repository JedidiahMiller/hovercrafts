import { ShaderProgram } from "@/lib/shader-program.js";
import { fetchImage } from "@/lib/web-utilities.js";
import { VertexArray } from "@/lib/vertex-array.js";
import { Matrix4 } from "@/lib/matrix.js";
import terrainVertexSource from "@/shaders/terrain-vertex.glsl?raw";
import terrainFragmentSource from "@/shaders/terrain-fragment.glsl?raw";
import hovercraftVertexSource from "@/shaders/hovercraft-vertex.glsl?raw";
import hovercraftFragmentSource from "@/shaders/hovercraft-fragment.glsl?raw";
import { Vector3 } from "@/lib/vector.js";
import { Renderer } from "@/renderer.js";
import { ThirdPersonCamera } from "./lib/camera.js";
import { MeshLoader } from "./mesh.js";
import { Terrain } from "./terrain.js";
import { Hovercraft } from "./hovercraft.js";

let canvas: HTMLCanvasElement;
let hovercraftShader: ShaderProgram;
let hovercraftVao: VertexArray;
let clipFromEye: Matrix4;
let then: DOMHighResTimeStamp | null = null;
let worldLightPosition: Vector3;
let terrain: Terrain;

type Player = {
  hovercraft: Hovercraft;
};

let player: Player;

type PlayerControllers = {
  horizontal: number;
  vertical: number;
  turn: number;
  yaw: number;
  pitch: number;
  camera?: ThirdPersonCamera;
  controller: Gamepad | null;
};

let playerControls: PlayerControllers = {
  horizontal: 0,
  vertical: 0,
  turn: 0,
  yaw: 0,
  pitch: 0,
  camera: undefined,
  controller: null,
};

const scaler = new Vector3(10, 500, 10);

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", () => resizeCanvas());

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  window.addEventListener("gamepadconnected", (e) => {
    playerControls.controller = navigator.getGamepads()[e.gamepad.index];
  });
  window.addEventListener("gamepaddisconnected", () => {
    playerControls.controller = null;
  });

  hovercraftShader = new ShaderProgram(
    hovercraftVertexSource,
    hovercraftFragmentSource
  );
  hovercraftVao = await MeshLoader.getVao(
    "/models/hovercraft.gltf",
    hovercraftVertexSource,
    hovercraftFragmentSource
  );
  await loadTexture();

  terrain = new Terrain(
    scaler,
    new ShaderProgram(terrainVertexSource, terrainFragmentSource)
  );
  await terrain.loadMap("/rockingham.png");

  // Create the hovercraft
  player = {
    hovercraft: new Hovercraft(terrain.center, new Vector3(0, 0, -1), terrain),
  };

  // Set up elements

  // Place the sun over the center
  worldLightPosition = terrain.center.add(new Vector3(0, 100, 0));

  // Place the hovercraft
  player.hovercraft.position = terrain.center;

  // Camera
  playerControls.camera = new ThirdPersonCamera(
    player.hovercraft.position,
    player.hovercraft.direction,
    new Vector3(0, 1, 0),
    new Vector3(0, 3, -5),
    new Vector3(-15, 0, 10)
  );

  resizeCanvas();
  requestAnimationFrame(animate);
}

function onKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
      playerControls.vertical = 1;
      break;
    case "s":
      playerControls.vertical = -1;
      break;
    case "a":
      playerControls.turn = -1;
      break;
    case "d":
      playerControls.turn = 1;
      break;
    default:
      return;
  }

  render();
}

function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
    case "s":
      playerControls.vertical = 0;
      break;
    case "a":
    case "d":
      playerControls.turn = 0;
      break;
    default:
      return;
  }
}

function render() {
  playerControls.camera!.updateTarget(
    player.hovercraft.position,
    player.hovercraft.direction
  );
  renderCameraPerspective(
    playerControls.camera!,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const aspectRatio = canvas.clientWidth / canvas.clientHeight;

  clipFromEye = Matrix4.perspective(70, aspectRatio, 1, 3000);
  render();
}

function animate() {
  const now = performance.now() / 1000; // Now is in seconds
  const elapsed = then ? now - then : 0;

  // Update the controller states
  const controllers = navigator.getGamepads();
  if (playerControls.controller) {
    playerControls.controller = controllers[playerControls.controller?.index];
  }

  // Use the controller if connected
  const forward = playerControls.controller
    ? playerControls.controller.buttons[7].value -
      playerControls.controller.buttons[6].value
    : playerControls.vertical;
  const turn = playerControls.controller
    ? playerControls.controller.axes[0]
    : playerControls.turn;

  // Apply acceleration
  player.hovercraft.linearAcceleration =
    player.hovercraft.direction.scalarMultiply(forward * -100);
  player.hovercraft.rotationalAcceleration = new Vector3(0, turn * 0.1, 0);

  // Update the hovercraft
  player.hovercraft.updatePhysics();

  // Render it
  render();
  requestAnimationFrame(animate);
  then = now;
}

function renderCameraPerspective(
  camera: ThirdPersonCamera,
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number
) {
  // Set up viewport and scissor for this camera
  gl.viewport(viewportX, viewportY, viewportWidth, viewportHeight);
  gl.scissor(viewportX, viewportY, viewportWidth, viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // Create the renderer
  const renderer = new Renderer(worldLightPosition, clipFromEye);

  // Terrain
  renderer.render(terrain.shader, terrain.vao, camera, undefined, 0);

  // Draw the hovercraft
  const turnLean = -player.hovercraft.rotationalVelocity.y * 2.0;
  const turnCheat = -player.hovercraft.rotationalVelocity.y * 2.0;
  let worldFromHovercraftModel = Matrix4.translate(
    player.hovercraft.position.x,
    player.hovercraft.position.y,
    player.hovercraft.position.z
  )
    .multiplyMatrix(Matrix4.rotateX(player.hovercraft.rotation.x))
    .multiplyMatrix(Matrix4.rotateY(-player.hovercraft.rotation.y + turnCheat))
    .multiplyMatrix(Matrix4.rotateZ(-player.hovercraft.rotation.z + turnLean))
    .multiplyMatrix(Matrix4.scale(0.53, 0.3, 0.4));

  renderer.render(
    hovercraftShader,
    hovercraftVao,
    camera,
    worldFromHovercraftModel
  );
}

function createRgbaTexture2d(
  width: number,
  height: number,
  image: HTMLImageElement | Uint8ClampedArray,
  textureUnit: GLenum = gl.TEXTURE0
) {
  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // If image is an img element, then the width, height and border are inferred and shouldn't be
  // passed to the texImage2D function
  if (image instanceof Uint8ClampedArray) {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

async function loadTexture() {
  const image = await fetchImage("/textures/grass.png");
  createRgbaTexture2d(image.width, image.height, image);
}

window.addEventListener("load", () => initialize());
