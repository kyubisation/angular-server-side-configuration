export const process = (function (self: any) {
  self = self || {};
  self.process = self.process || {};
  self.process.env = self.process.env || {};
  return self.process;
})(globalThis);

declare global {
  var process: NodeJS.Process;
}
