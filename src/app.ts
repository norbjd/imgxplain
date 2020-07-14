import {
  LoadingError,
  LoadInput,
  LoadForm,
  LoadHandler,
  LoadFormHandler,
  LoadExampleHandler,
} from "./loadform/index";
import { CustomWaveSurfer } from "./customWaveSurfer";
import { Canvas } from "./canvas";
import { EditFormHandler, EditForm } from "./editform/index";
import { DOMUtils } from "./utils/domUtils";

class App {
  run(): void {
    const loadForm: LoadForm = new LoadForm(DOMUtils.getLoadForm());

    loadForm.getOkButton().addEventListener("click", () => {
      const loadFormHandler: LoadHandler = new LoadFormHandler(loadForm);
      loadFormHandler
        .load()
        .then((loadInput: LoadInput) => {
          this.init(loadInput);
        })
        .catch((error) => {
          if (error instanceof LoadingError) {
            loadForm.displayLoadErrorMessage(error.message);
          } else {
            console.log(error);
          }
        });
    });

    const examplesSpans = loadForm.getExamplesSpans();
    for (let i = 0; i < examplesSpans.length; i++) {
      const span: HTMLSpanElement = examplesSpans[i];
      span.addEventListener("click", () => {
        const loadFormHandler: LoadHandler = new LoadExampleHandler(
          span.innerText
        );
        loadFormHandler.load().then((loadInput: LoadInput) => {
          this.init(loadInput);
        });
      });
    }
  }

  init(loadInput: LoadInput) {
    const imageData = loadInput.imageData;
    const audioBlob = loadInput.audioBlob;
    const jsonActions = loadInput.jsonActions;

    const canvas = new Canvas(imageData);
    const editFormHandler = new EditFormHandler(
      new EditForm(DOMUtils.getEditForm()),
      canvas
    );
    new CustomWaveSurfer(audioBlob, jsonActions, canvas, editFormHandler);

    DOMUtils.removeLoadModalDialog();
    DOMUtils.getToggleEditorButton().addEventListener("click", () => {
      const editorWidth = DOMUtils.getEditorDiv().style.width;
      if (editorWidth == "0px" || editorWidth == "") {
        DOMUtils.openEditor();
      } else {
        DOMUtils.closeEditor();
      }
      canvas.renderImage();
    });

    const ccButton = DOMUtils.getCCButton();
    ccButton.addEventListener("click", () => {
      canvas.ccEnabled = !canvas.ccEnabled;
      if (canvas.ccEnabled) {
        ccButton.src = "assets/images/cc.png";
      } else {
        ccButton.src = "assets/images/nocc.png";
      }
    });

    window.addEventListener("resize", () => {
      canvas.renderImage();
    });
  }
}

export { App };
