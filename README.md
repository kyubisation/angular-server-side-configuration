# angular-server-side-configuration
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

```typescript
export const environment = {
  production: process.env.PROD !== 'false',
  apiAddress: process.env.API_ADDRESS || 'https://example-api.com'
};
```

### polyfill.ts
Import `angular-server-side-configuration/process` in polyfill.ts. This will enable
the typings for process.env.* in the code and register a fallback value for process.env.

```typescript
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
...

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

import 'angular-server-side-configuration/process';
```

### index.html
Add `<!--CONFIG-->` to index.html. This will be replaced by the configuration script tag.

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

### server.ts (or any script executed on the host)
`EnvironmentVariablesConfiguration` provides a way of looking for usages of process.env.*
in the bundled angular javascript files and provides a way of inserting the environment variables
into the index.html file(s).

```typescript
// Express is completely optional
import * as express from 'express';
const app = express();
...
import { EnvironmentVariablesConfiguration } from 'angular-server-side-configuration';
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
envVariables.insertAndSaveRecursively(bundledAngularFilesRoot)
  // Optional
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Node server listening on http://localhost:${PORT}`);
    });
  });
```
## Documentation

### process
Import `angular-server-side-configuration/process` in polyfill.ts. This will enable
the typings for process.env.* in the code and register a fallback value for process.env.

```typescript
import 'angular-server-side-configuration/process';
```

### EnvironmentVariablesConfiguration

#### Constructor
Accepts an array of environment variables.
```typescript
const envVariables = new EnvironmentVariablesConfiguration(['PROD', 'API_ADDRESS']);
```

#### EnvironmentVariablesConfiguration.searchEnvironmentVariables
By default the searchEnvironmentVariables method uses a regex
(`/process\s*\.\s*env\s*\.\s*[a-zA-Z0-9_]+/gm`) to look for process.env.* usages.
It is possible to provide a discovery function in the options as a second parameter.

`root` The root directory from which to search.  
`options` Optional options for searching environment variables.  
`options.filePattern` The file pattern in which environment variables should be searched
(Defaults to /.js$/).  
`options.environmentVariablesDiscovery` The function to discover environment variables in
the matched files (Defaults to process.env.VARIABLE => VARIABLE).

Returns an instance of EnvironmentVariablesConfiguration.

```typescript
const envVariables: EnvironmentVariablesConfiguration =
  EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
```

#### EnvironmentVariablesConfiguration.prototype.populateVariables
Generates an object, with the environment variable names being the key and
the actual values being the values. Missing environment variables will be represented by null.

```typescript
const envVariables = new EnvironmentVariablesConfiguration(['PROD', 'API_ADDRESS']);
process.env.API_ADDRESS = 'https://example-api.com';
const variables = envVariables.populateVariables();
// { PROD: null, API_ADDRESS: 'https://example-api.com' }
```

#### EnvironmentVariablesConfiguration.prototype.generateIIFE
Generates the IIFE in which the environment variables are assigned to window.process.env.

```typescript
const envVariables = new EnvironmentVariablesConfiguration(['PROD', 'API_ADDRESS']);
process.env.API_ADDRESS = 'https://example-api.com';
const iife = envVariables.generateIIFE();
// (function(self){self.process={env:{"PROD":null,"API_ADDRESS":"https://example-api.com"}};})(window)
```

#### EnvironmentVariablesConfiguration.prototype.apply
Inserts the discovered environment variables as an IIFE wrapped in a script tag
into the specified file content without saving the file.

`file` The file to be read.  
`options` Optional options for insertion.  
`options.insertionRegex` The replacement pattern, where the configuration should be inserted
(Defaults to `/<!--\s*CONFIG\s*-->/`).

Returns a promise, which resolves to the file content with the environment variables inserted.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
const content = await envVariables.apply(pathToIndexHtml);
// <html>...<script>(function(self){self.process={env:{"PROD":null,"API_ADDRESS":"https://example-api.com"}};})(window)</script>...</html>
```

#### EnvironmentVariablesConfiguration.prototype.insertAndSave
Inserts the discovered environment variables as an IIFE wrapped in a script tag into the specified file.

`file` The file into which the environment variables should be inserted.  
`options` Optional options for insertion.  
`options.insertionRegex` The replacement pattern, where the configuration should be inserted
(Defaults to `/<!--\s*CONFIG\s*-->/`).

Returns a promise, which resolves after the enivornment variables have been saved to the given file.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables.insertAndSave(pathToIndexHtml);
```

#### EnvironmentVariablesConfiguration.prototype.insertAndSaveRecursively
Inserts the discovered enviornment variables as an IIFE wrapped in a script tag into the matched files.

`root` The root directory from which to search insertion files.  
`options` Optional options for insertion.  
`options.filePattern` The file pattern in which the configuration should be inserted
(Defaults to /index.html$/).  
`options.insertionRegex` The replacement pattern, where the configuration should
be inserted (Defaults to `/<!--\s*CONFIG\s*-->/`).

Returns a promise, which resolves after the environment variables have been inserted to all matched files.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables.insertAndSaveRecursively(bundledAngularFilesRoot);
```

#### EnvironmentVariablesConfiguration.prototype.replace
Add a replacement function for the file received through apply, insertAndSave or
insertAndSaveRecursively. The function receives the file content and the file name as
parameters and returns the file content with the replacement applied.

`replacement` The replacement function.

Returns this instance.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables
  .replace((fileContent, fileName) => fileContent.replace('search-example', 'replace-example'))
  .insertAndSaveRecursively(bundledAngularFilesRoot);
```

#### EnvironmentVariablesConfiguration.prototype.regexReplace
Add a replacement for the file received through apply, insertAndSave or insertAndSaveRecursively.

`regex` A RegExp object or literal. The match or matches are replaced with replaceValue.
`replaceValue` The value that replaces the substring matched by the regex parameter.

Returns this instance.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables
  .regexReplace(/search-example-[0-9]/g, 'replace-example')
  .insertAndSaveRecursively(bundledAngularFilesRoot);
```

#### EnvironmentVariablesConfiguration.prototype.replaceTagAttribute
Replace the attribute value of a tag for the file received through
apply, insertAndSave or insertAndSaveRecursively.

`tag` The tag, whose attribute value should be replaced.
`attribute` The attribute, whose value should be replaced.
`newValue` The new attribute value.

Returns this instance.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables
  .replaceTagAttribute('body', 'id', newId)
  .insertAndSaveRecursively(bundledAngularFilesRoot);
```

#### EnvironmentVariablesConfiguration.prototype.replaceHtmlLang
Replace the html lang attribute for the file received through
apply, insertAndSave or insertAndSaveRecursively.

`newHtmlLang` The new base href.

Returns this instance.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables
  .replaceHtmlLang('de')
  .insertAndSaveRecursively(bundledAngularFilesRoot);
```

#### EnvironmentVariablesConfiguration.prototype.replaceBaseHref
Replace the base href attribute for the file received through
apply, insertAndSave or insertAndSaveRecursively.

`newBaseHref` The new base href.

Returns this instance.

```typescript
const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(bundledAngularFilesRoot);
await envVariables
  .replaceBaseHref('/de/')
  .insertAndSaveRecursively(bundledAngularFilesRoot);
```


## License
Apache License, Version 2.0