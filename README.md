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
import 'angular-server-side-configuration/process';

export const environment = {
  production: process.env.PROD !== 'false',
  apiAddress: process.env.API_ADDRESS || 'https://example-api.com'
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

## License
Apache License, Version 2.0