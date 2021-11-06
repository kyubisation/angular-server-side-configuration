describe('ng-env', () => {
  it('should read NG_ENV', async () => {
    expect(typeof window).toBe('undefined');
    const ngEnv = { test: 'expected' };
    (global as any).window = { NG_ENV: ngEnv };
    const { NG_ENV } = await import('./public_api');
    expect(NG_ENV).toEqual(ngEnv);
    delete (global as any).window;
  });
});
