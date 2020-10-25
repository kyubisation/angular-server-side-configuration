const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

if (require.main === module) {
  const version = process.env.npm_package_version || require('../package.json').version;

  const migrationJsonPath = '../schematics/migration.json';
  const migrationJson = require(migrationJsonPath);
  migrationJson.schematics.dockerfile.version = version;
  writeFileSync(join(__dirname, migrationJsonPath), JSON.stringify(migrationJson, null, 2), 'utf8');

  const readmePath = join(__dirname, '../README.md');
  const readmeContent = readFileSync(readmePath, 'utf8').replace(
    /https:\/\/github.com\/kyubisation\/angular-server-side-configuration\/releases\/download\/v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/g,
    `https://github.com/kyubisation/angular-server-side-configuration/releases/download/v${version}`);
  writeFileSync(readmePath, readmeContent, 'utf8');
}