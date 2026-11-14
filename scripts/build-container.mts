import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';

const { version, author, name } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const imageName = `ghcr.io/${author}/${name}`;
const podman = (...args: string[]) => once(spawn('podman', args, { stdio: 'inherit' }), 'close');

await podman('manifest', 'rm', `${imageName}:${version}`);
await podman('manifest', 'rm', `${imageName}:latest`);
await podman(
  'build',
  '--platform',
  'linux/amd64,linux/arm64',
  '--label=org.opencontainers.image.source="https://github.com/kyubisation/angular-server-side-configuration"',
  '--label=org.opencontainers.image.description="angular-server-side-configuration CLI tool"',
  '--manifest',
  `${imageName}:${version}`,
  '.',
);
await podman('tag', `${imageName}:${version}`, `${imageName}:latest`);

if (process.argv.includes('--release')) {
  await podman('manifest', 'push', `${imageName}:${version}`);
  await podman('manifest', 'push', `${imageName}:latest`);
}
