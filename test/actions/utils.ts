import { Canvas } from "../../src/canvas";
import { DOMUtils } from "../../src/utils/domUtils";

function initCanvas(): Canvas {
    const canvas = new Canvas("data:image/png;base64,");
    canvas.imgBottomRightX = 300;
    canvas.imgBottomRightY = 150;

    const mainCanvasContext = DOMUtils.getMainCanvas().getContext("2d");
    mainCanvasContext.fillStyle = "rgba(255, 255, 255, 1)"
    mainCanvasContext.fillRect(0, 0, 300, 150);

    const previewCanvasContext = DOMUtils.getPreviewCanvas().getContext("2d");
    previewCanvasContext.fillStyle = "rgba(255, 255, 255, 1)"
    previewCanvasContext.fillRect(0, 0, 300, 150);

    return canvas;
}

export { initCanvas }