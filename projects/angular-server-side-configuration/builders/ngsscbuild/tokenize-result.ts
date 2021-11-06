/**
 * The result class for VariableTokenizer.
 * @public
 */
export class TokenizeResult {
  constructor(
    readonly content: string,
    private readonly _variables: { token: string; expression: string }[]
  ) {}

  untokenize(fileContent: string) {
    if (!this._variables.some((v) => fileContent.includes(v.token))) {
      return fileContent;
    }

    return this._variables.reduce(
      (current, next) =>
        current
          .replace(new RegExp(`"${next.token}"`, 'g'), next.expression)
          .replace(new RegExp(`"${next.token}`, 'g'), `(${next.expression}) + "`)
          .replace(new RegExp(`${next.token}"`, 'g'), `" + (${next.expression})`)
          .replace(new RegExp(`${next.token}`, 'g'), `" + (${next.expression}) + "`),
      fileContent
    );
  }
}
