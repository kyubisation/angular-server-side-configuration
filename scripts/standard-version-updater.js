module.exports.readVersion = function (_contents) {
  return require('../package.json').version;
};

module.exports.writeVersion = function (contents, version) {
  try {
    const json = JSON.parse(contents);
    if (json.name && json.version) {
      // projects/angular-server-side-configuration/package.json
      json.version = version;
      const majorVersionRange = `^${version.split('.')[0]}.0.0`;
      for (const name of Object.keys(json.peerDependencies).filter((n) =>
        n.startsWith('@angular/'),
      )) {
        json.peerDependencies[name] = majorVersionRange;
      }
    } else {
      // projects/angular-server-side-configuration/schematics/migration.json
      json.schematics.dockerfile.version = version;
    }
    return JSON.stringify(json, null, 2);
  } catch {
    return contents.replace(
      /https:\/\/github.com\/kyubisation\/angular-server-side-configuration\/releases\/download\/v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/g,
      `https://github.com/kyubisation/angular-server-side-configuration/releases/download/v${version}`,
    );
  }
};
