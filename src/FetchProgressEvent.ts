/**
 * FetchProgressEvent is a class that represents the progress of a fetch request or response.
 */
export class FetchProgressEvent {
  /**
   * A Boolean value indicating whether the total size of the data being transferred is known.
   */
  readonly lengthComputable: boolean;
  /**
   * The number of bytes that have been loaded so far.
   */
  readonly loaded: number;
  /**
   * The total number of bytes to be loaded. This value is only available if lengthComputable is true.
   */
  readonly total?: number;

  constructor(options: {
    lengthComputable: boolean;
    loaded: number;
    total?: number;
  }) {
    this.lengthComputable = options.lengthComputable;
    this.loaded = options.loaded;
    this.total = options.total;
  }
}
