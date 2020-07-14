import { Canvas } from "../canvas";

class Action<T extends ActionOptions> {
  canvas: Canvas;
  type: string;
  options: T;

  constructor(canvas: Canvas, type: string, options: T) {
    this.canvas = canvas;
    this.type = type;
    this.options = options;
  }

  do(context: CanvasRenderingContext2D): void {
    throw new Error("Not implemented");
  }

  execute(): void { this.do(this.canvas.mainContext); }
  preview(): void { this.do(this.canvas.previewContext); }
}

class ActionOptions {}

export {
  Action,
  ActionOptions,
};
