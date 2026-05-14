import { createEchoFrameApp } from "./js/app.mjs";
import { startLaunchCanvas } from "./js/canvas-preview.mjs";

const launchCanvas = document.getElementById("launch-canvas");
if (launchCanvas) {
  startLaunchCanvas(launchCanvas);
}

const root = document.getElementById("app");
if (root) {
  createEchoFrameApp(root).start();
}
