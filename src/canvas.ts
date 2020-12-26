import { Action, ActionOptions } from "./actions/action";
import { Zoom, ZoomOptions } from "./actions/zoom";
import { DOMUtils } from "./utils/domUtils";

class Canvas {
  img: HTMLImageElement;
  imgTopLeftX: number;
  imgTopLeftY: number;
  imgBottomRightX: number;
  imgBottomRightY: number;

  mainCanvas: HTMLCanvasElement;
  mainContext: CanvasRenderingContext2D;

  previewCanvas: HTMLCanvasElement;
  previewContext: CanvasRenderingContext2D;

  clickPosition: { x: number; y: number };

  ccEnabled: boolean;

  constructor(imgBlob: string) {
    this.img = new Image();
    this.img.src = imgBlob;
    this.img.addEventListener("load", () => {
      this.renderImage();
    });

    this.imgTopLeftX = 0;
    this.imgTopLeftY = 0;
    this.imgBottomRightX = this.img.naturalWidth;
    this.imgBottomRightY = this.img.naturalHeight;

    this.mainCanvas = DOMUtils.getMainCanvas();
    this.mainContext = this.mainCanvas.getContext("2d");

    this.previewCanvas = DOMUtils.getPreviewCanvas();
    this.previewContext = this.previewCanvas.getContext("2d");

    this.clickPosition = { x: 0, y: 0 };

    this.ccEnabled = false;
  }

  render(
    topLeftX: number,
    topLeftY: number,
    bottomRightX: number,
    bottomRightY: number
  ): void {
    this.imgTopLeftX = topLeftX;
    this.imgTopLeftY = topLeftY;
    this.imgBottomRightX = bottomRightX;
    this.imgBottomRightY = bottomRightY;

    const imgWidth = this.imgBottomRightX - this.imgTopLeftX;
    const imgHeight = this.imgBottomRightY - this.imgTopLeftY;

    const imgRatio = imgWidth / imgHeight;

    const mainDivMaxWidth = DOMUtils.getAvailableMaxWidthForMainDiv();
    const mainDivMaxHeight = DOMUtils.getAvailableMaxHeightForMainDiv();

    let canvasWidth = Math.min(mainDivMaxWidth, imgWidth);
    let canvasHeight = canvasWidth / imgRatio;

    if (canvasHeight >= mainDivMaxHeight) {
      canvasHeight = mainDivMaxHeight;
      canvasWidth = canvasHeight * imgRatio;
    }

    this.mainCanvas.width = canvasWidth;
    this.mainCanvas.height = canvasHeight;
    this.mainContext.drawImage(
      this.img,
      this.imgTopLeftX,
      this.imgTopLeftY,
      imgWidth,
      imgHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    this.previewCanvas.width = canvasWidth;
    this.previewCanvas.height = canvasHeight;
    this.previewCanvas.style.display = "none";

    // TODO : move somewhere else
    // -20 : padding
    DOMUtils.getTranscriptDiv().style.width = "" + (canvasWidth + 5 - 20);
  }

  renderFullImage(): void {
    this.render(0, 0, this.img.naturalWidth, this.img.naturalHeight);
  }

  renderImage(): void {
    this.render(
      this.imgTopLeftX,
      this.imgTopLeftY,
      this.imgBottomRightX,
      this.imgBottomRightY
    );
  }

  getWidthAndHeight(): { width: number; height: number } {
    return {
      width: this.mainCanvas.width,
      height: this.mainCanvas.height,
    };
  }

  getImageRatio(): { ratioWidth: number; ratioHeight: number } {
    const imgWidth = this.imgBottomRightX - this.imgTopLeftX;
    const imgHeight = this.imgBottomRightY - this.imgTopLeftY;

    const canvasWidthAndHeight = this.getWidthAndHeight();

    return {
      ratioWidth: imgWidth / canvasWidthAndHeight.width,
      ratioHeight: imgHeight / canvasWidthAndHeight.height,
    };
  }

  getPointProjectionOnCanvas(
    imgPointX: number,
    imgPointY: number
  ): { x: number; y: number } {
    const ratio = this.getImageRatio();

    const canvasPointX = (imgPointX - this.imgTopLeftX) / ratio.ratioWidth;
    const canvasPointY = (imgPointY - this.imgTopLeftY) / ratio.ratioHeight;

    return {
      x: canvasPointX,
      y: canvasPointY,
    };
  }

  getCursorPositionOnCanvas(event: MouseEvent): { x: number; y: number } {
    const rect = this.mainCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ratio = this.getImageRatio();

    return {
      x: Math.floor(x * ratio.ratioWidth) + this.imgTopLeftX,
      y: Math.floor(y * ratio.ratioHeight) + this.imgTopLeftY,
    };
  }

  addClickEventListener(listener: (event: MouseEvent) => void): void {
    this.mainCanvas.addEventListener("click", listener);
  }

  executeAction(action: Action<ActionOptions>): void {
    action.execute();
  }

  executeActions(actions: Action<ActionOptions>[]): void {
    if (actions.find((action) => action instanceof Zoom) == undefined) {
      this.renderFullImage();
    }

    this.renderImage();
    actions.forEach((action) => {
      this.executeAction(action);
    });
  }

  previewAction(action: Action<ActionOptions>, timeInMs: number): void {
    this.previewCanvas.style.display = "block";
    action.preview();
    setTimeout(() => {
      this.previewContext.clearRect(
        0,
        0,
        this.previewCanvas.width,
        this.previewCanvas.height
      );
      this.previewCanvas.style.display = "none";
      if (action instanceof Zoom) {
        const unzoom = new Zoom(
          this,
          new ZoomOptions(0, 0, this.img.naturalWidth, this.img.naturalHeight)
        );
        this.executeAction(unzoom);
      }
    }, timeInMs);
  }
}

export { Canvas };
