import { expect, it, jest, beforeEach } from '@jest/globals';
import { DrawPoint, DrawPointOptions } from "../../src/actions/drawPoint";
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

it("should draw a red point in the middle", () => {
    new DrawPoint(canvas, new DrawPointOptions(
        150, 75, 50, "#ff0000"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should draw a blue point on the top left", () => {
    new DrawPoint(canvas, new DrawPointOptions(
        0, 0, 50, "#0000ff"
    )).execute();
    const imgBase64 = DOMUtils.getMainCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a red point in the middle", () => {
    new DrawPoint(canvas, new DrawPointOptions(
        150, 75, 50, "#ff0000"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});

it("should preview a blue point on the top left", () => {
    new DrawPoint(canvas, new DrawPointOptions(
        0, 0, 50, "#0000ff"
    )).preview();
    const imgBase64 = DOMUtils.getPreviewCanvas().toDataURL("image/png");
    expect(imgBase64).toMatchSnapshot();
});
