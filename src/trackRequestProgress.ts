export function trackRequestProgress(
  request: RequestInit,
  onProgress: (arg0: ProgressEvent) => void
) {
  if (!onProgress) {
    return request;
  }

  const supportsRequestStreams = (() => {
    let duplexAccessed = false;

    const hasContentType = new Request("", {
      body: new ReadableStream(),
      method: "POST",
      // @ts-expect-error duplex is not supported in type definitions yet
      get duplex() {
        duplexAccessed = true;
        // https://developer.chrome.com/articles/fetch-streaming-requests/#half-duplex
        return "half";
      }
    }).headers.has("Content-Type");

    return duplexAccessed && !hasContentType;
  })();

  if (!request.body || !supportsRequestStreams) {
    // TODO: Report empty progress
    return request;
  }

  // TODO: Handle all body types
  const blob = request.body as unknown as Blob;
  // TODO: Handle all body types
  const total = blob.size;

  let loaded = 0;

  const progressTrackingStream = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);
      loaded += chunk.byteLength;
      // https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent/ProgressEvent
      const progress = new ProgressEvent("progress", {
        lengthComputable: supportsRequestStreams,
        loaded,
        total
      });
      onProgress(progress);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flush(controller) {
      // TODO: Report 100% progress
    }
  });

  const newRequest: RequestInit = {
    ...request,
    body: blob.stream().pipeThrough(progressTrackingStream),
    // @ts-expect-error duplex is not supported in type definitions yet
    duplex: "half"
  };

  return newRequest;
}
