import { lstatSync, readdirSync } from 'fs';
import globToRegExp from 'glob-to-regexp';

/**
 * Return all files matching the given pattern.
 * @param root - The root directory.
 * @param filePattern - The file pattern to match files against.
 * @public
 */
export function walk(root: string, filePattern: RegExp | string): string[] {
  const fileRegex = typeof filePattern === 'string'
    ? globToRegExp(filePattern, { extended: true, globstar: true, flags: 'ig' }) : filePattern;
  const directory = root.replace(/\\/g, '/');
  return readdirSync(directory)
    .map(f => `${directory}/${f}`)
    .map(f => {
      const stat = lstatSync(f);
      if (stat.isDirectory()) {
        return walk(f, filePattern);
      } else if (stat.isFile() && fileRegex.test(f)) {
        return [f];
      } else {
        return [];
      }
    })
    .reduce((current, next) => current.concat(next), []);
}
