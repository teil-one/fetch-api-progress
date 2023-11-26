import { FetchProgressEvent } from "./FetchProgressEvent";

export function trackRequestProgress(
  request: RequestInit,
  onProgress: (arg0: FetchProgressEvent) => void
) {
  if (!onProgress) {
    return request;
  }

  const supportsRequestStreams = (() => {
    let duplexAccessed = false;

    const hasContentType = new Request("https://teil.one", {
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

  if (
    !request.body ||
    !supportsRequestStreams ||
    /^get$/i.test(request.method ?? "") ||
    /^head$/i.test(request.method ?? "")
  ) {
    // GET and HEAD requests cannot have body
    return request;
  }

  // TODO: Handle all body types
  const blob = request.body as unknown as Blob;
  // TODO: Handle all body types
  const total = blob.size;

  let loaded = 0;

  const progressTrackingStream = new TransformStream({
    start() {
      // Report 0 progress
      const progress = new FetchProgressEvent({
        lengthComputable: supportsRequestStreams,
        loaded: 0,
        total
      });
      onProgress(progress);
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
      loaded += chunk.byteLength;

      const progress = new FetchProgressEvent({
        lengthComputable: supportsRequestStreams,
        loaded,
        total
      });
      onProgress(progress);
    },
    flush() {
      // Report 100% progress
      const progress = new FetchProgressEvent({
        lengthComputable: supportsRequestStreams,
        loaded: total,
        total
      });
      onProgress(progress);
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
