class FileUtils {
  static async localFileContentsToBase64String(
    fileName: string
  ): Promise<string> {
    return fetch(fileName)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        // https://stackoverflow.com/a/12713326
        function Uint8ToString(u8a: Uint8Array) {
          const CHUNK_SZ = 0x8000;
          const c = [];
          for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
            c.push(
              String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ))
            );
          }
          return c.join("");
        }

        return btoa(Uint8ToString(new Uint8Array(arrayBuffer)));
      });
  }

  static async localFileContentsToString(fileName: string): Promise<string> {
    return fetch(fileName).then((response) => response.text());
  }

  static async localFileContentsToBlob(fileName: string): Promise<Blob> {
    return fetch(fileName).then((response) => response.blob());
  }

  static saveBlobToFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

export { FileUtils };
