import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import ts from "@wessberg/rollup-plugin-ts";
import { join } from 'path';

export default ['./builders/ngsscbuild', './schematics/ng-add', './schematics/ng-update'].map(p => ({
  input: join(p, 'index.ts'),
  output: {
    file: join(p, 'index.js'),
    format: 'cjs'
  },
  external: [
    '@angular-devkit/architect',
    '@angular-devkit/core',
    '@angular-devkit/schematics',
    '@schematics/angular/utility/change',
    '@schematics/angular/utility/config',
    'crypto',
    'fs',
    'path',
    'util',
    'typescript'
  ],
  plugins: [
    ts({ browserslist: false })
  ]
})).concat({
  input: './src/index.ts',
  output: [
    {
      file: './src/main.js',
      format: 'cjs',
    },
    {
      file: './src/module.js',
      format: 'esm',
    }
  ],
  external: [
    'fs',
    'path'
  ],
  plugins: [
    ts({ browserslist: false }),
    resolve(),
    commonjs()
  ]
});
