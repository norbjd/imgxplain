import { LoadHandler } from "./loadHandler";
import { FileUtils } from "../utils/fileUtils";
import { LoadInput } from "./loadInput";

class LoadExampleHandler implements LoadHandler {
  localRelativePathToImage: string;
  localRelativePathToAudio: string;
  localRelativePathToActions: string;

  constructor(exampleName: string) {
    switch (exampleName) {
      case "🇫🇷":
        this.localRelativePathToImage =
          "./examples/language_learning/krashen_spock.png";
        this.localRelativePathToAudio =
          "./examples/language_learning/fr/krashen_spock.wav";
        this.localRelativePathToActions =
          "./examples/language_learning/fr/krashen_spock.json";
        break;
      case "🇩🇪":
        this.localRelativePathToImage =
          "./examples/language_learning/krashen_spock.png";
        this.localRelativePathToAudio =
          "./examples/language_learning/de/krashen_spock.wav";
        this.localRelativePathToActions =
          "./examples/language_learning/de/krashen_spock.json";
        break;
      case "👨‍💻":
        this.localRelativePathToImage =
          "./examples/it_architecture/data_lake_on_gcp.png";
        this.localRelativePathToAudio =
          "./examples/it_architecture/data_lake_on_gcp.wav";
        this.localRelativePathToActions =
          "./examples/it_architecture/data_lake_on_gcp.json";
        break;
      default:
        throw new Error("Unknown example");
    }
  }

  async load(): Promise<LoadInput> {
    const imageDataBase64 = await FileUtils.localFileContentsToBase64String(
      this.localRelativePathToImage
    );
    const audioBlob = await FileUtils.localFileContentsToBlob(
      this.localRelativePathToAudio
    );
    const jsonActions = await FileUtils.localFileContentsToString(
      this.localRelativePathToActions
    );

    const imageNameSplit = this.localRelativePathToImage.split(".");
    const imageExtension = imageNameSplit[imageNameSplit.length - 1];

    return new LoadInput(
      "data:image/" + imageExtension + ";base64," + imageDataBase64,
      audioBlob,
      JSON.parse(jsonActions)
    );
  }
}

export { LoadExampleHandler };
