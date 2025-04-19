import fs from "fs";
import { describe, test, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { trackRequestProgress } from "../../../dist/index.js";

const blob = new Blob([new Uint8Array(8 * 1024)]);
const fsBlob = await fs.openAsBlob("tests/node/leo.txt");
const file = new File([blob, blob, fsBlob], "foo.txt");

const body = file;

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
      body: body
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
        assert.strictEqual(progress.total, body.size);
        assert.strictEqual(progress.loaded <= progress.total, true);
        assert.strictEqual(progress.lengthComputable, true);
        if (progress.loaded > 0 && progress.loaded < progress.total) {
          assert.notStrictEqual(progress.chunk, undefined);
        }
      }
    });

    test("Reports 0 progress at the start", () => {
      const progress = progressCallback.mock.calls[0].arguments[0];
      assert.strictEqual(progress.loaded === 0, true);
      assert.strictEqual(progress.chunk, undefined);
    });

    test("Reports 100% progress at the end", () => {
      const progress =
        progressCallback.mock.calls[progressCallback.mock.calls.length - 1]
          .arguments[0];
      assert.strictEqual(progress.loaded === progress.total, true);
      assert.strictEqual(progress.chunk, undefined);
    });
  });
});
