import { tmpdir } from 'os';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
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
    typescript({
      tsconfigOverride: { compilerOptions: { module: 'ESNext', declaration: false } },
      cacheRoot: `${tmpdir()}/.rpt2_cache_ngssc`,
    }),
    resolve(),
    commonjs()
  ]
}
