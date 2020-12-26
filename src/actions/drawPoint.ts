import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class DrawPointOptions extends ActionOptions {
  centerX: number;
  centerY: number;
  radius: number;
  color: string;

  constructor(centerX: number, centerY: number, radius: number, color: string) {
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.color = color;
  }
}

class DrawPoint extends Action<DrawPointOptions> {
  constructor(canvas: Canvas, options: DrawPointOptions) {
    super(canvas, "draw_point", options);
  }

  do(context: CanvasRenderingContext2D): void {
    const pointCanvasCenter = this.canvas.getPointProjectionOnCanvas(
      this.options.centerX,
      this.options.centerY
    );
    const pointCanvasCenterX = pointCanvasCenter.x;
    const pointCanvasCenterY = pointCanvasCenter.y;

    const ratio = this.canvas.getImageRatio();
    const pointCanvasRadiusX = this.options.radius / ratio.ratioWidth;
    const pointCanvasRadiusY = this.options.radius / ratio.ratioHeight;

    context.save();

    context.beginPath();

    context.fillStyle = this.options.color;
    context.strokeStyle = this.options.color;
    context.arc(
      pointCanvasCenterX,
      pointCanvasCenterY,
      pointCanvasRadiusX,
      0,
      Math.PI
    );
    context.fill();
    context.beginPath();
    context.arc(
      pointCanvasCenterX,
      pointCanvasCenterY,
      pointCanvasRadiusY,
      Math.PI,
      2 * Math.PI
    );
    context.fill();

    context.restore();
  }
}

export { DrawPoint, DrawPointOptions };
