import { exec } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist', 'cli');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const cliDirectory = join(root, 'cli');
const binaries: { os: string; arch: string; fileName: string, alias?: string }[] = [
  { os: 'windows', arch: 'amd64', fileName: 'ngssc_amd64.exe', alias: 'ngssc_64bit.exe' },
  { os: 'linux', arch: 'amd64', fileName: 'ngssc_amd64', alias: 'ngssc_64bit' },
  { os: 'linux', arch: 'arm64', fileName: 'ngssc_arm64' },
  { os: 'darwin', arch: 'amd64', fileName: 'ngssc_darwin_amd64', alias: 'ngssc_darwin_64bit' },
  { os: 'darwin', arch: 'arm64', fileName: 'ngssc_darwin_arm64' },
];

const asyncExec = promisify(exec);
await Promise.all(
  binaries.map(async (binary) => {
    const binaryDist = join(dist, binary.fileName);
    console.log(`Building for ${binary.os} ${binary.arch}`);
    await asyncExec(
      `go build -ldflags="-s -w -X main.CliVersion=${version}" -buildvcs=false -o ${binaryDist}`,
      {
        cwd: cliDirectory,
        env: {
          ...process.env,
          GOOS: binary.os,
          GOARCH: binary.arch,
        },
      },
    );
    console.log(`Finished building for ${binary.os} ${binary.arch}: ${binary.fileName}`);
    if (binary.alias) {
      await cp(binaryDist, join(dist, binary.alias));
      console.log(`Created alias for ${binary.os} ${binary.arch}: ${binary.alias}`);
    }
  }),
);

console.table(readdirSync(dist).sort().reduce((current, next) => Object.assign(current, { [next]: statSync(join(dist, next)).size }), {} as Record<string, number>));
