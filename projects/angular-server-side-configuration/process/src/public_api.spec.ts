describe('process', () => {
  it('should add process.env to window', async () => {
    expect(typeof window).toBe('undefined');
    (global as any).window = {};
    await import('./public_api');
    expect(global.window).toHaveProperty('process');
    expect(global.window.process).toHaveProperty('env');
    delete (global as any).window;
  });
});
