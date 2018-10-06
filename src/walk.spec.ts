import { expect } from 'chai';
import { join } from 'path';

import { walk } from './walk';

describe('walk', () => {
  const root = join(__dirname, '..', 'testing', 'walk');

  it('should return sub/t1.js, t1.js, t2.js for .js$', () => {
    const expected = [join('sub', 't1.js'), 't1.js', 't2.js']
      .map(f => join(root, f));
    const result = walk(root, /.js$/);
    expect(result).eql(expected);
  });

  it('should return sub/t1.html, sub/t2.html, t1.html for .html$', () => {
    const expected = [join('sub', 't1.html'), join('sub', 't2.html'), 't1.html']
      .map(f => join(root, f));
    const result = walk(root, /.html$/);
    expect(result).eql(expected);
  });

  it('should return empty array for .svg$', () => {
    const result = walk(root, /.svg$/);
    expect(result).eql([]);
  });

  it('should throw on non-existing directory', () => {
    expect(() => walk(join(root, 'missing'), /.js$/)).to.throw();
  });
});