export class Controls {
  player1Turn = 0;
  player1Move = 0;

  player2Turn = 0;
  player2Move = 0;

  resetGame = false;

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
        case "i":
          this.player2Move = 1;
          break;
        case "k":
          this.player2Move = -1;
          break;
        case "j":
          this.player2Turn = -1;
          break;
        case "l":
          this.player2Turn = 1;
          break;
        case "r":
          if (!this.resetGame) {
            this.resetGame = !this.resetGame;
          }
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
        case "i":
        case "k":
          this.player2Move = 0;
          break;
        case "j":
        case "l":
          this.player2Turn = 0;
          break;
      }
    });
  }

  update() {
    if (!this.useGamepad) return;

    const pads = navigator.getGamepads();
    const player1Pad = pads[0];
    const player2Pad = pads[1];

    // Player 1 controller.
    if (player1Pad) {
      // left stick X for steering
      const player1lx = player1Pad.axes[0];

      // triggers (analog on most controllers)
      const player1rt = player1Pad.buttons[7];
      const player1lt = player1Pad.buttons[6];

      // TODO: Add a way to reset the stage using a button?
      const player1Forward = player1rt.value ?? (player1rt.pressed ? 1 : 0);
      const player1Backward = player1lt.value ?? (player1lt.pressed ? 1 : 0);

      this.player1Turn = player1lx;
      this.player1Move = player1Forward - player1Backward;
    }

    // Player 2 controller
    if (player2Pad) {
      // left stick X for steering
      const player2lx = player2Pad.axes[0];

      // triggers (analog on most controllers)
      const player2rt = player2Pad.buttons[7];
      const player2lt = player2Pad.buttons[6];

      // TODO: Add a way to reset the stage using a button?
      const player2Forward = player2rt.value ?? (player2rt.pressed ? 1 : 0);
      const player2Backward = player2lt.value ?? (player2lt.pressed ? 1 : 0);

      this.player2Turn = player2lx;
      this.player2Move = player2Forward - player2Backward;
    }
  }
}
