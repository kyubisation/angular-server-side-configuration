import { execSync } from 'child_process';
import { lstatSync, readdirSync, writeFileSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, relative, resolve } from 'path';

if (module === require.main) {
  // We always build as a snapshot bu8ild, unless the script is invoked directly by the
  // release publish script. The snapshot release configuration ensures that the current
  // Git `HEAD` sha is included for the version placeholders.
  finalizePackage();
}

interface Schema {
  properties: Record<string, any>;
}

async function finalizePackage() {
  const rootDir = resolve(join(__dirname, '..'));
  const sourceDir = join(rootDir, 'projects/angular-server-side-configuration');
  const targetDir = join(rootDir, 'dist/angular-server-side-configuration');
  const schemaDirs = ['builders', 'schematics'].map((d) => join(sourceDir, d));
  execSync('npx ng build angular-server-side-configuration', { cwd: rootDir, stdio: 'inherit' });

  console.log(`Copying required assets:`);
  for (const file of ['README.md', 'LICENSE']) {
    console.log(` - ${file}`);
    await copyFile(join(rootDir, file), join(targetDir, file));
  }
  for (const file of walk(schemaDirs, /.json$/).filter((f) => !f.endsWith('tsconfig.json'))) {
    const relativePath = relative(sourceDir, file);
    const targetPath = join(targetDir, relativePath);
    console.log(` - ${relativePath}`);
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(file, targetPath);
  }

  const ngsscSchema: Schema = JSON.parse(
    await readFile(join(sourceDir, 'builders/ngsscbuild/schema.json'), 'utf8')
  );
  delete ngsscSchema.properties['browserTarget'];
  for (const schemaVariant of ['browser', 'dev-server']) {
    const sourceFile = join(
      rootDir,
      'node_modules/@angular-devkit/build-angular/src/builders',
      schemaVariant,
      'schema.json'
    );
    const schema: Schema = JSON.parse(await readFile(sourceFile, 'utf8'));
    schema.properties = { ...schema.properties, ...ngsscSchema.properties };
    const targetFile = join(targetDir, 'builders', schemaVariant, 'schema.json');
    const relativePath = relative(targetDir, targetFile);
    console.log(` - ${relativePath}`);
    await mkdir(dirname(targetFile), { recursive: true });
    await writeFile(targetFile, JSON.stringify(schema, null, 2), 'utf8');

    await writeFile(
      join(sourceDir, 'builders', schemaVariant, 'schema.json'),
      JSON.stringify(schema, null, 2),
      'utf8'
    );
  }

  for (const schemaDir of schemaDirs) {
    const relativeSchemaDir = relative(rootDir, schemaDir);
    console.log(`Building ${relativeSchemaDir}`);
    execSync(`npx tsc --project ${relativeSchemaDir}/tsconfig.json`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }

  const distPackageJson = require('../dist/angular-server-side-configuration/package.json');
  distPackageJson.sideEffects = [
    './esm2020/ng-env/public_api.mjs',
    './esm2020/process/public_api.mjs',
    './fesm2015/angular-server-side-configuration-ng-env.mjs',
    './fesm2015/angular-server-side-configuration-process.mjs',
    './fesm2020/angular-server-side-configuration-ng-env.mjs',
    './fesm2020/angular-server-side-configuration-process.mjs',
  ];
  writeFileSync(
    join(__dirname, '../dist/angular-server-side-configuration/package.json'),
    JSON.stringify(distPackageJson, null, 2),
    'utf8'
  );
}

function walk(root: string | string[], fileRegex: RegExp): string[] {
  if (Array.isArray(root)) {
    return root.reduce((current, next) => current.concat(walk(next, fileRegex)), [] as string[]);
  }

  const directory = root.replace(/\\/g, '/');
  return readdirSync(directory)
    .map((f) => `${directory}/${f}`)
    .map((f) => {
      const stat = lstatSync(f);
      if (stat.isDirectory()) {
        return walk(f, fileRegex);
      } else if (stat.isFile() && fileRegex.test(f)) {
        return [f];
      } else {
        return [];
      }
    })
    .reduce((current, next) => current.concat(next), []);
}
