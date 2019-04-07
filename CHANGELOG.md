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
