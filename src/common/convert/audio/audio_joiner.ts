export class AudioJoiner {
  private constructor() {}

  static join(audios: Uint8Array[]): Uint8Array {
    const totalLength = audios.reduce((sum, array) => sum + array.length, 0);

    const result = new Uint8Array(totalLength);

    let offset = 0;
    audios.forEach((array) => {
      result.set(array, offset);
      offset += array.length;
    });

    return result;
  }
}
