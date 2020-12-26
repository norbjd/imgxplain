import { expect, it, jest, beforeEach } from "@jest/globals";
import { DrawArrow, DrawArrowOptions } from "../../src/actions/drawArrow";
import { Canvas } from "../../src/canvas";
import { DOMUtils } from "../../src/utils/domUtils";

import { readFileSync } from "fs";
import { resolve } from "path";
import { initCanvas } from "./utils";

const html = readFileSync(
  resolve(__dirname, "../../public/index.html"),
  "utf8"
);
jest.dontMock("fs");
document.documentElement.innerHTML = html.toString();

let canvas: Canvas;
beforeEach(() => {
  canvas = initCanvas();
});

it("should draw a black arrow", () => {
  new DrawArrow(
    canvas,
    new DrawArrowOptions(10, 40, 250, 130, 3, "#000000")
  ).execute();
  const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
  expect(imgBase64).toMatchSnapshot();
});

it("should preview a black arrow", () => {
  new DrawArrow(
    canvas,
    new DrawArrowOptions(10, 40, 250, 130, 3, "#000000")
  ).preview();
  const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
  expect(imgBase64).toMatchSnapshot();
});
