import { createProgressEvent, type FetchProgressEvent } from "./createProgressEvent";

export function trackResponseProgress(
  response: Response,
  onProgress: (arg0: FetchProgressEvent) => void
) {
  if (!onProgress) {
    return response;
  }

  const isSupported =
    typeof Response !== "undefined" && typeof ReadableStream !== "undefined";
  if (!response.body || !isSupported) {
    return response;
  }

  const reader = response.body.getReader();

  let loaded = 0;
  const contentLength = response.headers.get("content-length");
  const contentEncoding = response.headers.get("content-encoding");
  const contentCompressed =
    contentEncoding && !/^identity$/i.test(contentEncoding);
  const total =
    contentLength && !contentCompressed
      ? parseInt(contentLength, 10)
      : undefined;

  const stream = new ReadableStream({
    start(controller) {
      // Report 0 progress
      onProgress(
        createProgressEvent({
          lengthComputable: typeof total !== "undefined",
          loaded,
          total
        })
      );

      (async function read() {
        const { done, value } = await reader.read();
        if (done) {
          // Report 100% progress
          onProgress(
            createProgressEvent({
              lengthComputable: typeof total !== "undefined",
              loaded,
              total
            })
          );

          controller.close();
          return;
        }

        if (value) {
          loaded += value.length;

          onProgress(
            createProgressEvent({
              lengthComputable: typeof total !== "undefined",
              loaded,
              total
            })
          );
        }

        controller.enqueue(value);
        read();
      })();
    }
  });

  return new Response(stream, response);
}
