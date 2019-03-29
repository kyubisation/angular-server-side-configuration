var globalVariable: any = {};
try {
  globalVariable = window as any;
} catch (e) { }

export var NG_ENV: { [name: string]: string } = globalVariable.NG_ENV || {};