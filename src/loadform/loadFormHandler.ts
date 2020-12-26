import { LoadHandler } from "./loadHandler";
import { LoadForm } from "./loadForm";
import { LoadInput } from "./loadInput";
import { LoadingError } from "./loadingError";
import { FileUtils } from "../utils/fileUtils";

class LoadFormHandler implements LoadHandler {
  loadForm: LoadForm;

  constructor(loadForm: LoadForm) {
    this.loadForm = loadForm;
  }

  async load(): Promise<LoadInput> {
    const imageInput = this.loadForm.getImageInput();
    const audioInput = this.loadForm.getAudioInput();
    const actionsInput = this.loadForm.getActionsInput();

    const imageLoadPromise: Promise<string> = new Promise((resolve) => {
      if (imageInput.files.length == 1) {
        const fReader = new FileReader();
        fReader.readAsDataURL(imageInput.files[0]);
        fReader.onloadend = () => resolve(fReader.result as string);
      } else {
        throw new LoadingError("No image selected");
      }
    });

    const audioLoadPromise: Promise<Blob> = new Promise((resolve) => {
      if (audioInput.files.length == 1) {
        const fReader = new FileReader();
        fReader.readAsArrayBuffer(audioInput.files[0]);
        fReader.onloadend = () => {
          resolve(new Blob([new Uint8Array(fReader.result as ArrayBuffer)]));
        };
      } else {
        throw new LoadingError("No audio selected");
      }
    });

    const actionsPromise: Promise<string> = new Promise((resolve) => {
      if (actionsInput.files.length == 1) {
        const fReader = new FileReader();
        fReader.readAsDataURL(actionsInput.files[0]);
        fReader.onloadend = () => {
          FileUtils.localFileContentsToString("./assets/actions_json_schema.json").then(schema => {
            const data = JSON.parse(
              decodeURIComponent(
                escape(atob((fReader.result as string).split(",")[1]))
              )
            );
            // @ts-ignore
            const ajv = new Ajv();
            const jsonSchema = JSON.parse(schema);
            const validJson = ajv
              .addSchema(jsonSchema, "schema")
              .validate("schema", data);
            if (!validJson) {
              throw new LoadingError("Invalid JSON : " + JSON.stringify(ajv.errors, null, 2));
            }
            resolve(data);
          })
        };
      } else {
        resolve(JSON.parse("[]"));
      }
    });

    return new LoadInput(
      await imageLoadPromise,
      await audioLoadPromise,
      await actionsPromise
    );
  }
}

export { LoadFormHandler };