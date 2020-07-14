import { expect, it, jest, beforeEach } from '@jest/globals';
import { DrawRectangle, DrawRectangleOptions } from "../../src/actions/drawRectangle";
import { Canvas } from '../../src/canvas';
import { DOMUtils } from '../../src/utils/domUtils';

import { readFileSync } from "fs";
import { resolve } from "path";
import { initCanvas } from './utils';

const html = readFileSync(resolve(__dirname, '../../public/index.html'), 'utf8');
jest.dontMock('fs');
document.documentElement.innerHTML = html.toString();

let canvas: Canvas;
beforeEach(() => {
    canvas = initCanvas();
});

it("should draw a red rectangle", () => {
    new DrawRectangle(canvas, new DrawRectangleOptions(
        10, 20, 50, 100, 5, "#ff0000"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should draw a blue rectangle", () => {
    new DrawRectangle(canvas, new DrawRectangleOptions(
        10, 40, 250, 130, 3, "#0000ff"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a red rectangle", () => {
    new DrawRectangle(canvas, new DrawRectangleOptions(
        10, 20, 50, 100, 5, "#ff0000"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a blue rectangle", () => {
    new DrawRectangle(canvas, new DrawRectangleOptions(
        10, 40, 250, 130, 3, "#0000ff"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});
