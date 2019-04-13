/**
 * A simple logger implementation.
 * @public
 */
export class Logger {

  // tslint:disable-next-line: no-console
  constructor(private readonly _log: (message: any) => void = console.log) { }

  /**
   * Log message to the console.
   * @param message - Message to write.
   */
  log<T>(message: T) {
    this._log(message);
  }
}
