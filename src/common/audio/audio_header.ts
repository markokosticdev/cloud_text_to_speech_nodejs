export class AudioHandler {
  private constructor() {}

  static async handleAsync<T>(
    ssmlBatches: string[],
    processBatch: (ssml: string) => Promise<T>,
    processLimit: number,
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    let nextIndex = 0;

    const handleRequest = async (index: number): Promise<void> => {
      try {
        results[index] = await processBatch(ssmlBatches[index]);
      } catch (e) {
        throw new Error(
          `Error processing batch at index ${index}: ${e.message}`,
        );
      }
    };

    while (nextIndex < ssmlBatches.length) {
      if (executing.length < processLimit) {
        const currentIndex = nextIndex++;
        const requestPromise = handleRequest(currentIndex).then(() => {
          executing.splice(executing.indexOf(requestPromise), 1);
        });
        executing.push(requestPromise);
      } else {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }

  static async handleSync<T>(
    ssmlBatches: string[],
    processBatch: (ssml: string) => Promise<T>,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let index = 0; index < ssmlBatches.length; index++) {
      try {
        results[index] = await processBatch(ssmlBatches[index]);
      } catch (e) {
        throw new Error(
          `Error processing batch at index ${index}: ${e.message}`,
        );
      }
    }

    return results;
  }
}
