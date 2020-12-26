import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class DrawXCrossOptions extends ActionOptions {
  centerX: number;
  centerY: number;
  radius: number;
  lineWidth: number;
  color: string;

  constructor(
    centerX: number,
    centerY: number,
    radius: number,
    lineWidth: number,
    color: string
  ) {
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.lineWidth = lineWidth;
    this.color = color;
  }
}

class DrawXCross extends Action<DrawXCrossOptions> {
  constructor(canvas: Canvas, options: DrawXCrossOptions) {
    super(canvas, "draw_xcross", options);
  }

  do(context: CanvasRenderingContext2D): void {
    const xCrossCanvasCenter = this.canvas.getPointProjectionOnCanvas(
      this.options.centerX,
      this.options.centerY
    );
    const xCrossCanvasCenterX = xCrossCanvasCenter.x;
    const xCrossCanvasCenterY = xCrossCanvasCenter.y;

    const ratio = this.canvas.getImageRatio();
    const xCrossImgRadiusX = this.options.radius / ratio.ratioWidth;
    const xCrossImgRadiusY = this.options.radius / ratio.ratioHeight;

    context.save();

    context.translate(xCrossCanvasCenterX, xCrossCanvasCenterY);
    context.rotate(Math.PI / 4);
    context.translate(-xCrossCanvasCenterX, -xCrossCanvasCenterY);

    context.lineWidth = this.options.lineWidth;
    context.strokeStyle = this.options.color;

    context.beginPath();
    context.moveTo(xCrossCanvasCenterX - xCrossImgRadiusX, xCrossCanvasCenterY);
    context.lineTo(xCrossCanvasCenterX + xCrossImgRadiusX, xCrossCanvasCenterY);
    context.stroke();
    context.moveTo(xCrossCanvasCenterX, xCrossCanvasCenterY - xCrossImgRadiusY);
    context.lineTo(xCrossCanvasCenterX, xCrossCanvasCenterY + xCrossImgRadiusY);
    context.stroke();

    context.restore();
  }
}

export { DrawXCross, DrawXCrossOptions };
