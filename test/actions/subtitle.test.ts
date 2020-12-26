import { expect, it, jest, beforeEach } from "@jest/globals";
import { Subtitle, SubtitleOptions } from "../../src/actions/subtitle";
import { Canvas } from "../../src/canvas";
import { DOMUtils } from "../../src/utils/domUtils";

import { readFileSync } from "fs";
import { resolve } from "path";
import { initCanvas } from "./utils";

const html = readFileSync(resolve(__dirname, "../../public/index.html"), "utf8");
jest.dontMock("fs");
document.documentElement.innerHTML = html.toString();

let canvas: Canvas;
beforeEach(() => {
    canvas = initCanvas();
    canvas.ccEnabled = true;
});

it("should write a subtitle at the bottom", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a subtitle", 80, "#000000", 100, "#ffffff", 12, "Liberation"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should write a subtitle on multiple lines", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a\nsubtitle", 80, "#000000", 100, "#ffffff", 12, "Liberation"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should write a subtitle at the top", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a subtitle", 20, "#000000", 100, "#ffffff", 12, "Liberation"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should write a subtitle with transparent background", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a subtitle", 20, "#000000", 0, "#000000", 12, "Liberation"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a subtitle at the bottom", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a subtitle", 80, "#000000", 100, "#ffffff", 12, "Liberation"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a subtitle on multiple lines", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a\nsubtitle", 80, "#000000", 100, "#ffffff", 12, "Liberation"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a subtitle at the top", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a subtitle", 20, "#000000", 100, "#ffffff", 12, "Liberation"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a subtitle with transparent background", () => {
    new Subtitle(canvas, new SubtitleOptions(
        "This is a subtitle", 20, "#000000", 0, "#000000", 12, "Liberation"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});