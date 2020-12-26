import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class ZoomOptions extends ActionOptions {
    topLeftX: number;
    topLeftY: number;
    bottomRightX: number;
    bottomRightY: number;
  
    constructor(
      topLeftX: number,
      topLeftY: number,
      bottomRightX: number,
      bottomRightY: number
    ) {
      super();
      this.topLeftX = topLeftX;
      this.topLeftY = topLeftY;
      this.bottomRightX = bottomRightX;
      this.bottomRightY = bottomRightY;
    }
  }
  
  class Zoom extends Action<ZoomOptions> {
    constructor(canvas: Canvas, options: ZoomOptions) {
      super(canvas, "zoom", options);
    }
  
    do(context: CanvasRenderingContext2D): void {
      this.canvas.render(
        this.options.topLeftX,
        this.options.topLeftY,
        this.options.bottomRightX,
        this.options.bottomRightY
      );
    }
  }

  export {
    Zoom,
    ZoomOptions,
  };