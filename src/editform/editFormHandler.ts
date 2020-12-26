import { Canvas } from "../canvas";
import { DrawRectangle, DrawRectangleOptions } from "../actions/drawRectangle";
import { DrawCircle, DrawCircleOptions } from "../actions/drawCircle";
import { DrawXCross, DrawXCrossOptions } from "../actions/drawXCross";
import { Zoom, ZoomOptions } from "../actions/zoom";
import { Subtitle, SubtitleOptions } from "../actions/subtitle";
import {
  FocusRectangle,
  FocusRectangleOptions,
} from "../actions/focusRectangle";
import { EditForm } from "./editForm";
import { DOMUtils } from "../utils/domUtils";
import { DrawPointOptions, DrawPoint } from "../actions/drawPoint";
import { DrawArrowOptions, DrawArrow } from "../actions/drawArrow";
import { Action, ActionOptions } from "../actions/action";

class EditFormHandler {
  editForm: EditForm;
  canvas: Canvas;

  currentActionDiv: HTMLDivElement;

  constructor(editForm: EditForm, canvas: Canvas) {
    this.editForm = editForm;
    this.getActions().forEach((e) => {
      e.addEventListener("click", () => {
        // @ts-ignore
        const value = e.value;
        this.displayActionDiv(value);
      });
    });
    this.getFormButtonElement("action_preview").addEventListener(
      "click",
      (e) => {
        this.preview(e);
      }
    );

    this.canvas = canvas;
    this.canvas.addClickEventListener((e: MouseEvent) => this.clickOnCanvas(e));
  }

  getFormInputElement(name: string): HTMLInputElement {
    return this.editForm.getFormInputElement(name);
  }

  getFormButtonElement(name: string): HTMLButtonElement {
    return this.editForm.getFormButtonElement(name);
  }

  getActions(): RadioNodeList {
    return this.editForm.getActions();
  }

  getRegionStartInput(): HTMLInputElement {
    return this.editForm.getRegionStartInput();
  }

  getRegionEndInput(): HTMLInputElement {
    return this.editForm.getRegionEndInput();
  }

  getActionFromActionType(actionType: string): Action<ActionOptions> {
    let action: Action<ActionOptions>;

    switch (actionType) {
      case "draw_arrow":
        action = new DrawArrow(
          this.canvas,
          new DrawArrowOptions(
            Number(this.getFormInputElement("draw_arrow_originX").value),
            Number(this.getFormInputElement("draw_arrow_originY").value),
            Number(this.getFormInputElement("draw_arrow_destinationX").value),
            Number(this.getFormInputElement("draw_arrow_destinationY").value),
            Number(this.getFormInputElement("draw_arrow_lineWidth").value),
            this.getFormInputElement("draw_arrow_color").value
          )
        );
        break;
      case "draw_circle":
        action = new DrawCircle(
          this.canvas,
          new DrawCircleOptions(
            Number(this.getFormInputElement("draw_circle_centerX").value),
            Number(this.getFormInputElement("draw_circle_centerY").value),
            Number(this.getFormInputElement("draw_circle_radius").value),
            Number(this.getFormInputElement("draw_circle_borderSize").value),
            this.getFormInputElement("draw_circle_color").value
          )
        );
        break;
      case "draw_point":
        action = new DrawPoint(
          this.canvas,
          new DrawPointOptions(
            Number(this.getFormInputElement("draw_point_centerX").value),
            Number(this.getFormInputElement("draw_point_centerY").value),
            Number(this.getFormInputElement("draw_point_radius").value),
            this.getFormInputElement("draw_point_color").value,
          )
        );
        break;
      case "draw_rectangle":
        action = new DrawRectangle(
          this.canvas,
          new DrawRectangleOptions(
            Number(
              this.getFormInputElement("draw_rectangle_topLeftX").value
            ),
            Number(
              this.getFormInputElement("draw_rectangle_topLeftY").value
            ),
            Number(
              this.getFormInputElement("draw_rectangle_bottomRightX").value
            ),
            Number(
              this.getFormInputElement("draw_rectangle_bottomRightY").value
            ),
            Number(
              this.getFormInputElement("draw_rectangle_borderSize").value
            ),
            this.getFormInputElement("draw_rectangle_color").value
          )
        );
        break;
      case "draw_xcross":
        action = new DrawXCross(
          this.canvas,
          new DrawXCrossOptions(
            Number(this.getFormInputElement("draw_xcross_centerX").value),
            Number(this.getFormInputElement("draw_xcross_centerY").value),
            Number(this.getFormInputElement("draw_xcross_radius").value),
            Number(this.getFormInputElement("draw_xcross_lineWidth").value),
            this.getFormInputElement("draw_xcross_color").value
          )
        );
        break;
      case "zoom":
        action = new Zoom(
          this.canvas,
          new ZoomOptions(
            Number(this.getFormInputElement("zoom_topLeftX").value),
            Number(this.getFormInputElement("zoom_topLeftY").value),
            Number(this.getFormInputElement("zoom_bottomRightX").value),
            Number(this.getFormInputElement("zoom_bottomRightY").value)
          )
        );
        break;
      case "subtitle":
        action = new Subtitle(
          this.canvas,
          new SubtitleOptions(
            this.getFormInputElement("subtitle_text").value,
            Number(this.getFormInputElement("subtitle_position").value),
            this.getFormInputElement("subtitle_backgroundColor").value,
            Number(
              this.getFormInputElement("subtitle_backgroundColorOpacity")
                .value
            ),
            this.getFormInputElement("subtitle_textColor").value,
            Number(this.getFormInputElement("subtitle_fontSize").value),
            "Roboto Medium"
          )
        );
        break;
      case "focus_rectangle":
        action = new FocusRectangle(
          this.canvas,
          new FocusRectangleOptions(
            Number(
              this.getFormInputElement("focus_rectangle_topLeftX").value
            ),
            Number(
              this.getFormInputElement("focus_rectangle_topLeftY").value
            ),
            Number(
              this.getFormInputElement("focus_rectangle_bottomRightX").value
            ),
            Number(
              this.getFormInputElement("focus_rectangle_bottomRightY").value
            )
          )
        );
        break;
      default:
        throw new Error("Invalid action type : " + actionType);
    }

    return action;
  }

  editAction = (region): void => {
    this.getRegionStartInput().value =
      "" + Math.round((region.start + Number.EPSILON) * 100) / 100;
    this.getRegionEndInput().value =
      "" + Math.round((region.end + Number.EPSILON) * 100) / 100;
    if (region.data.note != undefined) {
      this.editForm.getRegionNoteInput().value = "" + region.data.note;
    } else {
      this.editForm.getRegionNoteInput().value = "";
    }

    //#region fill form
    if (
      !(
        Object.keys(region.data).length === 0 &&
        region.data.constructor === Object
      )
    ) {
      const data = region.data;

      const actionType = data.action.type;

      switch (actionType) {
        case "draw_arrow":
          this.getFormInputElement("action_type").value = "draw_arrow";

          this.getFormInputElement("draw_arrow_originX").value =
            data.action.options["originX"];
          this.getFormInputElement("draw_arrow_originY").value =
            data.action.options["originY"];
          this.getFormInputElement("draw_arrow_destinationX").value =
            data.action.options["destinationX"];
          this.getFormInputElement("draw_arrow_destinationY").value =
            data.action.options["destinationY"];
          this.getFormInputElement("draw_arrow_lineWidth").value =
            data.action.options["lineWidth"];
          this.getFormInputElement("draw_arrow_color").value =
            data.action.options["color"];
          break;
        case "draw_circle":
          this.getFormInputElement("action_type").value = "draw_circle";

          this.getFormInputElement("draw_circle_centerX").value =
            data.action.options["centerX"];
          this.getFormInputElement("draw_circle_centerY").value =
            data.action.options["centerY"];
          this.getFormInputElement("draw_circle_radius").value =
            data.action.options["radius"];
          this.getFormInputElement("draw_circle_borderSize").value =
            data.action.options["borderSize"];
          this.getFormInputElement("draw_circle_color").value =
            data.action.options["color"];
          break;
        case "draw_rectangle":
          this.getFormInputElement("action_type").value = "draw_rectangle";

          this.getFormInputElement("draw_rectangle_topLeftX").value =
            data.action.options["topLeftX"];
          this.getFormInputElement("draw_rectangle_topLeftY").value =
            data.action.options["topLeftY"];
          this.getFormInputElement("draw_rectangle_bottomRightX").value =
            data.action.options["bottomRightX"];
          this.getFormInputElement("draw_rectangle_bottomRightY").value =
            data.action.options["bottomRightY"];
          this.getFormInputElement("draw_rectangle_borderSize").value =
            data.action.options["borderSize"];
          this.getFormInputElement("draw_rectangle_color").value =
            data.action.options["color"];
          break;
        case "draw_point":
          this.getFormInputElement("action_type").value = "draw_point";

          this.getFormInputElement("draw_point_centerX").value =
            data.action.options["centerX"];
          this.getFormInputElement("draw_point_centerY").value =
            data.action.options["centerY"];
          this.getFormInputElement("draw_point_radius").value =
            data.action.options["radius"];
          this.getFormInputElement("draw_point_color").value =
            data.action.options["color"];
          break;
        case "draw_xcross":
          this.getFormInputElement("action_type").value = "draw_xcross";

          this.getFormInputElement("draw_xcross_centerX").value =
            data.action.options["centerX"];
          this.getFormInputElement("draw_xcross_centerY").value =
            data.action.options["centerY"];
          this.getFormInputElement("draw_xcross_radius").value =
            data.action.options["radius"];
          this.getFormInputElement("draw_xcross_color").value =
            data.action.options["color"];
          break;
        case "zoom":
          this.getFormInputElement("action_type").value = "zoom";

          this.getFormInputElement("zoom_topLeftX").value =
            data.action.options["topLeftX"];
          this.getFormInputElement("zoom_topLeftY").value =
            data.action.options["topLeftY"];
          this.getFormInputElement("zoom_bottomRightX").value =
            data.action.options["bottomRightX"];
          this.getFormInputElement("zoom_bottomRightY").value =
            data.action.options["bottomRightY"];
          break;
        case "subtitle":
          this.getFormInputElement("action_type").value = "subtitle";

          this.getFormInputElement("subtitle_text").value =
            data.action.options["text"];
          this.getFormInputElement("subtitle_position").value =
            data.action.options["position"];
          this.getFormInputElement("subtitle_backgroundColor").value =
            data.action.options["backgroundColor"];
          this.getFormInputElement("subtitle_textColor").value =
            data.action.options["textColor"];
          break;
        case "focus_rectangle":
          this.getFormInputElement("action_type").value = "focus_rectangle";

          this.getFormInputElement("focus_rectangle_topLeftX").value =
            data.action.options["topLeftX"];
          this.getFormInputElement("focus_rectangle_topLeftY").value =
            data.action.options["topLeftY"];
          this.getFormInputElement("focus_rectangle_bottomRightX").value =
            data.action.options["bottomRightX"];
          this.getFormInputElement("focus_rectangle_bottomRightY").value =
            data.action.options["bottomRightY"];
          break;
        default:
          this.getFormInputElement("action_type").value = "default";
          break;
      }
    } else {
      this.getFormInputElement("action_type").value = "draw_point";
    }
    //#endregion

    this.getActions().forEach(e => {
      if ((e as HTMLInputElement).checked) {
        e.dispatchEvent(new Event("click"));
      }
    });

    this.editForm.show();

    this.editForm.setOnSubmit((e) => {
      e.preventDefault();

      const actionType = this.getFormInputElement("action_type").value;

      const action: Action<ActionOptions> = this.getActionFromActionType(actionType);

      region.update({
        start: this.editForm.getRegionStartInput().value,
        end: this.editForm.getRegionEndInput().value,
        data: {
          action: action,
          note: this.editForm.getRegionNoteInput().value,
        },
      });

      this.updateTranscript(JSON.parse(localStorage.regions));

      this.editForm.reset();
    });

    this.editForm.setOnReset(() => {
      this.editForm.hide();
      this.currentActionDiv = undefined;
    });
  };

  displayActionDiv(actionType: string): void {
    this.currentActionDiv = this.editForm.displayAndReturnActionDiv(actionType);
  }

  resetActionDiv(): void {
    this.currentActionDiv = undefined;
  }

  preview(e: Event): void {
    e.preventDefault();

    let action;

    this.editForm.getAllDivs().forEach((div) => {
      if (div.id.startsWith("action_") && div.style.display != "none") {
        const actionType = div.id.substr(7); // remove action_
        action = this.getActionFromActionType(actionType);
      }
    });

    const actionPreviewButton = this.getFormButtonElement("action_preview");
    actionPreviewButton.disabled = true;
    const timeInMs = 2 * 1000;

    this.canvas.previewAction(action, timeInMs);
    setTimeout(function () {
      actionPreviewButton.disabled = false;
    }, timeInMs);
  }

  clickOnCanvas(e: MouseEvent): void {
    const cursorPosition = this.canvas.getCursorPositionOnCanvas(e);
    const cursorX = cursorPosition.x;
    const cursorY = cursorPosition.y;

    if (this.currentActionDiv != undefined) {
      const divId = this.currentActionDiv.id;
      const actionName = divId.substr(7); // remove action_

      const setRadioButtonChecked: HTMLInputElement = document
        .querySelector("div#" + divId + " input[type=radio]:checked");

      if (setRadioButtonChecked != undefined) {
        switch (divId) {
          case "action_draw_arrow":
            if (setRadioButtonChecked.id == "set_" + actionName + "_origin") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_originX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_originY",
                cursorY
              );
            } else if (setRadioButtonChecked.id == "set_" + actionName + "_destination") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_destinationX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_destinationY",
                cursorY
              );
            }
            break;
          case "action_draw_circle":
            if (setRadioButtonChecked.id == "set_" + actionName + "_center") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_centerX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_centerY",
                cursorY
              );
            }
            break;
          case "action_draw_point":
            if (setRadioButtonChecked.id == "set_" + actionName + "_center") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_centerX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_centerY",
                cursorY
              );
            }
            break;
          case "action_draw_rectangle":
            if (setRadioButtonChecked.id == "set_" + actionName + "_topLeft") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_topLeftX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_topLeftY",
                cursorY
              );
            } else if (setRadioButtonChecked.id == "set_" + actionName + "_bottomRight") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_bottomRightX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_bottomRightY",
                cursorY
              );
            }
            break;
          case "action_draw_xcross":
            if (setRadioButtonChecked.id == "set_" + actionName + "_center") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_centerX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_centerY",
                cursorY
              );
            }
            break;
          case "action_zoom":
            if (setRadioButtonChecked.id == "set_" + actionName + "_topLeft") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_topLeftX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_topLeftY",
                cursorY
              );
            } else if (setRadioButtonChecked.id == "set_" + actionName + "_bottomRight") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_bottomRightX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_bottomRightY",
                cursorY
              );
            }
            break;
          case "action_subtitle":
            break;
          case "action_focus_rectangle":
            if (setRadioButtonChecked.id == "set_" + actionName + "_topLeft") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_topLeftX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_topLeftY",
                cursorY
              );
            } else if (setRadioButtonChecked.id == "set_" + actionName + "_bottomRight") {
              DOMUtils.setHTMLInputElementValue(
                actionName + "_bottomRightX",
                cursorX
              );
              DOMUtils.setHTMLInputElementValue(
                actionName + "_bottomRightY",
                cursorY
              );
            }
            break;
          default:
            throw new Error("Invalid action : [" + divId + "]");
        }
      }
    }
  }

  updateTranscript = (sortedRegions: any[]): void => {
    const transcriptDiv = DOMUtils.getTranscriptDiv();
    transcriptDiv.innerHTML = "";

    for (let i = 0; i < sortedRegions.length; i++) {
      const regionAction = sortedRegions[i].data.action;
      if (regionAction != undefined && regionAction.type == "subtitle") {
        const element = document.createElement("span");
        element.setAttribute("id", "subtitle_" + i);
        element.innerText =
          sortedRegions[i].data.action.options.text.replace("\n", " ") +
          " ";
        transcriptDiv.appendChild(element);
      }
    }
  };

  highlightTranscriptPart(sortedRegions: any[], currentTime: number): void {
    const transcriptDiv = DOMUtils.getTranscriptDiv();

    for (let i = 0; i < sortedRegions.length; i++) {
      const regionAction = sortedRegions[i].data.action;
      if (regionAction != undefined && regionAction.type == "subtitle") {
        const span = transcriptDiv.querySelector(
          "#subtitle_" + i
        ) as HTMLSpanElement;
        if (
          currentTime >= sortedRegions[i].start &&
          currentTime <= sortedRegions[i].end
        ) {
          span.style.background = "lime";
        } else {
          span.style.background = "";
        }
      }
    }
  }
}

export { EditFormHandler };
