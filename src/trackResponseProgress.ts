export function trackResponseProgress(
  response: Response,
  onProgress: (arg0: ProgressEvent) => void
) {
  if (!onProgress) {
    return response;
  }

  const isSupported =
    typeof Response !== "undefined" && typeof ReadableStream !== "undefined";
  if (!response.body || !isSupported) {
    // TODO: Report empty progress
    return response;
  }

  const reader = response.body.getReader();

  let loaded = 0;
  // TODO: Check reporting for compressed body
  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : undefined;
  const stream = new ReadableStream({
    start(controller) {
      (async function read() {
        const { done, value } = await reader.read();
        if (done) {
          // TODO: Report 100% progress
          controller.close();
          return;
        }
        if (value) {
          loaded += value.length;

          const progress = new ProgressEvent("progress", {
            lengthComputable: true,
            loaded,
            total
          });
          onProgress(progress);
        }
        controller.enqueue(value);
        read();
      })();
    }
  });

  return new Response(stream, response);
}
