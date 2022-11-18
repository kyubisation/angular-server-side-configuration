const Jasmine = require('jasmine');
const path = require('path');
const tsconfig = require('../tsconfig.node.json');

if (module === require.main) {
  tsconfig.compilerOptions.types.push('jasmine', 'dom');
  require('ts-node').register(tsconfig);

  const jasmine = new Jasmine({ projectBaseDir: path.resolve() });
  jasmine.exitOnCompletion = true;
  jasmine.addMatchingSpecFiles(['projects/angular-server-side-configuration/**/*.spec.ts']);
  jasmine.execute();
}
