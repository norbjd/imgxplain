import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class DrawRectangleOptions extends ActionOptions {
    topLeftX: number;
    topLeftY: number;
    bottomRightX: number;
    bottomRightY: number;
    borderSize: number;
    color: string;
  
    constructor(
      topLeftX: number,
      topLeftY: number,
      bottomRightX: number,
      bottomRightY: number,
      borderSize: number,
      color: string
    ) {
      super();
      this.topLeftX = topLeftX;
      this.topLeftY = topLeftY;
      this.bottomRightX = bottomRightX;
      this.bottomRightY = bottomRightY;
      this.borderSize = borderSize;
      this.color = color;
    }
  }
  
  class DrawRectangle extends Action<DrawRectangleOptions> {
    constructor(canvas: Canvas, options: DrawRectangleOptions) {
      super(canvas, "draw_rectangle", options);
    }
  
    do(context: CanvasRenderingContext2D): void {
      const rectCanvasTopLeft = this.canvas.getPointProjectionOnCanvas(
        this.options.topLeftX,
        this.options.topLeftY
      );
      const rectCanvasTopLeftX = rectCanvasTopLeft.x;
      const rectCanvasTopLeftY = rectCanvasTopLeft.y;
  
      const rectCanvasBottomRight = this.canvas.getPointProjectionOnCanvas(
        this.options.bottomRightX,
        this.options.bottomRightY
      );
      const rectCanvasBottomRightX = rectCanvasBottomRight.x;
      const rectCanvasBottomRightY = rectCanvasBottomRight.y;
  
      const rectCanvasWidth = rectCanvasBottomRightX - rectCanvasTopLeftX;
      const rectCanvasHeight = rectCanvasBottomRightY - rectCanvasTopLeftY;
  
      context.save();
  
      context.beginPath();
      context.lineWidth = this.options.borderSize;
      context.strokeStyle = this.options.color;
      context.rect(
        rectCanvasTopLeftX,
        rectCanvasTopLeftY,
        rectCanvasWidth,
        rectCanvasHeight
      );
      context.stroke();
  
      context.restore();
    }
  }

  export {
    DrawRectangle,
    DrawRectangleOptions,
  };