# angular-server-side-configuration
Configure an angular application at runtime on the server via environment variables.

## Motivation
The Angular CLI provides build time configuration (via environment.ts).
In a Continuous Delivery this is sometimes not enough.

## How it works & Limitations
Environment variables are used for configuration. This package provides a script
to search for usages in bundled angular files and a script for inserting populated
environment variables into index.html file(s).

### AOT
This will not work in Module.forRoot or Module.forChild scripts or parameters.
These are build time only due to AOT restrictions.

## Getting Started
```
npm install --save angular-server-side-configuration
```

### environment.prod.ts
Use process.env.NAME in your environment.prod.ts, where NAME is the
environment variable that should be used.

```TypeScript
export const environment = {
  production: process.env.PROD !== 'false',
  apiAddress: process.env.API_ADDRESS || 'https://example-api.com'
};
```

### polyfill.ts
Import `angular-server-side-configuration/process` in polyfill.ts. This will enable
the typings for process.env.* in the code and register a fallback value for process.env.

```TypeScript
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
...

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

import 'angular-server-side-configuration/process';
```

### server.ts (or any script executed on the host)
`EnvironmentVariablesConfiguration` provides a way of looking for usages of process.env.*
in the bundled angular javascript files and provides a way of inserting the environment variables
into the index.html file(s).

```TypeScript
...
import { EnvironmentVariablesConfiguration } from 'angular-server-side-configuration';
import * as express from 'express';
...
const app = express();
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
...
envVariables.insertAndSaveRecursively(bundledAngularFilesRoot)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Node server listening on http://localhost:${PORT}`);
    });
  });
```

#### EnvironmentVariablesConfiguration.searchEnvironmentVariables
By default the searchEnvironmentVariables method uses a regex
(/process\s*\.\s*env\s*\.\s*[a-zA-Z0-9_]+/gm) to look for process.env.* usages.
It is possible to provide a discovery function in the options as a second parameter.

## License
Apache License, Version 2.0