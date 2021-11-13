describe('ng-env', () => {
  it('should read NG_ENV', async () => {
    const ngEnv = { test: 'expected' };
    (window as any).NG_ENV = ngEnv;
    const { NG_ENV } = await import('./public_api');
    expect(NG_ENV).toEqual(ngEnv);
    delete (window as any).NG_ENV;
  });
});
