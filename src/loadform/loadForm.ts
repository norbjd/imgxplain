class LoadForm {
  loadForm: HTMLFormElement;

  constructor(loadForm: HTMLFormElement) {
    this.loadForm = loadForm;
  }

  getExamplesSpans(): HTMLCollectionOf<HTMLSpanElement> {
    return (document.querySelector("#examples") as HTMLDivElement).getElementsByTagName("span");
  }

  getOkButton(): HTMLButtonElement {
    return this.loadForm.elements.namedItem("load_ok") as HTMLButtonElement;
  }

  getImageInput(): HTMLInputElement {
    return this.loadForm.elements.namedItem("image") as HTMLInputElement;
  }

  getAudioInput(): HTMLInputElement {
    return this.loadForm.elements.namedItem("audio") as HTMLInputElement;
  }

  getActionsInput(): HTMLInputElement {
    return this.loadForm.elements.namedItem("actions") as HTMLInputElement;
  }

  displayLoadErrorMessage(errorMessage: string): void {
    (document.getElementById(
      "loading_text"
    ) as HTMLParagraphElement).innerHTML = errorMessage;
  }
}

export { LoadForm };
