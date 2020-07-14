class EditForm {
  editForm: HTMLFormElement;

  constructor(editForm: HTMLFormElement) {
    this.editForm = editForm;
  }

  setOnSubmit(submit: (ev: Event) => void) {
    this.editForm.onsubmit = submit;
  }

  setOnReset(reset: (ev: Event) => void) {
    this.editForm.onreset = reset;
  }

  getFormInputElement(name: string): HTMLInputElement {
    return this.editForm.elements.namedItem(name) as HTMLInputElement;
  }

  getActions(): RadioNodeList {
    return this.editForm.elements.namedItem("action_type") as RadioNodeList;
  }

  getRegionStartInput(): HTMLInputElement {
    return this.getFormInputElement("start");
  }

  getRegionEndInput(): HTMLInputElement {
    return this.getFormInputElement("end");
  }

  getRegionNoteInput(): HTMLInputElement {
    return this.getFormInputElement("note");
  }

  getFormSelectElement(name: string): HTMLSelectElement {
    return this.editForm.elements.namedItem(name) as HTMLSelectElement;
  }

  getFormButtonElement(name: string): HTMLButtonElement {
    return this.editForm.elements.namedItem(name) as HTMLButtonElement;
  }

  getAllDivs(): NodeListOf<HTMLDivElement> {
    return this.editForm.querySelectorAll("div");
  }

  getDeleteRegionButton(): HTMLButtonElement {
    return this.editForm.elements.namedItem(
      "delete_region"
    ) as HTMLButtonElement;
  }

  displayAndReturnActionDiv(actionType: string): HTMLDivElement {
    const prefix = "action_";
    const expectedDivName = prefix + actionType;
    let actionDiv: HTMLDivElement;

    this.getAllDivs().forEach(function (div) {
      if (div.attributes["name"] != null) {
        const divName = div.attributes["name"].value;

        if (expectedDivName == divName) {
          div.style.opacity = "1";
          div.style.display = "block";
          actionDiv = div;
        } else {
          div.style.opacity = "0";
          div.style.display = "none";
        }
      }
    });

    return actionDiv;
  }

  show(): void {
    this.editForm.style.height = "55%";
  }

  hide(): void {
    this.editForm.style.height = "0";
  }

  reset() {
    this.editForm.reset();
  }
}

export { EditForm };
