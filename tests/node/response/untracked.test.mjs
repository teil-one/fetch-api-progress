import { describe, test, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { trackResponseProgress } from "../../../dist/index.js";

describe("trackResponseProgress return untracked response", () => {
  describe("Without progress callback", () => {
    test("Returns original response", async () => {
      const response = await fetch("http://localhost:3000/tests/node/leo.txt");
      assert.strictEqual(trackResponseProgress(response), response);
    });
  });

  describe("With progress callback", () => {
    let progressCallback;

    beforeEach(() => {
      progressCallback = mock.fn();
    });

    describe("Without response body", () => {
      let response;

      beforeEach(async () => {
        response = await fetch("http://localhost:3000/no-content");
      });

      test("Returns original response", async () => {
        assert.strictEqual(
          trackResponseProgress(response, progressCallback),
          response
        );
      });

      test("Does not report progress", () => {
        assert.strictEqual(progressCallback.mock.calls.length, 0);
      });
    });
  });
});
