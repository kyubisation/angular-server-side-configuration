import { expect } from 'chai';

import { cli } from './cli';

describe('cli', () => {
  it('should fail due to no input', () => {
    expect(() => cli().parse([])).to.throw();
  });

  it('should execute the insert command', () => {
    cli().parse(`node program insert --dry --env=TEST`.split(' '));
  });
});