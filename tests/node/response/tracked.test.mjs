import { describe, test, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { trackResponseProgress } from "../../../dist/index.js";

describe("trackResponseProgress track progress", () => {
  describe("When response has Content-Length", () => {
    let progressCallback;
    let response;
    let expectedSize;

    beforeEach(async () => {
      progressCallback = mock.fn();
      response = trackResponseProgress(
        await fetch("http://localhost:3000/tests/node/leo.txt"),
        progressCallback
      );

      const reader = response.body.getReader();
      expectedSize = 0;
      for await (const chunk of readChunks(reader)) {
        expectedSize += chunk.length;
      }
    });

    test("Reports progress", () => {
      assert.strictEqual(progressCallback.mock.calls.length >= 1, true);
    });

    test("Reports correct vales", () => {
      for (const call of progressCallback.mock.calls) {
        const progress = call.arguments[0];
        assert.strictEqual(progress.total, expectedSize);
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

  describe("When response has no Content-Length", () => {
    let progressCallback;
    let response;

    beforeEach(async () => {
      progressCallback = mock.fn();
      response = trackResponseProgress(
        await fetch("http://localhost:3000/no-content-length"),
        progressCallback
      );

      const reader = response.body.getReader();
      for await (const chunk of readChunks(reader)) {
        chunk.length;
      }
    });

    test("Reports correct vales", () => {
      for (const call of progressCallback.mock.calls) {
        const progress = call.arguments[0];
        assert.strictEqual(progress.total, undefined);
        assert.strictEqual(progress.loaded >= 0, true);
        assert.strictEqual(progress.lengthComputable, false);
      }
    });
  });

  describe("When response has ZIP Content-Encoding", () => {
    let progressCallback;
    let response;

    beforeEach(async () => {
      progressCallback = mock.fn();
      response = trackResponseProgress(
        await fetch("http://localhost:3000/leo-gzip"),
        progressCallback
      );

      const reader = response.body.getReader();
      for await (const chunk of readChunks(reader)) {
        chunk.length;
      }
    });

    test("Reports correct vales", () => {
      for (const call of progressCallback.mock.calls) {
        const progress = call.arguments[0];
        assert.strictEqual(progress.total, undefined);
        assert.strictEqual(progress.loaded >= 0, true);
        assert.strictEqual(progress.lengthComputable, false);
      }
    });
  });
});

function readChunks(reader) {
  return {
    async *[Symbol.asyncIterator]() {
      let readResult = await reader.read();
      while (!readResult.done) {
        yield readResult.value;
        readResult = await reader.read();
      }
    }
  };
}
