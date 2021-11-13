describe('process', () => {
  it('should add process.env to window', async () => {
    delete (window as any).process;
    expect('process' in window).toBeFalsy();
    await import('./public_api');
    expect(window).toHaveProperty('process');
    expect(window.process).toHaveProperty('env');
  });
});
