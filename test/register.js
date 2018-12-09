require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    sourceMap: true,
  }
});
require('source-map-support/register');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
