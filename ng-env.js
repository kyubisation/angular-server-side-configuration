var globalVariable = {};
try {
  globalVariable = window;
} catch (e) {}
export var NG_ENV = globalVariable.NG_ENV || {};
