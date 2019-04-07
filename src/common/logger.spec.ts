import { Logger } from './logger';

describe('cli detector', () => {
  it('should log', () => {
    let message = '';
    const expected = 'expected';
    new Logger(m => message = m).log(expected);
    expect(message).toBe(expected);
  });

  it('should log to console.log', () => {
    const spy = jest.spyOn(console, 'log');
    new Logger().log('');
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
