class LoadInput {
  imageData: string;
  audioBlob: Blob;
  jsonActions: string;

  constructor(imageData: string, audioBlob: Blob, jsonActions: string) {
    this.imageData = imageData;
    this.audioBlob = audioBlob;
    this.jsonActions = jsonActions;
  }
}

export { LoadInput };
