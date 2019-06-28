import { TokenizeResult } from './tokenize-result';

describe('TokenizeResult', () => {
  it('should untokenize content', () => {
    const variables = [1, 2, 3, 4].map(v => ({ expression: `process.env.TEST${v}`, token: `ngssc-token-${v}` }));
    const result = new TokenizeResult('', variables);
    const content = result.untokenize(`
      return {
        v1: "ngssc-token-1",
        v2: "valuengssc-token-2",
        v3: "ngssc-token-3value",
        v4: "valuengssc-token-4value",
      };
    `);
    const expected = `
      return {
        v1: process.env.TEST1,
        v2: "value" + (process.env.TEST2),
        v3: (process.env.TEST3) + "value",
        v4: "value" + (process.env.TEST4) + "value",
      };
    `;
    expect(content).toEqual(expected);
  });

  it('should return content without tokens unchanged', () => {
    const result = new TokenizeResult('', []);
    expect(result.untokenize('value')).toEqual('value');
  });
});
