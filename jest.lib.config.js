const baseConfig = require('./package').jest;

module.exports = {
  ...baseConfig,
  "testEnvironment": "node",
  roots: ['<rootDir>/projects'],
};