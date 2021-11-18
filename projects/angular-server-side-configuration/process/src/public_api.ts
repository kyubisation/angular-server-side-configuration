(function (self: any) {
  if (self) {
    self.process = self.process || {};
    self.process.env = self.process.env || {};
  }
})(typeof window === 'object' ? window : undefined);

declare global {
  var process: NodeJS.Process;
}

export {};
