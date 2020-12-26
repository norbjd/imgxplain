import { Action, ActionOptions } from "./action";
import { Canvas } from "../canvas";

class SubtitleOptions extends ActionOptions {
  text: string;
  position: number;
  backgroundColor: string;
  backgroundColorOpacity: number;
  textColor: string;
  fontSize: number;
  font: string;

  constructor(
    text: string,
    position: number,
    backgroundColor: string,
    backgroundColorOpacity: number,
    textColor: string,
    fontSize: number,
    font: string
  ) {
    super();
    this.text = text;
    this.position = position;
    this.backgroundColor = backgroundColor;
    this.backgroundColorOpacity = backgroundColorOpacity;
    this.textColor = textColor;
    this.fontSize = fontSize;
    this.font = font;
  }
}

class Subtitle extends Action<SubtitleOptions> {
  constructor(canvas: Canvas, options: SubtitleOptions) {
    super(canvas, "subtitle", options);
  }

  do(context: CanvasRenderingContext2D): void {
    if (this.canvas.ccEnabled) {
      const widthAndHeight = this.canvas.getWidthAndHeight();
      const textVerticalCenter = widthAndHeight.width / 2;

      const paddingWidth = 10;
      const paddingHeight = 10;

      context.save();

      context.font = this.options.fontSize + "px " + this.options.font;
      context.textAlign = "center";
      context.textBaseline = "bottom";

      const lines = this.options.text.split(new RegExp("\\r?\\n|\\r"));

      let linesBoxesHorizontalCenter = 0;
      lines.forEach((line: string) => {
        const textMetrics = context.measureText(line);
        const lineBoxHeight =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent +
          2 * paddingHeight;
        linesBoxesHorizontalCenter += lineBoxHeight;
      });

      let textHorizontalCenter = Math.max(
        Math.min(
          (widthAndHeight.height * this.options.position) / 100 -
          linesBoxesHorizontalCenter / 2,
          widthAndHeight.height - linesBoxesHorizontalCenter
        ),
        0
      );

      lines.forEach((line: string) => {
        const textMetrics = context.measureText(line);

        const width = textMetrics.width + 2 * paddingWidth;
        const height =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent +
          2 * paddingHeight;
        const topLeftX =
          textVerticalCenter - Math.abs(textMetrics.actualBoundingBoxLeft) - paddingWidth;

        textHorizontalCenter += height;
        const topLeftY =
          textHorizontalCenter -
          textMetrics.actualBoundingBoxAscent -
          paddingHeight;

        context.fillStyle = this.options.backgroundColor;
        context.globalAlpha = this.options.backgroundColorOpacity / 100;
        context.fillRect(topLeftX, topLeftY, width, height);
        context.globalAlpha = 1;

        context.fillStyle = this.options.textColor;
        context.fillText(
          line,
          textVerticalCenter,
          textHorizontalCenter,
          widthAndHeight.width
        );
      });

      context.restore();
    }
  }
}

export {
  Subtitle,
  SubtitleOptions,
};