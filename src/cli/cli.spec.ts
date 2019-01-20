import { cli } from './cli';

describe('cli', () => {
  it('should fail due to no input', () => {
    expect(() => cli().parse([])).toThrow();
  });

  it('should execute the insert command', () => {
    cli().parse(`node program insert --dry --env=TEST`.split(' '));
  });

  it('should execute the init command', () => {
    cli().parse(`node program init`.split(' '));
  });

  it('should execute the wrap-aot command', () => {
    cli().parse(`node program wrap-aot`.split(' '));
  });
});
