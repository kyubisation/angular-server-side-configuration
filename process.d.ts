declare namespace NodeJS {
  interface NodeProcess {
      env?: any;
  }
  interface Process extends NodeProcess {}
}

declare var process: NodeJS.Process;
