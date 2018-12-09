import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';

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