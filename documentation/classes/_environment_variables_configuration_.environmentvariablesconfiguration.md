[angular-server-side-configuration](../README.md) > ["environment-variables-configuration"](../modules/_environment_variables_configuration_.md) > [EnvironmentVariablesConfiguration](../classes/_environment_variables_configuration_.environmentvariablesconfiguration.md)

# Class: EnvironmentVariablesConfiguration

Discover and apply configuration via environment variables.

## Hierarchy

**EnvironmentVariablesConfiguration**

## Index

### Constructors

* [constructor](_environment_variables_configuration_.environmentvariablesconfiguration.md#constructor)

### Properties

* [defaultInsertionFilePattern](_environment_variables_configuration_.environmentvariablesconfiguration.md#defaultinsertionfilepattern)
* [directory](_environment_variables_configuration_.environmentvariablesconfiguration.md#directory)
* [replacements](_environment_variables_configuration_.environmentvariablesconfiguration.md#replacements)
* [variables](_environment_variables_configuration_.environmentvariablesconfiguration.md#variables)

### Methods

* [apply](_environment_variables_configuration_.environmentvariablesconfiguration.md#apply)
* [applyAndSaveRecursively](_environment_variables_configuration_.environmentvariablesconfiguration.md#applyandsaverecursively)
* [applyAndSaveTo](_environment_variables_configuration_.environmentvariablesconfiguration.md#applyandsaveto)
* [applyTo](_environment_variables_configuration_.environmentvariablesconfiguration.md#applyto)
* [generateIIFE](_environment_variables_configuration_.environmentvariablesconfiguration.md#generateiife)
* [insertAndSave](_environment_variables_configuration_.environmentvariablesconfiguration.md#insertandsave)
* [insertAndSaveRecursively](_environment_variables_configuration_.environmentvariablesconfiguration.md#insertandsaverecursively)
* [insertVariables](_environment_variables_configuration_.environmentvariablesconfiguration.md#insertvariables)
* [insertVariablesIntoHead](_environment_variables_configuration_.environmentvariablesconfiguration.md#insertvariablesintohead)
* [populateVariables](_environment_variables_configuration_.environmentvariablesconfiguration.md#populatevariables)
* [regexReplace](_environment_variables_configuration_.environmentvariablesconfiguration.md#regexreplace)
* [replace](_environment_variables_configuration_.environmentvariablesconfiguration.md#replace)
* [replaceBaseHref](_environment_variables_configuration_.environmentvariablesconfiguration.md#replacebasehref)
* [replaceHtmlLang](_environment_variables_configuration_.environmentvariablesconfiguration.md#replacehtmllang)
* [replaceTagAttribute](_environment_variables_configuration_.environmentvariablesconfiguration.md#replacetagattribute)
* [searchEnvironmentVariables](_environment_variables_configuration_.environmentvariablesconfiguration.md#searchenvironmentvariables)
* [setDirectory](_environment_variables_configuration_.environmentvariablesconfiguration.md#setdirectory)
* [searchEnvironmentVariables](_environment_variables_configuration_.environmentvariablesconfiguration.md#searchenvironmentvariables-1)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new EnvironmentVariablesConfiguration**(variables?: *`string`[]*, replacements?: *`Array`<`function`>*): [EnvironmentVariablesConfiguration](_environment_variables_configuration_.environmentvariablesconfiguration.md)

*Defined in [environment-variables-configuration.ts:24](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L24)*

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` variables | `string`[] |  [] |  Optional array of environment variable names to populate. |
| `Default value` replacements | `Array`<`function`> |  [] |  Optional array of replacement functions. |

**Returns:** [EnvironmentVariablesConfiguration](_environment_variables_configuration_.environmentvariablesconfiguration.md)

___

## Properties

<a id="defaultinsertionfilepattern"></a>

###  defaultInsertionFilePattern

**● defaultInsertionFilePattern**: *`RegExp`* =  /index.html$/

*Defined in [environment-variables-configuration.ts:24](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L24)*

The default pattern for files to have the environment variables inserted into.

___
<a id="directory"></a>

###  directory

**● directory**: *`string`* =  process.cwd()

*Defined in [environment-variables-configuration.ts:19](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L19)*

The directory. Defaults to current working directory.

___
<a id="replacements"></a>

###  replacements

**● replacements**: *`Array`<`function`>*

*Defined in [environment-variables-configuration.ts:32](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L32)*

Optional array of replacement functions.

___
<a id="variables"></a>

###  variables

**● variables**: *`string`[]*

*Defined in [environment-variables-configuration.ts:31](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L31)*

Optional array of environment variable names to populate.

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(file: *`string`*, options?: *`object`*): `Promise`<`string`>

*Defined in [environment-variables-configuration.ts:244](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L244)*

Inserts the discovered environment variables as an IIFE wrapped in a script tag into the specified file content and applies added replacements without saving the file.
*__deprecated__*: Use insertVariables or insertVariablesIntoHead and applyTo instead.

**Parameters:**

**file: `string`**

The file to be read.

**`Default value` options: `object`**

Optional options for insertion.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` insertionRegex | `RegExp` |  The replacement pattern, where the configuration should be inserted (Defaults to /<!--\\s_CONFIG\\s_\-->/). |

**Returns:** `Promise`<`string`>
A promise, which resolves to the file content with the environment variables inserted.

___
<a id="applyandsaverecursively"></a>

###  applyAndSaveRecursively

▸ **applyAndSaveRecursively**(options?: *`object`*): `Promise`<`string`[]>

*Defined in [environment-variables-configuration.ts:262](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L262)*

Apply the replacements to the content of the matched files and save them asynchronously.

**Parameters:**

**`Default value` options: `object`**

Optional options for applying replacements.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` directory | `undefined` | `string` |  The root directory from which to search files. (Defaults to instance directory.) |
| `Optional` filePattern | `RegExp` |  The file pattern in which the configuration should be inserted (Defaults to /index.html$/). |

**Returns:** `Promise`<`string`[]>
A promise, which resolves to the matched files, after all matched files have had the
  replacements applied.

___
<a id="applyandsaveto"></a>

###  applyAndSaveTo

▸ **applyAndSaveTo**(file: *`string`*): `Promise`<`void`>

*Defined in [environment-variables-configuration.ts:274](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L274)*

Apply the replacements to the content of the given file and save it asynchronously.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| file | `string` |  The HTML file to apply the replacements to. |

**Returns:** `Promise`<`void`>
A promise, which resolves after the file has had the replacements applied.

___
<a id="applyto"></a>

###  applyTo

▸ **applyTo**(file: *`string`*): `Promise`<`string`>

*Defined in [environment-variables-configuration.ts:285](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L285)*

Apply the replacements to the content of the given file and return the resulting content as a promise.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| file | `string` |  The HTML file to apply the replacements to. |

**Returns:** `Promise`<`string`>
A promise, which resolves to the file content with the replacements applied.

___
<a id="generateiife"></a>

###  generateIIFE

▸ **generateIIFE**(): `string`

*Defined in [environment-variables-configuration.ts:293](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L293)*

Generates the IIFE in which the environment variables are assigned to window.process.env.

**Returns:** `string`

___
<a id="insertandsave"></a>

###  insertAndSave

▸ **insertAndSave**(file: *`string`*, options?: *`object`*): `Promise`<`void`>

*Defined in [environment-variables-configuration.ts:227](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L227)*

Inserts the discovered environment variables as an IIFE wrapped in a script tag into the specified file and applies added replacements.
*__deprecated__*: Use insertVariables or insertVariablesIntoHead and applyAndSaveTo instead.

**Parameters:**

**file: `string`**

The file into which the environment variables should be inserted.

**`Default value` options: `object`**

Optional options for insertion.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` insertionRegex | `RegExp` |  The replacement pattern, where the configuration should be inserted (Defaults to /<!--\\s_CONFIG\\s_\-->/). |

**Returns:** `Promise`<`void`>
A promise, which resolves after the enivornment variables have been saved to the
  given file.

___
<a id="insertandsaverecursively"></a>

###  insertAndSaveRecursively

▸ **insertAndSaveRecursively**(root: *`string`*, options?: *`object`*): `Promise`<`string`[]>

*Defined in [environment-variables-configuration.ts:207](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L207)*

Inserts the discovered enviornment variables as an IIFE wrapped in a script tag into the matched files and applies added replacements.
*__deprecated__*: Use insertVariables or insertVariablesIntoHead and applyAndSaveRecursively instead.

**Parameters:**

**root: `string`**

The root directory from which to search insertion files.

**`Default value` options: `object`**

Optional options for insertion.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` filePattern | `RegExp` |  The file pattern in which the configuration should be inserted (Defaults to /index.html$/). |
| `Optional` insertionRegex | `RegExp` |  The replacement pattern, where the configuration should be inserted (Defaults to /<!--\\s_CONFIG\\s_\-->/). |

**Returns:** `Promise`<`string`[]>
A promise, which resolves after the environment variables have been
  inserted into all matched files. The promise resolves to an array of the matched files.

___
<a id="insertvariables"></a>

###  insertVariables

▸ **insertVariables**(placeholder?: *`string` | `RegExp`*): `this`

*Defined in [environment-variables-configuration.ts:163](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L163)*

Replace the placeholder with the populated variables wrapped in an IIFE inside a script tag.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` placeholder | `string` | `RegExp` |  /&lt;!--\s*CONFIG\s*--&gt;/ |  The placeholder to replace with the populated variables. (Defaults to <!--CONFIG-->.) |

**Returns:** `this`
This instance.

___
<a id="insertvariablesintohead"></a>

###  insertVariablesIntoHead

▸ **insertVariablesIntoHead**(): `this`

*Defined in [environment-variables-configuration.ts:172](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L172)*

Insert the populated variables (wrapped in an IIFE inside a script tag) into the head tag. Appends variables to title tag, or if not found, at the end of the head tag.

**Returns:** `this`
This instance.

___
<a id="populatevariables"></a>

###  populateVariables

▸ **populateVariables**(): `object`

*Defined in [environment-variables-configuration.ts:302](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L302)*

Generates an object, with the environment variable names being the key and the actual values being the values.

**Returns:** `object`

___
<a id="regexreplace"></a>

###  regexReplace

▸ **regexReplace**(regex: *`RegExp`*, replaceValue: *`string`*): `this`

*Defined in [environment-variables-configuration.ts:153](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L153)*

Add a replacement for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| regex | `RegExp` |  A RegExp object or literal. The match or matches are replaced with replaceValue. |
| replaceValue | `string` |  The value that replaces the substring matched by the regex parameter. |

**Returns:** `this`
This instance.

___
<a id="replace"></a>

###  replace

▸ **replace**(replacement: *`function`*): `this`

*Defined in [environment-variables-configuration.ts:187](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L187)*

Add a replacement function for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively. The function receives the file content and the file name as parameters and returns the file content with the replacement applied.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| replacement | `function` |  The replacement function. |

**Returns:** `this`
This instance.

___
<a id="replacebasehref"></a>

###  replaceBaseHref

▸ **replaceBaseHref**(newBaseHref: *`string`*): `this`

*Defined in [environment-variables-configuration.ts:113](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L113)*

Replace the base href attribute for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| newBaseHref | `string` |  The new base href. |

**Returns:** `this`
This instance.

___
<a id="replacehtmllang"></a>

###  replaceHtmlLang

▸ **replaceHtmlLang**(newHtmlLang: *`string`*): `this`

*Defined in [environment-variables-configuration.ts:124](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L124)*

Replace the html lang attribute for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| newHtmlLang | `string` |  The new base href. |

**Returns:** `this`
This instance.

___
<a id="replacetagattribute"></a>

###  replaceTagAttribute

▸ **replaceTagAttribute**(tag: *`string`*, attribute: *`string`*, newValue: *`string`*): `this`

*Defined in [environment-variables-configuration.ts:137](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L137)*

Replace the attribute value of a tag for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| tag | `string` |  The tag, whose attribute value should be replaced. |
| attribute | `string` |  The attribute, whose value should be replaced. |
| newValue | `string` |  The new attribute value. |

**Returns:** `this`
This instance.

___
<a id="searchenvironmentvariables"></a>

###  searchEnvironmentVariables

▸ **searchEnvironmentVariables**(options?: *`object`*): `this`

*Defined in [environment-variables-configuration.ts:83](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L83)*

Searches for environment variable declarations in files matched by file pattern, starting from given directory.

**Parameters:**

**`Default value` options: `object`**

Optional options for searching environment variables.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` directory | `undefined` | `string` |  The root directory from which to search. |
| `Optional` environmentVariablesDiscovery | `undefined` | `function` |  The function to discover environment variables in the matched files (Defaults to process.env.VARIABLE => VARIABLE). |
| `Optional` filePattern | `RegExp` |  The file pattern in which environment variables should be searched (Defaults to /.js$/). |

**Returns:** `this`
This instance.

___
<a id="setdirectory"></a>

###  setDirectory

▸ **setDirectory**(directory: *`string`*): `this`

*Defined in [environment-variables-configuration.ts:65](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L65)*

Set the directory, where the files to be configured reside in. Default is current working directory.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| directory | `string` |  The directory to work in. |

**Returns:** `this`
This instance.

___
<a id="searchenvironmentvariables-1"></a>

### `<Static>` searchEnvironmentVariables

▸ **searchEnvironmentVariables**(directory: *`string`*, options?: *`object`*): [EnvironmentVariablesConfiguration](_environment_variables_configuration_.environmentvariablesconfiguration.md)

*Defined in [environment-variables-configuration.ts:49](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/environment-variables-configuration.ts#L49)*

Searches for environment variable declarations in files matched by file pattern, starting from given directory.
*__deprecated__*: Static searchEnvironmentVariables is deprecated. Use the instance method instead.

**Parameters:**

**directory: `string`**

The root directory from which to search.

**`Default value` options: `object`**

Optional options for searching environment variables.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` environmentVariablesDiscovery | `undefined` | `function` |  The function to discover environment variables in the matched files (Defaults to process.env.VARIABLE => VARIABLE). |
| `Optional` filePattern | `RegExp` |  The file pattern in which environment variables should be searched (Defaults to /.js$/). |

**Returns:** [EnvironmentVariablesConfiguration](_environment_variables_configuration_.environmentvariablesconfiguration.md)

___

