import { execSync } from 'child_process';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import * as glob from 'glob';
import { dirname, join, relative } from 'path';

await finalizePackage();

interface Schema {
  properties: Record<string, any>;
}

async function finalizePackage() {
  const rootDir = new URL('..', import.meta.url).pathname;
  const sourceDir = join(rootDir, 'projects/angular-server-side-configuration');
  const targetDir = join(rootDir, 'dist/angular-server-side-configuration');
  const schemaDirs = ['builders', 'schematics'].map((d) => join(sourceDir, d));
  execSync('yarn ng build angular-server-side-configuration', { cwd: rootDir, stdio: 'inherit' });

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
    await readFile(join(sourceDir, 'builders/ngsscbuild/schema.json'), 'utf8'),
  );
  delete ngsscSchema.properties['buildTarget'];
  delete ngsscSchema.properties['browserTarget'];
  for (const schemaVariant of ['browser', 'dev-server']) {
    const sourceFile = join(
      rootDir,
      'node_modules/@angular-devkit/build-angular/src/builders',
      schemaVariant,
      'schema.json',
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
      'utf8',
    );
  }

  for (const schemaDir of schemaDirs) {
    const relativeSchemaDir = relative(rootDir, schemaDir);
    console.log(`Building ${relativeSchemaDir}`);
    execSync(`yarn tsc --project ${relativeSchemaDir}/tsconfig.json`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }

  const packageJsonPath = join(targetDir, 'package.json');
  const distPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  distPackageJson.sideEffects = glob
    .sync(['esm*/**/public_api.{mjs,js}', 'fesm*/*{ng-env,process}.{mjs,js}'], {
      cwd: targetDir,
      dotRelative: true,
    })
    .sort();
  writeFileSync(packageJsonPath, JSON.stringify(distPackageJson, null, 2), 'utf8');
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
