# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [8.1.2](https://github.com/kyubisation/angular-server-side-configuration/compare/v8.1.1...v8.1.2) (2020-01-12)


### Bug Fixes

* bump handlebars from 4.1.2 to 4.5.3 ([#35](https://github.com/kyubisation/angular-server-side-configuration/issues/35)) ([de53338](https://github.com/kyubisation/angular-server-side-configuration/commit/de533381723afd94f18f1a9decf3e93c6d566600))

# 8.1.0 (2019-10-23)

### Refactor

* No longer changing working directory in the cli

# 8.1.0 (2019-10-23)

### Features

* Add uncompressed binaries

# 8.0.0 (2019-08-25)

### Bugfix

* Fixed issue with native cli --recursive

# 8.0.0-beta.4 (2019-07-19)

### Bugfix

* Fixed iife insertion

# 8.0.0-beta.3 (2019-07-19)

### Bugfix

* Fixed dependency issue with glob-to-regexp

# 8.0.0-beta.2 (2019-07-19)

### Features

* Implemented insert function (`import { insert } from 'angular-server-side-configuration';`)

### Bugfix

* Fixed issue in native cli

# 8.0.0-beta.1 (2019-07-14)

### Features

* Added additionalEnvironmentVariables to builder options
* Implemented ng update migration

# 8.0.0-beta.0 (2019-06-30)

### Features

* Rewrote the library to use Angular schematics and builders
* Added --recursive flag to the native CLI

### Breaking Changes

* Removed the npm CLI and most of the existing internal implementation
* Dropped support for configuration embedded in html

# 2.0.0 (2019-04-14)

### Features

* Added documentation for the native cli

# 2.0.0-beta.1 (2019-04-13)

The detection and insertion of environment variables has been separated.
Detection is now executed at build time by wrapping the ng build command (e.g. `ngssc ng build`).
This will generate an ngssc.json file, which can be used by the `ngssc insert` command.
See the README for more information.

### Features

* New command `ngssc` for detecting environment variable usage

### Breaking Changes

* The `ngssc wrap-aot` has been merged into the `ngssc` command as an optional flag `--wrap-aot`.
* The `ngssc insert` command requires an ngssc.json file or embedded configuration in the html files.

# 2.0.0-beta.0 (2019-03-10)

### Features

* Implemented NG_ENV variant as an alternative for process.env

### Breaking Changes

* Removed deprecated ProcessEnvConfiguration

# 1.3.0 (2019-03-09)

### Features

* Created ProcessEnvConfiguration, which will replace EnvironmentVariablesConfiguration
* Created class Configuration, which is the base implementation for ProcessEnvConfiguration and EnvironmentVariablesConfiguration

### Deprecation

* EnvironmentVariablesConfiguration has been deprecated. Use ProcessEnvConfiguration instead

### Internal Changes

* Switched testing framework from mocha/chai/nyc to jest
