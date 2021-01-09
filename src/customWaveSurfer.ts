import { Action, ActionOptions } from "./actions/action";
import { DrawRectangle, DrawRectangleOptions } from "./actions/drawRectangle";
import { DrawCircle, DrawCircleOptions } from "./actions/drawCircle";
import { DrawXCross, DrawXCrossOptions } from "./actions/drawXCross";
import { Zoom, ZoomOptions } from "./actions/zoom";
import { Subtitle, SubtitleOptions } from "./actions/subtitle";
import {
  FocusRectangle,
  FocusRectangleOptions,
} from "./actions/focusRectangle";
import { FileUtils } from "./utils/fileUtils";
import { Utils } from "./utils/utils";
import { Canvas } from "./canvas";
import { EditFormHandler } from "./editform/index";
import { DOMUtils } from "./utils/domUtils";
import { DrawPointOptions, DrawPoint } from "./actions/drawPoint";
import { DrawArrowOptions, DrawArrow } from "./actions/drawArrow";

import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import MinimapPlugin from "wavesurfer.js/src/plugin/minimap";

import Ajv from "ajv";

class CustomWaveSurfer {
  wavesurfer: WaveSurfer;
  canvas: Canvas;
  editFormHandler: EditFormHandler;

  sortedRegions = [];
  selectedRegion;

  currentActions: Action<ActionOptions>[] = [];

  audio: HTMLAudioElement;

  constructor(
    audioBlob: Blob,
    jsonActions: string,
    canvas: Canvas,
    editFormHandler: EditFormHandler
  ) {
    this.canvas = canvas;
    this.editFormHandler = editFormHandler;

    this.wavesurfer = WaveSurfer.create({
      container: DOMUtils.getWaveformDiv(),
      height: 200,
      pixelRatio: 1,
      minPxPerSec: 100,
      scrollParent: true,
      normalize: true,
      splitChannels: false,
      backend: "MediaElementWebAudio",
      plugins: [
        RegionsPlugin.create(),
        MinimapPlugin.create({
          height: 30,
          waveColor: "#ddd",
          progressColor: "#999",
        }),
      ],
    });

    this.wavesurfer.on("error", function (e) {
      console.warn(e);
    });

    this.audio = new Audio();
    this.audio.src = URL.createObjectURL(audioBlob);
    this.wavesurfer.load(this.audio);

    this.wavesurfer.on("ready", () => {
      this.wavesurfer.enableDragSelection({
        color: "rgba(128, 204, 0, 0.5)",
      });
      this.loadRegions(jsonActions);
      this.saveRegions();
      this.wavesurfer.seekAndCenter(0);
      this.initZoomSlider();
      this.updateTranscript();
    });

    this.initPlayButton();
    this.initExportActionsToJsonButton();
    this.initExportToVideoButton();
    this.initExportSubtitlesButton();
    this.initTranscriptButton();

    this.editFormHandler.editForm
      .getRegionStartInput()
      .addEventListener("input", () => {
        this.selectedRegion.update({
          start: this.editFormHandler.editForm.getRegionStartInput().value,
        });
      });

    this.editFormHandler.editForm
      .getRegionEndInput()
      .addEventListener("input", () => {
        this.selectedRegion.update({
          end: this.editFormHandler.editForm.getRegionEndInput().value,
        });
      });

    this.editFormHandler.editForm
      .getDeleteRegionButton()
      .addEventListener("click", () => {
        this.deleteRegion(this.selectedRegion);
        this.redrawAllRegionsSuperposed();
      });

    this.wavesurfer.on("region-click", this.editFormHandler.editAction);
    this.wavesurfer.on("region-click", (region) => {
      this.selectedRegion = region;
    });

    this.wavesurfer.on("region-updated", this.saveRegions);
    this.wavesurfer.on("region-updated", this.updateBeginAndEnd);

    this.wavesurfer.on("region-update-end", this.saveRegions);
    this.wavesurfer.on("region-update-end", this.redrawAllRegionsSuperposed);
    this.wavesurfer.on("region-update-end", this.updateTranscript);

    this.wavesurfer.on("region-removed", this.saveRegions);
    this.wavesurfer.on("region-removed", this.updateTranscript);

    this.wavesurfer.on("region-play", function (region) {
      region.once("out", function () {
        this.wavesurfer.play(region.start);
        this.wavesurfer.pause();
      });
    });

    this.wavesurfer.on("region-mouseenter", (region) => {
      this.regionChangeHandles(region, "10%", "10px");
    });
    this.wavesurfer.on("region-mouseleave", (region) => {
      this.regionChangeHandles(region, "1%", "3px");
    });

    this.wavesurfer.on("play", () => {
      DOMUtils.getPlayPauseButton().textContent = "⏸️  PAUSE";
      DOMUtils.getPlayPauseButton().style.backgroundColor = "#ff751f";
    });
    this.wavesurfer.on("pause", () => {
      DOMUtils.getPlayPauseButton().textContent = "▶️  PLAY";
      DOMUtils.getPlayPauseButton().style.backgroundColor = "#009e47";
    });

    this.wavesurfer.on("audioprocess", () => {
      const currentTime = this.wavesurfer.getCurrentTime();

      for (const region of this.sortedRegions) {
        if (region.data.action != undefined) {
          const action = region.data.action;

          const currentTimeDuringAction =
            currentTime >= region.start && currentTime <= region.end;
          const actionAlreadyInCurrentActions: boolean =
            this.currentActions.find((a) => Utils.isEquivalent(a, action)) !=
            undefined;

          if (currentTimeDuringAction) {
            if (!actionAlreadyInCurrentActions) {
              this.currentActions.push(action);
            }
          } else {
            const actionIsFinished = currentTime >= region.end;

            if (actionIsFinished && actionAlreadyInCurrentActions) {
              this.currentActions = this.currentActions.filter(
                (a) => !Utils.isEquivalent(a, action)
              );
            }
          }
        }
      }

      this.canvas.executeActions(this.currentActions);
      this.highlightTranscriptPart(currentTime);
    });

    this.wavesurfer.on("seek", () => {
      if (this.selectedRegion != undefined) {
        const currentTime = this.wavesurfer.getCurrentTime();

        if (
          currentTime <= this.selectedRegion.start ||
          currentTime >= this.selectedRegion.end
        ) {
          this.selectedRegion = undefined;
          this.editFormHandler.resetActionDiv();
          this.editFormHandler.editForm.reset();
        }
      }
    });

    this.wavesurfer.on("seek", () => {
      const currentTime = this.wavesurfer.getCurrentTime();
      this.currentActions = [];

      for (const region of this.sortedRegions) {
        if (region.data.action != undefined) {
          const action = region.data.action;

          const currentTimeDuringAction =
            currentTime >= region.start && currentTime <= region.end;
          const actionAlreadyInCurrentActions: boolean =
            this.currentActions.find((a) => Utils.isEquivalent(a, action)) !=
            undefined;

          if (currentTimeDuringAction) {
            if (!actionAlreadyInCurrentActions) {
              this.currentActions.push(action);
            }
          } else {
            const actionIsFinished = currentTime >= region.end;

            const currentTimeBeforeAction = currentTime < region.start;
            const currentTimeAfterAction = currentTime > region.end;

            if (
              (actionIsFinished && actionAlreadyInCurrentActions) ||
              currentTimeBeforeAction ||
              currentTimeAfterAction
            ) {
              this.currentActions = this.currentActions.filter(
                (a) => !Utils.isEquivalent(a, action)
              );
            }
          }
        }
      }

      this.canvas.executeActions(this.currentActions);
      if (currentTime != 0) {
        this.highlightTranscriptPart(currentTime);
      }
    });

    this.wavesurfer.on("finish", () => {
      this.currentActions = [];
      this.selectedRegion = undefined;
      this.canvas.renderFullImage();
    });
  }

  regionChangeHandles(
    region,
    widthPercentage: string,
    maxWidthPx: string
  ): void {
    region.element.childNodes.forEach(function (i) {
      if (i.nodeName == "HANDLE") {
        i.style["width"] = widthPercentage;
        i.style["max-width"] = maxWidthPx;
      }
    });
  }

  updateBeginAndEnd = (region): void => {
    if (region.start < 0) {
      region.start = 0;
    }
    this.editFormHandler.getRegionStartInput().value =
      "" + Math.round((region.start + Number.EPSILON) * 100) / 100;
    this.editFormHandler.getRegionEndInput().value =
      "" + Math.round((region.end + Number.EPSILON) * 100) / 100;
  };

  drawRegionSuperposed(region, existingRegionsIdSorted): void {
    const regionElement = region.element;
    regionElement.title =
      Math.round((region.start + Number.EPSILON) * 100) / 100 +
      " -> " +
      Math.round((region.end + Number.EPSILON) * 100) / 100;

    regionElement.style["height"] = "10%";

    let top = 0;

    for (const id of existingRegionsIdSorted) {
      if (region.id == id) {
        break;
      }

      const regionStart = region.start;
      const regionEnd = region.end;

      const existingRegion = this.wavesurfer.regions.list[id];
      const existingRegionStart = existingRegion.start;
      const existingRegionEnd = existingRegion.end;

      const fullyIncluded =
        regionStart >= existingRegionStart && regionEnd <= existingRegionEnd;
      const includesExistingRegion =
        regionStart <= existingRegionStart && regionEnd >= existingRegionEnd;
      const onlyStartIncluded =
        regionStart >= existingRegionStart && regionStart < existingRegionEnd;
      const onlyEndIncluded =
        regionEnd > existingRegionStart && regionEnd <= existingRegionEnd;

      if (
        fullyIncluded ||
        onlyStartIncluded ||
        onlyEndIncluded ||
        includesExistingRegion
      ) {
        const topExistingRegion = Number(
          existingRegion.element.style["top"].replace("px", "")
        );
        if (topExistingRegion <= top) {
          top += this.wavesurfer.params.height / 10;
        }
      }
    }

    regionElement.style["top"] = top + "px";
  }

  redrawAllRegionsSuperposed = (): void => {
    const regionsIdSorted = this.getRegionsIdSorted();
    for (const id of regionsIdSorted) {
      const region = this.wavesurfer.regions.list[id];
      this.drawRegionSuperposed(region, regionsIdSorted);
    }
  };

  updateTranscript = (): void => {
    this.editFormHandler.updateTranscript(this.sortedRegions);
  };

  highlightTranscriptPart(currentTime: number): void {
    this.editFormHandler.highlightTranscriptPart(
      this.sortedRegions,
      currentTime
    );
  }

  initZoomSlider(): void {
    const slider = DOMUtils.getWaveformZoomSlider();
    slider.value = this.wavesurfer.params.minPxPerSec;
    slider.min = "" + this.wavesurfer.params.minPxPerSec / 5;
    slider.max = "" + this.wavesurfer.params.minPxPerSec * 10;
    slider.step = "" + this.wavesurfer.params.minPxPerSec * 0.1;
    slider.addEventListener("input", () => {
      this.wavesurfer.zoom(Number(slider.value));
    });
    this.wavesurfer.zoom(Number(slider.value));
  }

  initPlayButton(): void {
    DOMUtils.getPlayPauseButton().addEventListener("click", () =>
      this.wavesurfer.playPause()
    );
  }

  initTranscriptButton(): void {
    const heightPercent = "15%";
    DOMUtils.getTranscriptButton().addEventListener("click", () => {
      const transcriptDiv = DOMUtils.getTranscriptDiv();
      const height = transcriptDiv.style.height;
      if (height == heightPercent) {
        transcriptDiv.style.height = "0px";
        transcriptDiv.style.border = "";
        transcriptDiv.style.marginBottom = "0px";
        transcriptDiv.style.padding = "0px";
      } else {
        transcriptDiv.style.height = heightPercent;
        transcriptDiv.style.border = "1px solid";
        transcriptDiv.style.marginBottom = "10px";
        transcriptDiv.style.padding = "10px";
      }
    });
  }

  initExportActionsToJsonButton(): void {
    DOMUtils.getExportActionsToJsonButton().addEventListener("click", () => {
      FileUtils.localFileContentsToString(
        "./assets/actions_json_schema.json"
      ).then((schema) => {
        const data = JSON.parse(localStorage.regions);
        const ajv = new Ajv();
        const jsonSchema = JSON.parse(schema);
        const validJson = ajv
          .addSchema(jsonSchema, "schema")
          .validate("schema", data);
        if (!validJson) {
          alert(
            "Cannot export : \n" +
              this.ajvErrorsToErrorMessage(JSON.stringify(ajv.errors))
          );
        } else {
          FileUtils.saveBlobToFile(
            new Blob([localStorage.regions], {
              type: "application/json",
            }),
            "actions.json"
          );
        }
      });
    });
  }

  ajvErrorsToErrorMessage(ajvErrorsJson: string): string {
    const jsonObject = JSON.parse(ajvErrorsJson);
    const regexForRegionIndex = /\[([0-9]+)].*/;

    const errorMessages = [];
    jsonObject.forEach((e) => {
      const regionIndex = parseInt(regexForRegionIndex.exec(e.dataPath)[1]);
      const region = JSON.parse(localStorage.regions)[regionIndex];
      const errorMessage =
        "- region " +
        (regionIndex + 1) +
        " (" +
        region.data.action.type +
        ", " +
        region.start +
        " -> " +
        region.end +
        ") " +
        e.message;
      errorMessages.push(errorMessage);
    });

    return errorMessages.join("\n");
  }

  exportVid = (blob) => {
    const a = document.createElement("a");
    a.download = "export.webm";
    a.href = URL.createObjectURL(blob);
    a.textContent = "download the video";
    a.click();
    window.URL.revokeObjectURL(a.href);
  };

  startRecording = () => {
    // @ts-ignore
    const canvasStream: MediaStream = this.canvas.mainCanvas.captureStream();

    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const audioStream = dest.stream;
    audioCtx.createMediaElementSource(this.audio).connect(dest);

    const stream = new MediaStream([
      canvasStream.getVideoTracks()[0],
      audioStream.getAudioTracks()[0],
    ]);

    const chunks = [];
    // @ts-ignore
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = (e) =>
      this.exportVid(new Blob(chunks, { type: "video/webm" }));

    rec.start();

    document.getElementById("content").style.pointerEvents = "none";
    document.getElementById("wait_until_video_exported").style.display =
      "block";
    setTimeout(() => {
      rec.stop();
      this.wavesurfer.stop();
      audioCtx.close();
      document.getElementById("content").style.pointerEvents = "all";
      document.getElementById("wait_until_video_exported").style.display =
        "none";
      //}, 3 * 1000);
    }, this.audio.duration * 1000);
  };

  initExportToVideoButton(): void {
    DOMUtils.getExportToVideoButton().addEventListener("click", () => {
      this.wavesurfer.seekTo(0);
      this.wavesurfer.play();
      this.startRecording();
    });
  }

  initExportSubtitlesButton(): void {
    let webVtt = "WEBVTT\n\n";

    DOMUtils.getExportSubtitlesButton().addEventListener("click", () => {
      function timeToVttTime(time: number): string {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60) % 60;
        const seconds = Math.floor(time % 60);
        const milliseconds = time % 1;

        return (
          String("0" + hours).slice(-2) +
          ":" +
          String("0" + minutes).slice(-2) +
          ":" +
          String("0" + seconds).slice(-2) +
          "." +
          milliseconds.toFixed(3).slice(-3)
        );
      }

      for (let i = 0; i < this.sortedRegions.length; i++) {
        const region = this.sortedRegions[i];
        const regionAction = region.data.action;
        if (regionAction != undefined && regionAction.type == "subtitle") {
          webVtt +=
            timeToVttTime(region.start) +
            " --> " +
            timeToVttTime(region.end) +
            " line:" +
            regionAction.options.position +
            "%" +
            "\n";
          webVtt += regionAction.options.text + "\n\n";
        }
      }

      const a = document.createElement("a");
      a.download = "subtitles.vtt";
      a.href = URL.createObjectURL(
        new Blob([webVtt], {
          type: "text/plain",
        })
      );
      a.click();
      window.URL.revokeObjectURL(a.href);
    });
  }

  getRegionsIdSorted(): string[] {
    return Object.keys(this.wavesurfer.regions.list).sort((a, b) => {
      const regionA = this.wavesurfer.regions.list[a];
      const regionB = this.wavesurfer.regions.list[b];

      const regionAStart = regionA.start;
      const regionAEnd = regionA.end;

      const regionBStart = regionB.start;
      const regionBEnd = regionB.end;

      if (regionAStart - regionBStart == 0.0) {
        return regionAEnd - regionAStart - (regionBEnd - regionBStart);
      }
      return regionAStart - regionBStart;
    });
  }

  saveRegions = (): void => {
    this.sortedRegions = this.getRegionsIdSorted().map((id) => {
      const region = this.wavesurfer.regions.list[id];
      return {
        start: Math.round((region.start + Number.EPSILON) * 100) / 100,
        end: Math.round((region.end + Number.EPSILON) * 100) / 100,
        data: region.data,
      };
    });

    this.redrawAllRegionsSuperposed();
    localStorage.regions = JSON.stringify(
      this.sortedRegions,
      (key, value) => {
        switch (key) {
          case "canvas":
            return undefined;
          default:
            return value;
        }
      },
      2
    );
  };

  loadRegions(regions): void {
    regions.forEach((region) => {
      region.color = this.randomColor(0.5);

      const regionActionOptions = region.data.action.options;
      const regionActionType = region.data.action.type;

      let options;
      let action;

      switch (regionActionType) {
        case "draw_arrow":
          options = new DrawArrowOptions(
            regionActionOptions.originX,
            regionActionOptions.originY,
            regionActionOptions.destinationX,
            regionActionOptions.destinationY,
            regionActionOptions.lineWidth,
            regionActionOptions.color
          );
          action = new DrawArrow(this.canvas, options);
          break;
        case "draw_circle":
          options = new DrawCircleOptions(
            regionActionOptions.centerX,
            regionActionOptions.centerY,
            regionActionOptions.radius,
            regionActionOptions.borderSize,
            regionActionOptions.color
          );
          action = new DrawCircle(this.canvas, options);
          break;
        case "draw_point":
          options = new DrawPointOptions(
            regionActionOptions.centerX,
            regionActionOptions.centerY,
            regionActionOptions.radius,
            regionActionOptions.color
          );
          action = new DrawPoint(this.canvas, options);
          break;
        case "draw_rectangle":
          options = new DrawRectangleOptions(
            regionActionOptions.topLeftX,
            regionActionOptions.topLeftY,
            regionActionOptions.bottomRightX,
            regionActionOptions.bottomRightY,
            regionActionOptions.borderSize,
            regionActionOptions.color
          );
          action = new DrawRectangle(this.canvas, options);
          break;
        case "draw_xcross":
          options = new DrawXCrossOptions(
            regionActionOptions.centerX,
            regionActionOptions.centerY,
            regionActionOptions.radius,
            regionActionOptions.lineWidth,
            regionActionOptions.color
          );
          action = new DrawXCross(this.canvas, regionActionOptions);
          break;
        case "zoom":
          options = new ZoomOptions(
            regionActionOptions.topLeftX,
            regionActionOptions.topLeftY,
            regionActionOptions.bottomRightX,
            regionActionOptions.bottomRightY
          );
          action = new Zoom(this.canvas, options);
          break;
        case "subtitle":
          options = new SubtitleOptions(
            regionActionOptions.text,
            regionActionOptions.position,
            regionActionOptions.backgroundColor,
            regionActionOptions.backgroundColorOpacity,
            regionActionOptions.textColor,
            regionActionOptions.fontSize,
            "Roboto Medium"
          );
          action = new Subtitle(this.canvas, options);
          break;
        case "focus_rectangle":
          options = new FocusRectangleOptions(
            regionActionOptions.topLeftX,
            regionActionOptions.topLeftY,
            regionActionOptions.bottomRightX,
            regionActionOptions.bottomRightY
          );
          action = new FocusRectangle(this.canvas, options);
          break;
        default:
          throw new Error("Unsupported action : " + regionActionType);
      }

      region.data.action = action;
      region.data.action.type = regionActionType;
      region.data.action.options = options;

      this.wavesurfer.addRegion(region);
    });
  }

  deleteRegion(region): void {
    if (region != undefined) {
      const regionId = region.id;
      if (this.wavesurfer.regions.list[regionId] != undefined) {
        this.wavesurfer.regions.list[regionId].remove();
        this.selectedRegion = undefined;
        this.editFormHandler.editForm.reset();
        this.saveRegions();
      }
    }
  }

  randomColor(alpha: number): string {
    return (
      "rgba(" +
      [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        alpha || 1,
      ] +
      ")"
    );
  }
}

export { CustomWaveSurfer };
