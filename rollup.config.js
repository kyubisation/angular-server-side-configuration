import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-cpy';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

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
    copy({ files: ['package.json', 'README.md', 'process/*'], dest: 'dist' }),
  ],
};
