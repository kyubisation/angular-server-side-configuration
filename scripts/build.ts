import { execSync } from 'child_process';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, relative, resolve } from 'path';

if (module === require.main) {
  // We always build as a snapshot bu8ild, unless the script is invoked directly by the
  // release publish script. The snapshot release configuration ensures that the current
  // Git `HEAD` sha is included for the version placeholders.
  finalizePackage();
}

async function finalizePackage() {
  const rootDir = resolve(join(__dirname, '..'));
  const sourceDir = join(rootDir, 'projects/angular-server-side-configuration');
  const targetDir = join(rootDir, 'dist/angular-server-side-configuration');
  const schemaDirs = ['builders', 'schematics'].map((d) => join(sourceDir, d));
  if (!existsSync(targetDir)) {
    console.log('dist not available. Starting ng build.');
    execSync('npx ng build angular-server-side-configuration', { cwd: rootDir, stdio: 'inherit' });
  }

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

  for (const schemaDir of schemaDirs) {
    const relativeSchemaDir = relative(rootDir, schemaDir);
    console.log(`Building ${relativeSchemaDir}`);
    execSync(`npx tsc --project ${relativeSchemaDir}`, { cwd: rootDir, stdio: 'inherit' });
  }
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
