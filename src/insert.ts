import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import globToRegExp from 'glob-to-regexp';
import { dirname, join } from 'path';

import { Ngssc, Variant } from '../models';

export function insert(options: { dryRun?: boolean, recursive?: boolean, directory?: string } = {}) {
  const directory = options.directory || process.cwd();
  if (options.recursive) {
    walk(directory, '**/ngssc.json')
      .map(f => dirname(f))
      .forEach(d => insertWithNgssc(d, !!options.dryRun));
  } else {
    insertWithNgssc(directory, !!options.dryRun);
  }
}

function insertWithNgssc(directory: string, dryRun: boolean) {
  const ngsscPath = join(directory, 'ngssc.json');
  if (!existsSync(ngsscPath)) {
    throw new Error(`${ngsscPath} does not exist!`);
  }

  const ngssc: Ngssc = JSON.parse(readFileSync(ngsscPath, 'utf8'));
  const populatedVariables = populateVariables(ngssc.environmentVariables);
  log(`Populated environment variables (Variant: ${ngssc.variant}, ${ngsscPath})`);
  Object.keys(populatedVariables).forEach(k => `  ${k}: ${populatedVariables[k]}`);
  const iife = generateIife(ngssc.variant, populatedVariables);
  const htmlPattern = ngssc.filePattern || 'index.html';
  const htmlFiles = walk(directory, htmlPattern);
  if (!htmlFiles.length) {
    log(`No files found with pattern ${htmlPattern} in ${directory}`);
    return;
  }

  log(`Configuration will be inserted into ${htmlFiles.join(', ')}`);
  if (dryRun) {
    log('Dry run. Nothing will be inserted.');
  } else {
    htmlFiles.forEach(f => insertIntoHtml(f, iife));
  }
}

function populateVariables(variables: string[]) {
  const populatedVariables: { [key: string]: string | null } = {};
  variables.forEach(v => populatedVariables[v] = v in process.env ? process.env[v] || '' : null);
  return populatedVariables;
}

function generateIife(variant: Variant, populatedVariables: { [key: string]: string | null }) {
  const iife = variant === 'NG_ENV' ?
    `(function(self){self.NG_ENV=${JSON.stringify(populatedVariables)};})(window)` :
    `(function(self){self.process=${JSON.stringify({ env: populatedVariables })};})(window)`;
  return `<script>${iife}</script>`;
}

function insertIntoHtml(file: string, iife: string) {
  const fileContent = readFileSync(file, 'utf8');
  if (/<!--\s*CONFIG\s*-->/.test(fileContent)) {
    writeFileSync(file, fileContent.replace(/<!--\s*CONFIG\s*-->/, iife), 'utf8');
  } else if (fileContent.includes('</title>')) {
    writeFileSync(file, fileContent.replace('</title>', `</title>${iife}`), 'utf8');
  } else {
    writeFileSync(file, fileContent.replace('</head>', `${iife}</head>`), 'utf8');
  }
}

function walk(root: string, filePattern: string): string[] {
  const fileRegex = globToRegExp(filePattern, { extended: true, globstar: true, flags: 'ig' });
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

function log(message: string) {
  // tslint:disable-next-line: no-console
  console.log(message);
}
