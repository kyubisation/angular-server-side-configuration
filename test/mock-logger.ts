import { Logger } from '../src';

export class MockLogger extends Logger {
  constructor() {
    // tslint:disable-next-line: no-empty
    super(() => { });
  }
}
