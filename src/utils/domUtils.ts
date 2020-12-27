class DOMUtils {
  static getDocumentWidth(): number {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  static getDocumentHeight(): number {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }

  static getTranscriptDiv(): HTMLDivElement {
    return document.querySelector("#transcript") as HTMLDivElement;
  }

  static getMainCanvas(): HTMLCanvasElement {
    return document.querySelector("#draw") as HTMLCanvasElement;
  }

  static getPreviewCanvas(): HTMLCanvasElement {
    return document.querySelector("#preview") as HTMLCanvasElement;
  }

  static getMainDiv(): HTMLDivElement {
    return document.querySelector("#main") as HTMLDivElement;
  }

  static getWaveformDiv(): HTMLDivElement {
    return document.querySelector("#waveform");
  }

  static getEditorDiv(): HTMLDivElement {
    return document.querySelector("#editor");
  }

  static getEditForm(): HTMLFormElement {
    return document.forms.namedItem("edit");
  }

  static getLoadForm(): HTMLFormElement {
    return document.forms.namedItem("load");
  }

  static getAvailableMaxWidthForMainDiv(): number {
    return (
      (this.getDocumentWidth() -
        this.getMainDivMarginLeft() -
        this.getEditorDivWidthInPx()) *
      0.95
    );
  }

  static getAvailableMaxHeightForMainDiv(): number {
    return this.getDocumentHeight() - 60;
  }

  static getEditorDivWidthInPx(): number {
    const editorDivWidth = this.getEditorDiv()
      .style.width.replace("%", "")
      .replace("px", "");
    if (editorDivWidth == "0" || editorDivWidth == "") {
      return 0;
    }
    return (this.getDocumentWidth() * parseInt(editorDivWidth)) / 100 + 20;
  }

  static getMainDivMarginLeft(): number {
    return Number(this.getMainDiv().style.marginLeft.replace("px", ""));
  }

  static setHTMLInputElementValue(
    elementName: string,
    value: string | number
  ): void {
    (document.getElementById(elementName) as HTMLInputElement).value =
      "" + value;
  }

  static getPlayPauseButton(): HTMLButtonElement {
    return document.querySelector("[data-action='play']") as HTMLButtonElement;
  }

  static getTranscriptButton(): HTMLInputElement {
    return document.querySelector("#transcript_button");
  }

  static getCCButton(): HTMLInputElement {
    return document.querySelector("#cc");
  }

  static getWaveformZoomSlider(): HTMLInputElement {
    return document.querySelector("[data-action='zoom']");
  }

  static getExportActionsToJsonButton(): HTMLButtonElement {
    return document.querySelector(
      "[data-action='export']"
    ) as HTMLButtonElement;
  }

  static getExportToVideoButton(): HTMLButtonElement {
    return document.querySelector(
      "[data-action='export-video']"
    ) as HTMLButtonElement;
  }

  static getToggleEditorButton(): HTMLButtonElement {
    return document.getElementById("toggle_editor_button") as HTMLButtonElement;
  }

  static openEditor(): void {
    this.getToggleEditorButton().textContent = "🖉 Close Editor";
    DOMUtils.getEditorDiv().style.width = "40%";
    DOMUtils.getEditorDiv().style.borderLeft = "1px solid black";
    DOMUtils.getEditorDiv().style.paddingLeft = "10px";
    DOMUtils.getEditorDiv().style.paddingRight = "10px";
  }

  static closeEditor(): void {
    this.getToggleEditorButton().textContent = "🖉 Open Editor";
    DOMUtils.getEditorDiv().style.width = "0";
    DOMUtils.getEditorDiv().style.borderLeft = "";
    DOMUtils.getEditorDiv().style.paddingLeft = "0";
    DOMUtils.getEditorDiv().style.paddingRight = "0";
  }

  static removeLoadModalDialog(): void {
    document.getElementById("load_modal_dialog").remove();
  }
}

export { DOMUtils };
