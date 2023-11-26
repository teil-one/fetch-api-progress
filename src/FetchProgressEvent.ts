export class FetchProgressEvent {
  readonly lengthComputable: boolean;
  readonly loaded: number;
  readonly total: number;

  constructor(options: {
    lengthComputable: boolean;
    loaded: number;
    total: number;
  }) {
    this.lengthComputable = options.lengthComputable;
    this.loaded = options.loaded;
    this.total = options.total;
  }
}
