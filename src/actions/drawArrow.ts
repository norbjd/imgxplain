import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class DrawArrowOptions extends ActionOptions {
  originX: number;
  originY: number;
  destinationX: number;
  destinationY: number;
  lineWidth: number;
  color: string;

  constructor(
    originX: number,
    originY: number,
    destinationX: number,
    destinationY: number,
    lineWidth: number,
    color: string
  ) {
    super();
    this.originX = originX;
    this.originY = originY;
    this.destinationX = destinationX;
    this.destinationY = destinationY;
    this.lineWidth = lineWidth;
    this.color = color;
  }
}

class DrawArrow extends Action<DrawArrowOptions> {
  constructor(canvas: Canvas, options: DrawArrowOptions) {
    super(canvas, "draw_arrow", options);
  }

  do(context: CanvasRenderingContext2D): void {
    const lineCanvasOrigin = this.canvas.getPointProjectionOnCanvas(
      this.options.originX,
      this.options.originY
    );
    const lineCanvasOriginX = lineCanvasOrigin.x;
    const lineCanvasOriginY = lineCanvasOrigin.y;

    const lineCanvasDestination = this.canvas.getPointProjectionOnCanvas(
      this.options.destinationX,
      this.options.destinationY
    );
    const lineCanvasDestinationX = lineCanvasDestination.x;
    const lineCanvasDestinationY = lineCanvasDestination.y;

    context.save();

    context.lineWidth = this.options.lineWidth;
    context.strokeStyle = this.options.color;

    context.beginPath();
    context.moveTo(lineCanvasOriginX, lineCanvasOriginY);
    context.lineTo(lineCanvasDestinationX, lineCanvasDestinationY);
    context.stroke();
    context.closePath();

    context.beginPath();

    const arrowHeadRadius = this.options.lineWidth * 2;

    let angle = Math.atan2(
      lineCanvasDestinationY - lineCanvasOriginY,
      lineCanvasDestinationX - lineCanvasOriginX
    );
    context.moveTo(
      arrowHeadRadius * Math.cos(angle) + lineCanvasDestinationX,
      arrowHeadRadius * Math.sin(angle) + lineCanvasDestinationY
    );
    angle += (1.0 / 3.0) * (2 * Math.PI);
    context.lineTo(
      arrowHeadRadius * Math.cos(angle) + lineCanvasDestinationX,
      arrowHeadRadius * Math.sin(angle) + lineCanvasDestinationY
    );
    angle += (1.0 / 3.0) * (2 * Math.PI);
    context.lineTo(
      arrowHeadRadius * Math.cos(angle) + lineCanvasDestinationX,
      arrowHeadRadius * Math.sin(angle) + lineCanvasDestinationY
    );
    context.closePath();

    context.fillStyle = this.options.color;
    context.fill();

    context.restore();
  }
}

export { DrawArrow, DrawArrowOptions };
