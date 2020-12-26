import { expect, it, jest, beforeEach } from "@jest/globals";
import { DrawXCross, DrawXCrossOptions } from "../../src/actions/drawXCross";
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

it("should draw a red x cross in the middle", () => {
  new DrawXCross(
    canvas,
    new DrawXCrossOptions(150, 75, 50, 5, "#ff0000")
  ).execute();
  const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
  expect(imgBase64).toMatchSnapshot();
});

it("should draw a blue x cross", () => {
  new DrawXCross(
    canvas,
    new DrawXCrossOptions(50, 70, 30, 3, "#0000ff")
  ).execute();
  const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
  expect(imgBase64).toMatchSnapshot();
});

it("should preview a red x cross in the middle", () => {
  new DrawXCross(
    canvas,
    new DrawXCrossOptions(150, 75, 50, 5, "#ff0000")
  ).preview();
  const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
  expect(imgBase64).toMatchSnapshot();
});

it("should preview a blue x cross", () => {
  new DrawXCross(
    canvas,
    new DrawXCrossOptions(50, 70, 30, 3, "#0000ff")
  ).preview();
  const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
  expect(imgBase64).toMatchSnapshot();
});
