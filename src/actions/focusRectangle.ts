import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class FocusRectangle extends Action<FocusRectangleOptions> {
    constructor(canvas: Canvas, options: FocusRectangleOptions) {
      super(canvas, "focus_rectangle", options);
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
  
      const imgTopLeft = this.canvas.getPointProjectionOnCanvas(
        this.canvas.imgTopLeftX,
        this.canvas.imgTopLeftY
      );
      const imgBottomRight = this.canvas.getPointProjectionOnCanvas(
        this.canvas.imgBottomRightX,
        this.canvas.imgBottomRightY
      );
      context.save();
  
      context.globalAlpha = 0.75;
      context.filter = "blur(4px)";
  
      const region = new Path2D();
      region.moveTo(imgTopLeft.x, imgTopLeft.y);
      region.lineTo(imgBottomRight.x, imgTopLeft.y);
      region.lineTo(imgBottomRight.x, imgBottomRight.y);
      region.lineTo(imgTopLeft.x, imgBottomRight.y);
      region.moveTo(imgTopLeft.x, imgTopLeft.y);
      region.lineTo(rectCanvasTopLeftX, rectCanvasTopLeftY);
      region.lineTo(rectCanvasBottomRightX, rectCanvasTopLeftY);
      region.lineTo(rectCanvasBottomRightX, rectCanvasBottomRightY);
      region.lineTo(rectCanvasTopLeftX, rectCanvasBottomRightY);
      region.lineTo(rectCanvasTopLeftX, rectCanvasTopLeftY);
      region.closePath();
  
      context.fill(region, "evenodd");
  
      context.restore();
    }
  }
  
  class FocusRectangleOptions extends ActionOptions {
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

  export {
    FocusRectangle,
    FocusRectangleOptions,
  };