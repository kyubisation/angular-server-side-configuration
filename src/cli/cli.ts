import { Command } from 'commander';

import { DetectorCommand } from './detector-command';
import { InitCommand } from './init-command';
import { InsertCommand } from './insert-command';

/**
 * @public
 */
export function cli(): { parse(args: string[]): any } {
  const program = new Command();
  [baseCommand, insertCommand, initCommand].forEach(c => c(program));
  return program;
}

function baseCommand(program: Command) {
  program
    .usage('[options] [ng...]')
    .description(
      'Detect used environment variables and either generates ngssc.json in given dist '
      + 'or embeds the information in the html files in dist')
    .option(
      '--environment-file',
      'The environment file in which to detect environment variables and optionally'
      + ' tokenize when using --wrap-aot (Defaults to src/environments/environment.prod.ts)')
    .option('-a, --wrap-aot', 'Tokenize variables to to retain during AoT compilation')
    .option('--dist', 'The output path of the ng build (Defaults to dist/)')
    .option(
      '--html-file-pattern',
      'The file pattern where the environment variables should be inserted (Defaults to index.html)')
    .option(
      '-r, --recursive-matching',
      'Whether the file pattern for the insertion should be recursively matched (Default)')
    .option(
      '--no-recursive-matching',
      'Whether the file pattern for the insertion should not be recursively matched')
    .option(
      '-h, --insert-in-head',
      'Whether to configure to try to insert the environment variables in the head tag '
      + '(Defaults to configure replacing <!--CONFIG-->')
    .option(
      '-e, --embed-in-html',
      'Whether to embed the ngssc information into the html file found by --html-file-pattern '
      + 'in --dist instead of generating ngssc.json in --dist')
    .allowUnknownOption()
    .action(
      async (...args) =>
        new DetectorCommand({
          ngCommand: process.argv.slice(process.argv.indexOf(args[0])),
          ...args.pop(),
        })
          .execute());
}

function insertCommand(program: Command) {
  program
    .command('insert [directory]')
    .description(
      'Insert environment variables. Looks for an ngssc.json file '
      + 'inside the current or given directory. Alternatively use the --config-in-html flag. '
      + '(Directory defaults to current working directory)')
    .option(
      '-i, --config-in-html',
      'Recursively searches for html files and applies the configuration found inside')
    .option('--dry', 'Perform the insert without actually inserting the variables')
    .action(
      async (directory: string = process.cwd(), options: any = {}) =>
        await new InsertCommand({ directory, ...options }).execute());
}

function initCommand(program: Command) {
  program
    .command('init [directory]')
    .description(
      'Initialize an angular project with angular-server-side-configuration '
      + '(Directory defaults to current working directory)')
    .option(
      '-ef, --environment-file',
      'The environment file to initialize '
      + '(Defaults to src/environments/environment.prod.ts)')
    .option('--npm', 'Install angular-service-side-configuration via npm (Default)')
    .option('--yarn', 'Install angular-service-side-configuration via yarn')
    .option('--process-env', 'Initialize with process.env variant (Default)')
    .option('--ng-env', 'Initialize with NG_ENV variant')
    .action(
      async (directory: string, options: any) =>
        await new InitCommand({ directory, ...options }).execute());
}
