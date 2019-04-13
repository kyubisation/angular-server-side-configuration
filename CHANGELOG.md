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
