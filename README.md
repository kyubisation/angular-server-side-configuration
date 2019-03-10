# angular-server-side-configuration

![](https://img.shields.io/travis/kyubisation/angular-server-side-configuration/master.svg)
![](https://img.shields.io/codeclimate/coverage/kyubisation/angular-server-side-configuration.svg)
![](https://img.shields.io/npm/v/angular-server-side-configuration.svg)
![](https://img.shields.io/npm/l/angular-server-side-configuration.svg)


Configure an angular application at runtime on the server via environment variables.

## Motivation
The Angular CLI provides build time configuration (via environment.ts).
In a Continuous Delivery environment this is sometimes not enough.

## How it works & Limitations
Environment variables are used for configuration. This package provides a script
to search for usages in bundled angular files and a script for inserting populated
environment variables into index.html file(s) by replacing `<!--CONFIG-->`
(Missing environment variables will be represented by null). This should be done
on the host serving the bundled angular files.

### AoT
By default, this will not work in Module.forRoot or Module.forChild scripts or parameters.
These are build time only due to AoT restrictions.

With `ngssc wrap-aot ng build ...` (or `ngssc wrap-aot --ng-env ng build ...` for NG_ENV)
it is however possible to retain the configuration, by replacing
the environment variables with tokens during the AoT build and reverting afterwards. (See [CLI wrap-aot](#wrap-aot))

## Getting Started
```
npm install --save angular-server-side-configuration
```

### environment.prod.ts
angular-server-side-configuration supports two variants for using environment variables: process.env.* or NG_ENV.*  

#### process.env.*
Use process.env.NAME in your environment.prod.ts, where NAME is the
environment variable that should be used.

```typescript
import 'angular-server-side-configuration/process';

export const environment = {
  production: process.env.PROD !== 'false',
  apiAddress: process.env.API_ADDRESS || 'https://example-api.com'
};
```

#### NG_ENV.*
Import NG_ENV from `angular-server-side-configuration/ng-env` 
(or `angular-server-side-configuration/ng4-env` for Angular 4 or 5)
and use NG_ENV.NAME in your environment.prod.ts, where NAME is the
environment variable that should be used.

```typescript
import { NG_ENV } from 'angular-server-side-configuration/ng-env';

export const environment = {
  production: NG_ENV.PROD !== 'false',
  apiAddress: NG_ENV.API_ADDRESS || 'https://example-api.com'
};
```

### index.html (Optional)
Add `<!--CONFIG-->` to index.html. This will be replaced by the configuration script tag.
This is optional, as the environment variables can simply be inserted somewhere in the head tag.
It is however the safest option.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Example</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <!--CONFIG-->
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### On host server or in Dockerfile (or similar)
```bash
npm install -g angular-server-side-configuration
ngssc insert /path/to/angular/files --search
```

Or if NG_ENV was used:
```bash
npm install -g angular-server-side-configuration
ngssc insert /path/to/angular/files --ng-env --search
```


## CLI
angular-server-side-configuration provides a CLI.

```bash
npm install angular-server-side-configuration -g
ngssc --help
```

### Insert
Usage: insert [options] [directory]

Search and replace the placeholder with environment variables (Directory defaults to current working directory)

| Options | Description |
| --- | --- |
| `-s, --search`              | Search environment variables in available .js files (Defaults to false) |
| `-e, --env <value>`         | Add an environment variable to be resolved (default: []) |
| `-p, --placeholder <value>` | Set the placeholder to replace with the environment variables (Defaults to `<!--CONFIG-->`) |
| `-h, --head`                | Insert environment variables into the head tag (after title tag, if available, otherwise before closing head tag) |
| `--dry`                     | Perform the insert without actually inserting the variables |
| `--process-env`             | Use process.env for insertion (Default) |
| `--ng-env`                  | Use NG_ENV for insertion |
| `-h, --help`                | output usage information |

### Init
Usage: init [options] [directory]

Initialize an angular project with angular-server-side-configuration (Directory defaults to current working directory)

| Options | Description |
| --- | --- |
| `-ef, --environment-file` | The environment file to initialize (environmentFile defaults to src/environments/environment.prod.ts) |
| `--npm`                   | Install angular-service-side-configuration via npm (Default) |
| `--yarn`                  | Install angular-service-side-configuration via yarn |
| `--process-env`           | Initialize with process.env variant (Default) |
| `--ng-env`                | Initialize with NG_ENV variant |
| `-h, --help`              | output usage information |

### Wrap-Aot
Usage: wrap-aot [options] [ng...]

Wrap an angular command with aot compilation to retain configuration (Use "ngssc wrap-aot ng build ..."). This will temporarily replace the
content of the environment file with tokens. After the inner command completes, this is reverted and the tokens in the dist files will be replaced by the actual values.

| Options | Description |
| --- | --- |
| `-ef, --environment-file` | The environment file to prepare for aot-compilation (Defaults to src/environments/environment.prod.ts) |
| `--dist`                  | The output path of the ng build (Defaults to dist/**) |
| `--process-env`           | Use process.env variant (Default) |
| `--ng-env`                | Use NG_ENV variant |
| `-h, --help`              | output usage information |

## API Documentation

[API Documentation](https://github.com/kyubisation/angular-server-side-configuration/blob/master/documentation/angular-server-side-configuration.md)

## License
Apache License, Version 2.0