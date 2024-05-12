import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const root = new URL('../', import.meta.url).pathname;
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const cliDirectory = join(root, 'cli');
const binaries: { os: string; arch: string; fileName: string }[] = [
  { os: 'windows', arch: '386', fileName: 'ngssc_32bit.exe' },
  { os: 'windows', arch: 'amd64', fileName: 'ngssc_64bit.exe' },
  { os: 'linux', arch: '386', fileName: 'ngssc_32bit' },
  { os: 'linux', arch: 'amd64', fileName: 'ngssc_64bit' },
  { os: 'darwin', arch: 'amd64', fileName: 'ngssc_darwin_64bit' },
];
const buildUpx = process.argv[2] === 'upx';

const asyncExec = promisify(exec);
await Promise.all(
  binaries.map(async (binary) => {
    const binaryDist = join(root, 'dist', 'cli', binary.fileName);
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
    console.log(`Finished building for ${binary.os} ${binary.arch}`);

    if (buildUpx) {
      const [fileName, extension] = binary.fileName.split('.');
      const minBinaryDist = join(root, 'dist', 'cli', `${fileName}_min.${extension ?? ''}`);
      console.log(`Building upx binary for ${binary.os} ${binary.arch}`);
      await cp(binaryDist, minBinaryDist);
      await asyncExec(`upx --brute ${minBinaryDist}`);
      console.log(`Finished compressing binary for ${binary.os} ${binary.arch}`);
    }
  }),
);
