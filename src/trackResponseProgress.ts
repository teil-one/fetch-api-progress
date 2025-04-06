import { FetchProgressEvent } from "./FetchProgressEvent";

/**
 * Function that tracks the body download progress of a fetch response.  It takes a `Response` object and a callback 
 * function as arguments.  The callback function is called with a `FetchProgressEvent` object whenever the progress 
 * changes.
 *
 * @param {Response} response - The fetch response to track.
 * @param {(arg0: FetchProgressEvent) => void} onProgress - The callback function to call with the progress event.
 * @returns {Response} - A new response object that uses a readable stream, or the original response object if readable 
 * streams are not supported, or the response carries no body.
 */
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
        new FetchProgressEvent({
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
            new FetchProgressEvent({
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
            new FetchProgressEvent({
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
