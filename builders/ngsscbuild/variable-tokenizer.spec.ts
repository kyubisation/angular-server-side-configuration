import { envContent, envContentNgEnv } from '../../test/temporary-fs';

import { VariableDetector } from './variable-detector';
import { VariableTokenizer } from './variable-tokenizer';

describe('VariableTokenizer', () => {
  const detector = new VariableDetector();

  it('should tokenize process variables', () => {
    const tokenizer = new VariableTokenizer();
    const context = detector.detect(envContent);
    const result = tokenizer.tokenize(envContent, context);
    expect(result.content.match(/process\.env\./g)!.length).toBe(7);
    expect(result.content.match(/ngssc-token-/g)!.length).toBe(6);
  });

  it('should tokenize NG_ENV variables', () => {
    const tokenizer = new VariableTokenizer();
    const context = detector.detect(envContentNgEnv);
    const result = tokenizer.tokenize(envContentNgEnv, context);
    expect(result.content).toContain(`import 'angular-server-side-configuration/ng-env';`);
    expect(result.content.match(/NG_ENV/g)!.length).toBe(7);
    expect(result.content.match(/ngssc-token-/g)!.length).toBe(6);
  });
});
