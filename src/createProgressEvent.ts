export type FetchProgressEvent = {
  /**
   * The number of bytes that have been loaded so far.
   */
  readonly loaded: number;
  /**
   * The chunk of data read in the iteration.
   * 
   * It won't be available when the initial progress report is sent (0% progress), and when progress completion is 
   * reported (100% progress).
   */
  chunk?: Uint8Array<ArrayBufferLike>;
} & (
  {
      /**
       * A Boolean value indicating whether the total size of the data being transferred is known.
       */
      readonly lengthComputable: false;
    }
  | {
      /**
       * A Boolean value indicating whether the total size of the data being transferred is known.
       */
      readonly lengthComputable: true;
      /**
       * The total number of bytes to be loaded. This value is only available if lengthComputable is true.
       */
      readonly total: number;
    }
);

/**
 * Creates a fetch progress event object that describes the current progress (upload or download) of a fetch request.
 * @param options The progress event data.
 * @returns An object that contains the progress event data.
 */
export function createProgressEvent(options: {
  lengthComputable: boolean;
  loaded: number;
  chunk?: Uint8Array<ArrayBufferLike>;
  total?: number;
}): FetchProgressEvent {
  if (options.lengthComputable) {
    return {
      get lengthComputable() {
        return true as const;
      },
      get loaded() {
        return options.loaded;
      },
      get chunk() {
        return options.chunk;
      },
      get total() {
        return options.total!;
      }
    };
  }
  return {
    get lengthComputable() {
      return false as const;
    },
    get chunk() {
      return options.chunk;
    },
    get loaded() {
      return options.loaded;
    }
  };
}
