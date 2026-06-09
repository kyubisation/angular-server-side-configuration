describe('ng-env', () => {
  it('should read NG_ENV', async () => {
    const ngEnv = { test: 'expected' };
    (globalThis as unknown as { NG_ENV?: typeof ngEnv }).NG_ENV = ngEnv;
    const { NG_ENV } = await import('./public_api');
    expect(NG_ENV).toEqual(ngEnv);
    delete (globalThis as unknown as { NG_ENV?: typeof ngEnv }).NG_ENV;
  });
});
