import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-cpy';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { writeFileSync } from 'fs';
import { join } from 'path';

function copyRessources() {
  return {
    name: 'copy-ressources',
    writeBundle() {
      const packageJson = require('./package.json');
      delete packageJson.private;
      delete packageJson.scripts;
      delete packageJson.devDependencies;
      delete packageJson.jest;
      writeFileSync(join(__dirname, 'dist', 'package.json'), JSON.stringify(packageJson, null, 2));
    }
  }
}

export default {
  input: './src/index.ts',
  output: [
    { file: './dist/index.js', format: 'esm' },
    { file: './dist/main.js', format: 'cjs' },
  ],
  external: ['child_process', 'events', 'fs', 'os', 'path', 'util', 'typescript'],
  plugins: [
    resolve(),
    json(),
    commonjs(),
    typescript({ useTsconfigDeclarationDir: true }),
    copy([
      { files: ['README.md', 'process/*'], dest: 'dist' },
      { files: ['bin/ngssc'], dest: 'dist/bin' },
    ]),
    copyRessources(),
  ],
};
