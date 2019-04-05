import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Return all files matching the given pattern.
 * @param root - The root directory.
 * @param filePattern - The file pattern to match files against.
 * @public
 */
export function walk(root: string, filePattern: RegExp): string[] {
  return readdirSync(root)
    .map(f => join(root, f))
    .map(f => {
      const stat = lstatSync(f);
      if (stat.isDirectory()) {
        return walk(f, filePattern);
      } else if (stat.isFile() && filePattern.test(f)) {
        return [f];
      } else {
        return [];
      }
    })
    .reduce((current, next) => current.concat(next), []);
}
