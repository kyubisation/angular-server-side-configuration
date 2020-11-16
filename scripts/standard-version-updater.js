module.exports.readVersion = function (_contents) {
  const pkg = require('../package.json');
  return pkg.version;
};

module.exports.writeVersion = function (contents, version) {
  try {
    const json = JSON.parse(contents);
    json.schematics.dockerfile.version = version;
    return JSON.stringify(json, null, 2);
  } catch {
    return contents.replace(
      /https:\/\/github.com\/kyubisation\/angular-server-side-configuration\/releases\/download\/v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/g,
      `https://github.com/kyubisation/angular-server-side-configuration/releases/download/v${version}`
    );
  }
};
