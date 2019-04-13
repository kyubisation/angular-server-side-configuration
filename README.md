# angular-server-side-configuration

![](https://img.shields.io/azure-devops/build/kyubisation/894749fe-3edd-41f8-818f-ba14e6a3cc22/1/master.svg)
![](https://img.shields.io/azure-devops/coverage/kyubisation/angular-server-side-configuration/1/master.svg)
![](https://img.shields.io/npm/v/angular-server-side-configuration.svg)
![](https://img.shields.io/npm/l/angular-server-side-configuration.svg)


Configure an angular application at runtime on the server or in a docker container via environment variables.

## Motivation
The Angular CLI provides build time configuration (via environment.ts).
In a Continuous Delivery environment this is sometimes not enough.

## How it works & Limitations
Environment variables are used for configuration. This package provides a CLI command
to search for usages at build time and a CLI command for inserting populated
environment variables into index.html file(s) into the head tag or by replacing `<!--CONFIG-->`
(Missing environment variables will be represented by null). This should be done
on the host serving the bundled angular files.

## Getting Started
```
npm install --save angular-server-side-configuration
```

### Wrap ng build
Wrap the `ng build` command with `ngssc` (e.g. `ngssc ng build` or `ngssc --wrap-aot ng build` 
if AoT retention is needed). This will generate a ngssc.json file in dist (or configurable via `--dist`),
which contains the configurations needed for `ngssc insert`. (See [ngssc](#ngssc) and [ngssc.json](#ngsscjson))

`package.json`
```json
...
  "scripts": {
    ...
    "build": "ngssc ng build --prod",
    ...
  }
...
```

If you need to build multiple angular bundles with the same environment file (e.g. to build i18n bundles),
wrap the different `ng build` scripts.

`package.json`
```json
...
  "scripts": {
    ...
    "build": "ngssc ng npm run build:ng",
    "build:ng": "ng build -c en && ng build -c de && ng build -c fr",
    ...
  }
...
```

This will create an ngssc.json in you dist directory (configurable via --dist, e.g. `ngssc --dist ng build --prod`)
or embed the configuration in the html files in the dist directory. You can pass an existing ngssc.json file
to the command via --config (e.g. `ngssc --config ngssc.json`).


#### AoT
If you use environment variables in Module.forRoot or Module.forChild (or other AoT code sections)
the `--wrap-aot` flag must be used with the `ngssc` command (e.g. `ngssc --wrap-aot ng build --prod`).

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
This is optional, as the environment variables can be configured to be inserted in the head tag.
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
ngssc insert /path/to/ngssc.json/file
```

## CLI
angular-server-side-configuration provides a CLI.

```bash
npm install angular-server-side-configuration -g
ngssc --help
```

### ngssc
Usage: ngssc [options] [ng...]

Detect used environment variables and either generates ngssc.json in given dist or embeds the information in the html files in dist

| Options | Description |
| --- | --- |
| `-ef, --environment-file`   | The environment file in which to detect environment variables and optionally tokenize when using --wrap-aot. Defaults to src/environments/environment.prod.ts |
| `-a, --wrap-aot`            | Tokenize variables to to retain during AoT compilation |
| `--dist`                    | The output path of the ng build. Defaults to dist/ |
| `--html-file-pattern`       | The file pattern where the environment variables should be inserted. Defaults to **/index.html |
| `-h, --insert-in-head`      | Whether to configure to try to insert the environment variables in the head tag. Defaults to configuring replacing <!--CONFIG--> |
| `-e, --embed-in-html`       | Whether to embed the ngssc information into the html file found by --html-file-pattern in --dist instead of generating ngssc.json in --dist |
| `-c, --config <ngssc.json>` | Use an existing ngssc.json file as base configuration |
| `-h, --help`                | output usage information |

### Insert
Usage: ngssc insert [options] [directory]

Insert environment variables. Looks for an ngssc.json file inside the current or given directory.
Alternatively use the --config-in-html flag. Directory defaults to current working directory

| Options | Description |
| --- | --- |
| `-i, --config-in-html`      | Recursively searches for html files and applies the configuration found inside |
| `--dry`                     | Perform the insert without actually inserting the variables |
| `-h, --help`                | output usage information |

### Init
Usage: ngssc init [options] [directory]

Initialize an angular project with angular-server-side-configuration (Directory defaults to current working directory)

| Options | Description |
| --- | --- |
| `-ef, --environment-file` | The environment file to initialize. environmentFile defaults to src/environments/environment.prod.ts |
| `--npm`                   | Install angular-service-side-configuration via npm. Default |
| `--yarn`                  | Install angular-service-side-configuration via yarn |
| `--process-env`           | Initialize with process.env variant. Default |
| `--ng-env`                | Initialize with NG_ENV variant |
| `-h, --help`              | output usage information |

### ngssc.json

The package provides a JSON schema: `ngssc.schema.json",`

```javascript
{
  "$schema": "./node_modules/angular-server-side-configuration/ngssc.schema.json", // Optional
  "variant": "process",           // Either "process" or "NG_ENV".
  "environmentVariables": [],     // Detected environment variables.
                                  // Will be merged if used with an existing ngssc.json.
  "filePattern": "**/index.html", // File pattern in which environment variables should be inserted.
                                  // Can be configured via --html-file-pattern. Also used if
                                  // --embed-in-html is used.
  "insertInHead": false           // By default the CLI replaces <!--CONFIG--> in your html files during
                                  // the insert command. If insertInHead is set to true, the insert
                                  // command tries to insert the environment variables in the head tag,
                                  // by looking for </title> or </head>.
}
```

## API Documentation

[API Documentation](https://github.com/kyubisation/angular-server-side-configuration/blob/master/documentation/angular-server-side-configuration.md)

## License
Apache License, Version 2.0