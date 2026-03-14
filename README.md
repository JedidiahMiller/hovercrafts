# Hovercrafts

A browser-based 3D split-screen racing game built from scratch with a custom WebGL2 rendering engine and physics simulation. Originally developed as a final project for a computer graphics course at JMU.

![Hovercrafts screenshot](docs/gameplay.png)

## Features

- **Custom WebGL2 rendering engine** — no external rendering libraries. All matrix math, shader compilation, and render loops are bespoke
- **Custom physics engine** — spring-based hover mechanics, Möller–Trumbore ray-triangle intersection for ground detection, and collision response
- **Local 2-player split-screen** — dual viewports with scissor test optimization and independent gamepad/keyboard input
- **Custom GLSL shader programs** — Blinn-Phong lighting, terrain blending, skybox cubemap, and billboard grass
- **Dynamic audio** — engine pitch scales with velocity in real time via the Web Audio API
- **All models were handmade in Blender**

## Tech Stack

- TypeScript + Vite
- WebGL2 (raw API, no 3D framework)
- Web Audio API
- HTML/CSS
- glTF 2.0 for models

## Running Locally

```bash
git clone <repo>
npm install
npm run dev
```

Requires a browser with WebGL2 support (all modern browsers).

## Controls

### Keyboard

|          | Player 1 | Player 2 |
| -------- | -------- | -------- |
| Forward  | W        | I        |
| Backward | S        | K        |
| Turn     | A / D    | J / L    |

**esc** — pause

**R** — reset race

### Gamepad (Xbox layout)

Each player uses their own controller. When any gamepad is connected, keyboard input is disabled.

|          | Input             |
| -------- | ----------------- |
| Steer    | Left stick        |
| Forward  | RT                |
| Backward | LT                |
| Reset    | B (player 1 only) |

## Known Issues

- TODO: The hovercraft can fall off the map in a few spots. There needs to be a check that can automatically reset the game.
