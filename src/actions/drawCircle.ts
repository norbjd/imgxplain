import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class DrawCircleOptions extends ActionOptions {
  centerX: number;
  centerY: number;
  radius: number;
  borderSize: number;
  color: string;

  constructor(
    centerX: number,
    centerY: number,
    radius: number,
    borderSize: number,
    color: string
  ) {
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.borderSize = borderSize;
    this.color = color;
  }
}

class DrawCircle extends Action<DrawCircleOptions> {
  constructor(canvas: Canvas, options: DrawCircleOptions) {
    super(canvas, "draw_circle", options);
  }

  do(context: CanvasRenderingContext2D): void {
    const circleCanvasCenter = this.canvas.getPointProjectionOnCanvas(
      this.options.centerX,
      this.options.centerY
    );
    const circleCanvasCenterX = circleCanvasCenter.x;
    const circleCanvasCenterY = circleCanvasCenter.y;

    const ratio = this.canvas.getImageRatio();
    const circleCanvasRadiusX = this.options.radius / ratio.ratioWidth;
    const circleCanvasRadiusY = this.options.radius / ratio.ratioHeight;

    context.save();

    context.beginPath();

    context.lineWidth = this.options.borderSize;
    context.strokeStyle = this.options.color;
    context.arc(
      circleCanvasCenterX,
      circleCanvasCenterY,
      circleCanvasRadiusX,
      0,
      Math.PI
    );
    context.stroke();
    context.beginPath();
    context.arc(
      circleCanvasCenterX,
      circleCanvasCenterY,
      circleCanvasRadiusY,
      Math.PI,
      2 * Math.PI
    );
    context.stroke();

    context.restore();
  }
}

export { DrawCircle, DrawCircleOptions };
