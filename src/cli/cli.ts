//import program from 'commander';
import { Command } from 'commander';
import { InsertCommand } from './insert-command';
import { InitCommand } from './init-command';
import { WrapAotCommand } from './wrap-aot';

export function cli(): { parse(args: string[]): any } {
  const program = new Command();
  program
    .command('insert [directory]')
    .description(
      'Search and replace the placeholder with environment variables '
      + '(Directory defaults to current working directory)')
    .option('-s, --search', 'Search environment variables in available .js files (Defaults to false)')
    .option(
      '-e, --env <value>',
      'Add an environment variable to be resolved',
      (v: string, a: string[]) => a.concat(v), [])
    .option(
      '-p, --placeholder <value>',
      'Set the placeholder to replace with the environment variables (Defaults to <!--CONFIG-->)')
    .option(
      '-h, --head',
      'Insert environment variables into the head tag '
      + '(after title tag, if available, otherwise before closing head tag)')
    .option('--dry', 'Perform the insert without actually inserting the variables')
    .action(
      async (directory: string, options: any) =>
        await new InsertCommand({ directory, ...options }).execute());
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
    .action(
      async (directory: string, options: any) =>
        await new InitCommand({ directory, ...options }).execute());
  program
    .command('wrap-aot [ng...]')
    .description(
      'Wrap an angular command with aot compilation to retain configuration '
      + '(Use "ngssc wrap-aot ng build ..."). This will temporarily replace the content '
      + 'of the environment file with tokens. After the inner command completes, this is '
      + 'reverted and the tokens in the dist files will be replaced by the actual values.')
    .option(
      '-ef, --environment-file',
      'The environment file to prepare for aot-compilation '
      + '(Defaults to src/environments/environment.prod.ts)')
    .option('--dist', 'The output path of the ng build (Defaults to dist/**)')
    .allowUnknownOption()
    .action(
      async (ngCommands: string[], options: any) =>
        await new WrapAotCommand({
          ngCommands: process.argv.slice(process.argv.indexOf(ngCommands[0])),
          directory: process.cwd(),
          ...options
        })
          .execute());
  return program;
}
