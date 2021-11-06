(function (self: any) {
  if (self) {
    self.process = self.process || {};
    self.process.env = self.process.env || {};
  }
})(typeof window === 'object' ? window : undefined);

declare namespace NodeJS {
  interface NodeProcess {
    env?: any;
  }
  interface Process extends NodeProcess {}
}

declare var process: NodeJS.Process;

export {};
