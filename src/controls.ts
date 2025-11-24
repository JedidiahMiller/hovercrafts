export class Controls {
  player1Turn = 0;
  player1Move = 0;

  player2Turn = 0;
  player2Move = 0;

  useGamepad = false;

  constructor() {
    // const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    // canvas.addEventListener("click", () => canvas.requestPointerLock());
    // window.addEventListener("mousemove", (e) => {
    //   if (document.pointerLockElement === canvas) {
    //     input.yaw = -e.movementX * 0.15;
    //     input.pitch = -e.movementY * 0.15; // ignored for now
    //   }
    // });

    window.addEventListener("gamepadconnected", () => {
      this.useGamepad = true;
    });

    window.addEventListener("gamepaddisconnected", () => {
      this.useGamepad = false;
    });

    // WASD + QE
    window.addEventListener("keydown", (e) => {
      if (this.useGamepad) return;

      switch (e.key) {
        case "w":
          this.player1Move = 1;
          break;
        case "s":
          this.player1Move = -1;
          break;
        case "a":
          this.player1Turn = -1;
          break;
        case "d":
          this.player1Turn = 1;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (this.useGamepad) return;

      switch (e.key) {
        case "w":
        case "s":
          this.player1Move = 0;
          break;
        case "a":
        case "d":
          this.player1Turn = 0;
          break;
      }
    });
  }

  update() {
    if (!this.useGamepad) return;

    const pads = navigator.getGamepads();
    const pad = pads[0];
    if (!pad) return;

    // left stick X for steering
    const lx = pad.axes[0];

    // triggers (analog on most controllers)
    const rt = pad.buttons[7];
    const lt = pad.buttons[6];

    const forward = rt.value ?? (rt.pressed ? 1 : 0);
    const backward = lt.value ?? (lt.pressed ? 1 : 0);

    this.player1Turn = lx;
    this.player1Move = forward - backward;
  }
}
