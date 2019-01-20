import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

const config = {
  input: './src/index.ts',
  external: ['child_process', 'events', 'fs', 'os', 'path', 'util', 'typescript'],
  plugins: [
    resolve(),
    json(),
    commonjs(),
    typescript(),
  ],
};

export default [
  Object.assign({ output: { file: 'index.js', format: 'esm' } }, config),
  Object.assign({ output: { file: 'main.js', format: 'cjs' } }, config),
]
