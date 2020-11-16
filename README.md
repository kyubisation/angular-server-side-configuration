# angular-server-side-configuration

![](https://img.shields.io/azure-devops/build/kyubisation/894749fe-3edd-41f8-818f-ba14e6a3cc22/2/master.svg)
![](https://img.shields.io/azure-devops/coverage/kyubisation/angular-server-side-configuration/2/master.svg)
![](https://img.shields.io/npm/v/angular-server-side-configuration.svg)
![](https://img.shields.io/npm/l/angular-server-side-configuration.svg)

Configure an angular application at runtime on the server or in a docker container via environment variables.

## Motivation

The Angular CLI provides build time configuration (via environment.ts).
In a Continuous Delivery environment this is sometimes not enough.

## How it works

Environment variables are used for configuration.
This package provides an Angular CLI builder to search for usages at build time.
A [native CLI](#on-host-server-or-in-dockerfile) can be used to insert populated
environment variables into index.html file(s) into the head tag or by replacing `<!--CONFIG-->`
(Missing environment variables will be represented by `null`). This should be done
on the host serving the bundled angular files.

## Version 8/9 Changes

Version 8.x of this package was a complete rewrite with Angular schematics and builders.
If you require support for older Angular versions,
[Version 2.x](https://www.npmjs.com/package/angular-server-side-configuration/v/2.0.0)
of this library can be used, as it is Angular version agnostic.

Version 9 of angular-server-side-configuration deprecates aotSupport, since it is
no longer required for Angular 9 with Ivy. The update schematic removes the option
from your angular.json.

## Getting Started

```
ng add angular-server-side-configuration
```

or, if you have a previous version of this library installed

```
ng update angular-server-side-configuration@latest
```

This will configure the appropriate files.

Alternatively, if you want to configure the files yourself:

```
npm install --save angular-server-side-configuration
```

### angular.json

Ensure you have an `ngsscbuild` entry in your project `architect` section.
To use the builder run `ng run your-project-name:ngsscbuild:production`.
You can add additional configurations in angular.json, which can be executed
by replacing `production` with your configuration name in the previous command.

The builder will analyze the configured `ngsscEnvironmentFile` to detect
used environment variables and generate an [ngssc.json](#ngsscjson) in the defined
`outputPath` in the referenced `browserTarget`.

```json
...
  "projects": {
    ...
    "your-project-name": {
      ...
      "architect": {
        ...
        "ngsscbuild": {
          "builder": "angular-server-side-configuration:ngsscbuild",
          "options": {
            "additionalEnvironmentVariables": ["MANUAL_ENTRIES"],
            "browserTarget": "your-project-name:build",
            "ngsscEnvironmentFile": "src/environments/environment.prod.ts",
            // Optional
            // (Defaults to the basename of the index option of the browser target)
            "filePattern": "index.html"
          },
          "configurations": {
            "production": {
              "browserTarget": "your-project-name:build:production"
            }
          }
        }
        ...
      }
      ...
    }
    ...
  }
...
```

To run the ngssc build, run the command `ng run your-project-name:ngsscbuild:production`.

### environment.prod.ts

angular-server-side-configuration supports two variants for using environment variables:
process.env._ or NG_ENV._

#### process.env.\*

Use process.env.NAME in your environment.prod.ts, where NAME is the
environment variable that should be used.

```typescript
import 'angular-server-side-configuration/process';

export const environment = {
  production: process.env.PROD !== 'false',
  apiAddress: process.env.API_ADDRESS || 'https://example-api.com',
};
```

#### NG_ENV.\*

Import NG_ENV from `angular-server-side-configuration/ng-env`
and use NG_ENV.NAME in your environment.prod.ts, where NAME is the
environment variable that should be used.

```typescript
import { NG_ENV } from 'angular-server-side-configuration/ng-env';

export const environment = {
  production: NG_ENV.PROD !== 'false',
  apiAddress: NG_ENV.API_ADDRESS || 'https://example-api.com',
};
```

### index.html (Optional)

Add `<!--CONFIG-->` to index.html. This will be replaced by the configuration script tag.
This is optional, as the environment variables can be configured to be inserted in the head tag.
It is however the safest option.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Angular Example</title>
    <!--CONFIG-->
    <base href="/" />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

### On host server or in Dockerfile

This library provides a Node.js and a native implementation for inserting the environment variables into your html.
Either the `insert` function from the package (`import { insert } from 'angular-server-side-configuration';`)
or the `insert` command of the CLI.
For the native CLI, go to [Releases](https://github.com/kyubisation/angular-server-side-configuration/releases)
and download the appropriate executable for your server environment.
(See [build.sh](https://github.com/kyubisation/angular-server-side-configuration/blob/master/cli/build.sh) for
build details of the native CLI. Please open an [Issue](https://github.com/kyubisation/angular-server-side-configuration/issues/new)
if you need an additional environment.)

Thanks to [DanielHabenicht](https://github.com/DanielHabenicht) for the input and contribution.

#### ngssc insert

Usage: ngssc insert [options] [directory]

| Options           | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `-r, --recursive` | Recursively searches for ngssc.json files and applies the contained configuration |
| `--dry`           | Perform the insert without actually inserting the variables                       |

##### Minimal Example

Dockerfile

```Dockerfile
FROM nginx:alpine
ADD https://github.com/kyubisation/angular-server-side-configuration/releases/download/v10.2.0/ngssc_64bit /usr/sbin/ngssc
RUN chmod +x /usr/sbin/ngssc
COPY dist /usr/share/nginx/html
COPY start.sh start.sh
RUN chmod +x ./start.sh
CMD ["./start.sh"]
```

start.sh

```bash
#!/bin/sh
ngssc insert /usr/share/nginx/html
nginx -g 'daemon off;'
```

### ngssc.json

The ngssc.json will be generated by the ngsscbuild builder.

```javascript
{
  "variant": "process",           // Either "process" or "NG_ENV".
  "environmentVariables": [],     // Detected environment variables.
  "filePattern": "**/index.html"  // File pattern in which environment variables should be inserted.
}
```

## License

Apache License, Version 2.0
