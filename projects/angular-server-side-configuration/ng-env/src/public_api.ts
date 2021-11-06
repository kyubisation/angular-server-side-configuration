var globalVariable: { NG_ENV?: any } = {};
try {
  globalVariable = window as any;
} catch (e) {}

export var NG_ENV: { [name: string]: string } = globalVariable.NG_ENV || {};
