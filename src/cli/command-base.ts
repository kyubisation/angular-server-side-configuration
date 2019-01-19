export abstract class CommandBase {
  constructor(private _name: string) {
  }

  async execute() {
    const message = `ngssc: ${this._name}`;
    this._log(`${message}\n${'-'.repeat(message.length)}`);
    await this._execute();
  }

  protected abstract _execute(): Promise<void>;

  protected _logValue(message: string, value: any) {
    this._log(message);
    this._log(value);
    this._log('\n');
  }

  protected _log(message: string) {
    // tslint:disable-next-line
    console.log(message);
  }
}
