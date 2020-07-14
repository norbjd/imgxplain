import { App } from "./app";

window.addEventListener("DOMContentLoaded", () => {
  if (!window.AudioContext) {
    const errorMessage = "Web Audio not supported, change your browser";
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  new App().run();
});
