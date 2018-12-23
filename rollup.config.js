import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default [
  {
    input: './src/index.ts',
    output: {
      file: 'index.js',
      format: 'esm',
    },
    external: ['child_process', 'events', 'fs', 'os', 'path', 'util', 'typescript'],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      typescript(),
    ],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'main.js',
      format: 'cjs',
    },
    external: ['child_process', 'events', 'fs', 'os', 'path', 'util', 'typescript'],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      typescript(),
    ],
  }]
