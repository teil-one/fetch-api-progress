import { describe, test, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { trackRequestProgress } from "../../../dist/index.js";

const blob = new Blob([new Uint8Array(8 * 1024)]);

describe("trackRequestProgress return untracked request", () => {
  describe("Without progress callback", () => {
    const sourceRequest = {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream"
      },
      body: blob
    };
    let request;
    beforeEach(() => {
      request = trackRequestProgress(sourceRequest);
    });

    test("Returns original request", () => {
      assert.strictEqual(request, sourceRequest);
    });
  });

  describe("With progress callback", () => {
    let progressCallback;

    beforeEach(() => {
      progressCallback = mock.fn();
    });

    describe("Without request body", () => {
      const sourceRequest = {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream"
        }
      };
      let request;

      beforeEach(() => {
        request = trackRequestProgress(sourceRequest, progressCallback);
      });

      test("Returns original request", () => {
        assert.strictEqual(request, sourceRequest);
      });

      describe("When fetched", () => {
        beforeEach(async () => {
          await fetch("http://localhost:3000", request);
        });

        test("Does not report progress", () => {
          assert.strictEqual(progressCallback.mock.calls.length, 0);
        });
      });
    });

    describe("With GET", () => {
      let request;
      let sourceRequest = {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: blob
      };

      beforeEach(() => {
        request = trackRequestProgress(sourceRequest, progressCallback);
      });

      test("Returns original request", () => {
        assert.strictEqual(request, sourceRequest);
      });
    });

    describe("With HEAD", () => {
      let request;
      let sourceRequest = {
        method: "head",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: blob
      };

      beforeEach(() => {
        request = trackRequestProgress(sourceRequest, progressCallback);
      });

      test("Returns original request", () => {
        assert.strictEqual(request, sourceRequest);
      });
    });

    describe("With FormData", () => {
      let sourceRequest = {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        body: new FormData()
      };

      test("Throws an error", () => {
        assert.throws(
          () => trackRequestProgress(sourceRequest, progressCallback),
          new Error(
            "Request progress tracking is supported only for Blob and File"
          )
        );
      });
    });
  });
});
