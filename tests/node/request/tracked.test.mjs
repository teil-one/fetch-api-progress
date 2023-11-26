import { describe, test, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { trackRequestProgress } from "../../../dist/index.js";

// TODO: Handle all body types
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#body
// + ReadableStream
// + fs.createReadStream('foo.txt')
// Also see https://www.loginradius.com/blog/engineering/guest-post/http-streaming-with-nodejs-and-fetch-api/
const blob = new Blob([new Uint8Array(8 * 1024)]);

describe("trackRequestProgress track progress", () => {
  let sourceRequest;
  let request;
  let progressCallback;

  beforeEach(() => {
    sourceRequest = {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream"
      },
      body: blob
    };

    progressCallback = mock.fn((progress) => {
      console.log("Progress:", progress.loaded);
    });

    request = trackRequestProgress(sourceRequest, progressCallback);
  });

  test("Returns modified request", () => {
    assert.notStrictEqual(request, sourceRequest);
  });

  describe("When fetched", () => {
    beforeEach(async () => {
      await fetch("http://localhost:3000", request);
    });

    test("Calls callback", () => {
      assert.strictEqual(progressCallback.mock.calls.length >= 1, true);
    });

    test("Reports correct vales", () => {
      for (const call of progressCallback.mock.calls) {
        const progress = call.arguments[0];
        assert.strictEqual(progress.total, blob.size);
        assert.strictEqual(progress.loaded <= progress.total, true);
        assert.strictEqual(progress.lengthComputable, true);
      }
    });

    test("Reports 100% progress at the end", () => {
      const progress =
        progressCallback.mock.calls[progressCallback.mock.calls.length - 1]
          .arguments[0];
      assert.strictEqual(progress.loaded === progress.total, true);
    });
  });
});
