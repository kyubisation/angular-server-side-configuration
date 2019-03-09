[angular-server-side-configuration](../README.md) > ["process-env-configuration"](../modules/_process_env_configuration_.md) > [ProcessEnvConfiguration](../classes/_process_env_configuration_.processenvconfiguration.md)

# Class: ProcessEnvConfiguration

Discover and apply configuration via environment variables discovered via process.env usage.

## Hierarchy

 [Configuration](_configuration_.configuration.md)

**↳ ProcessEnvConfiguration**

## Index

### Constructors

* [constructor](_process_env_configuration_.processenvconfiguration.md#constructor)

### Properties

* [defaultInsertionFilePattern](_process_env_configuration_.processenvconfiguration.md#defaultinsertionfilepattern)
* [directory](_process_env_configuration_.processenvconfiguration.md#directory)
* [replacements](_process_env_configuration_.processenvconfiguration.md#replacements)
* [variables](_process_env_configuration_.processenvconfiguration.md#variables)

### Methods

* [applyAndSaveRecursively](_process_env_configuration_.processenvconfiguration.md#applyandsaverecursively)
* [applyAndSaveTo](_process_env_configuration_.processenvconfiguration.md#applyandsaveto)
* [applyTo](_process_env_configuration_.processenvconfiguration.md#applyto)
* [discoverVariables](_process_env_configuration_.processenvconfiguration.md#discovervariables)
* [generateIIFE](_process_env_configuration_.processenvconfiguration.md#generateiife)
* [insertVariables](_process_env_configuration_.processenvconfiguration.md#insertvariables)
* [insertVariablesIntoHead](_process_env_configuration_.processenvconfiguration.md#insertvariablesintohead)
* [populateVariables](_process_env_configuration_.processenvconfiguration.md#populatevariables)
* [regexReplace](_process_env_configuration_.processenvconfiguration.md#regexreplace)
* [renderIIFE](_process_env_configuration_.processenvconfiguration.md#renderiife)
* [replace](_process_env_configuration_.processenvconfiguration.md#replace)
* [replaceBaseHref](_process_env_configuration_.processenvconfiguration.md#replacebasehref)
* [replaceHtmlLang](_process_env_configuration_.processenvconfiguration.md#replacehtmllang)
* [replaceTagAttribute](_process_env_configuration_.processenvconfiguration.md#replacetagattribute)
* [searchEnvironmentVariables](_process_env_configuration_.processenvconfiguration.md#searchenvironmentvariables)
* [setDirectory](_process_env_configuration_.processenvconfiguration.md#setdirectory)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ProcessEnvConfiguration**(variables?: *`string`[]*): [ProcessEnvConfiguration](_process_env_configuration_.processenvconfiguration.md)

*Inherited from [Configuration](_configuration_.configuration.md).[constructor](_configuration_.configuration.md#constructor)*

*Defined in [configuration.ts:25](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L25)*

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` variables | `string`[] |  [] |  Optional array of environment variable names to populate. |

**Returns:** [ProcessEnvConfiguration](_process_env_configuration_.processenvconfiguration.md)

___

## Properties

<a id="defaultinsertionfilepattern"></a>

###  defaultInsertionFilePattern

**● defaultInsertionFilePattern**: *`RegExp`* =  /index.html$/

*Inherited from [Configuration](_configuration_.configuration.md).[defaultInsertionFilePattern](_configuration_.configuration.md#defaultinsertionfilepattern)*

*Defined in [configuration.ts:20](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L20)*

The default pattern for files to have the environment variables inserted into.

___
<a id="directory"></a>

###  directory

**● directory**: *`string`* =  process.cwd()

*Inherited from [Configuration](_configuration_.configuration.md).[directory](_configuration_.configuration.md#directory)*

*Defined in [configuration.ts:15](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L15)*

The directory. Defaults to current working directory.

___
<a id="replacements"></a>

###  replacements

**● replacements**: *`Array`<`function`>* =  []

*Inherited from [Configuration](_configuration_.configuration.md).[replacements](_configuration_.configuration.md#replacements)*

*Defined in [configuration.ts:25](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L25)*

An array of replacement functions.

___
<a id="variables"></a>

###  variables

**● variables**: *`string`[]*

*Inherited from [Configuration](_configuration_.configuration.md).[variables](_configuration_.configuration.md#variables)*

*Defined in [configuration.ts:30](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L30)*

Optional array of environment variable names to populate.

___

## Methods

<a id="applyandsaverecursively"></a>

###  applyAndSaveRecursively

▸ **applyAndSaveRecursively**(options?: *`object`*): `Promise`<`string`[]>

*Inherited from [Configuration](_configuration_.configuration.md).[applyAndSaveRecursively](_configuration_.configuration.md#applyandsaverecursively)*

*Defined in [configuration.ts:169](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L169)*

Apply the replacements to the content of the matched files and save them asynchronously.

**Parameters:**

**`Default value` options: `object`**

Optional options for applying replacements.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` directory | `undefined` \| `string` |  The root directory from which to search files. (Defaults to instance directory.) |
| `Optional` filePattern | `RegExp` |  The file pattern in which the configuration should be inserted (Defaults to /index.html$/). |

**Returns:** `Promise`<`string`[]>
A promise, which resolves to the matched files, after all matched files have had the
  replacements applied.

___
<a id="applyandsaveto"></a>

###  applyAndSaveTo

▸ **applyAndSaveTo**(file: *`string`*): `Promise`<`void`>

*Inherited from [Configuration](_configuration_.configuration.md).[applyAndSaveTo](_configuration_.configuration.md#applyandsaveto)*

*Defined in [configuration.ts:181](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L181)*

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

*Inherited from [Configuration](_configuration_.configuration.md).[applyTo](_configuration_.configuration.md#applyto)*

*Defined in [configuration.ts:192](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L192)*

Apply the replacements to the content of the given file and return the resulting content as a promise.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| file | `string` |  The HTML file to apply the replacements to. |

**Returns:** `Promise`<`string`>
A promise, which resolves to the file content with the replacements applied.

___
<a id="discovervariables"></a>

### `<Protected>` discoverVariables

▸ **discoverVariables**(fileContent: *`string`*): `string`[]

*Overrides [Configuration](_configuration_.configuration.md).[discoverVariables](_configuration_.configuration.md#discovervariables)*

*Defined in [process-env-configuration.ts:7](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/process-env-configuration.ts#L7)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fileContent | `string` |

**Returns:** `string`[]

___
<a id="generateiife"></a>

###  generateIIFE

▸ **generateIIFE**(): `string`

*Inherited from [Configuration](_configuration_.configuration.md).[generateIIFE](_configuration_.configuration.md#generateiife)*

*Defined in [configuration.ts:200](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L200)*

Generates the IIFE which the renders the populated environment variables.

**Returns:** `string`

___
<a id="insertvariables"></a>

###  insertVariables

▸ **insertVariables**(placeholder?: *`string` \| `RegExp`*): `this`

*Inherited from [Configuration](_configuration_.configuration.md).[insertVariables](_configuration_.configuration.md#insertvariables)*

*Defined in [configuration.ts:130](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L130)*

Replace the placeholder with the populated variables wrapped in an IIFE inside a script tag.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` placeholder | `string` \| `RegExp` |  /&lt;!--\s*CONFIG\s*--&gt;/ |  The placeholder to replace with the populated variables. (Defaults to <!--CONFIG-->.) |

**Returns:** `this`
This instance.

___
<a id="insertvariablesintohead"></a>

###  insertVariablesIntoHead

▸ **insertVariablesIntoHead**(): `this`

*Inherited from [Configuration](_configuration_.configuration.md).[insertVariablesIntoHead](_configuration_.configuration.md#insertvariablesintohead)*

*Defined in [configuration.ts:139](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L139)*

Insert the populated variables (wrapped in an IIFE inside a script tag) into the head tag. Appends variables to title tag, or if not found, at the end of the head tag.

**Returns:** `this`
This instance.

___
<a id="populatevariables"></a>

###  populateVariables

▸ **populateVariables**(): `object`

*Inherited from [Configuration](_configuration_.configuration.md).[populateVariables](_configuration_.configuration.md#populatevariables)*

*Defined in [configuration.ts:209](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L209)*

Generates an object, with the environment variable names being the key and the actual values being the values.

**Returns:** `object`

___
<a id="regexreplace"></a>

###  regexReplace

▸ **regexReplace**(regex: *`RegExp`*, replaceValue: *`string`*): `this`

*Inherited from [Configuration](_configuration_.configuration.md).[regexReplace](_configuration_.configuration.md#regexreplace)*

*Defined in [configuration.ts:120](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L120)*

Add a replacement for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| regex | `RegExp` |  A RegExp object or literal. The match or matches are replaced with replaceValue. |
| replaceValue | `string` |  The value that replaces the substring matched by the regex parameter. |

**Returns:** `this`
This instance.

___
<a id="renderiife"></a>

### `<Protected>` renderIIFE

▸ **renderIIFE**(environmentVariables: *`object`*): `string`

*Overrides [Configuration](_configuration_.configuration.md).[renderIIFE](_configuration_.configuration.md#renderiife)*

*Defined in [process-env-configuration.ts:12](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/process-env-configuration.ts#L12)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| environmentVariables | `object` |

**Returns:** `string`

___
<a id="replace"></a>

###  replace

▸ **replace**(replacement: *`function`*): `this`

*Inherited from [Configuration](_configuration_.configuration.md).[replace](_configuration_.configuration.md#replace)*

*Defined in [configuration.ts:154](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L154)*

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

*Inherited from [Configuration](_configuration_.configuration.md).[replaceBaseHref](_configuration_.configuration.md#replacebasehref)*

*Defined in [configuration.ts:80](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L80)*

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

*Inherited from [Configuration](_configuration_.configuration.md).[replaceHtmlLang](_configuration_.configuration.md#replacehtmllang)*

*Defined in [configuration.ts:91](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L91)*

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

*Inherited from [Configuration](_configuration_.configuration.md).[replaceTagAttribute](_configuration_.configuration.md#replacetagattribute)*

*Defined in [configuration.ts:104](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L104)*

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

*Inherited from [Configuration](_configuration_.configuration.md).[searchEnvironmentVariables](_configuration_.configuration.md#searchenvironmentvariables)*

*Defined in [configuration.ts:53](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L53)*

Searches for environment variable declarations in files matched by file pattern, starting from given directory.

**Parameters:**

**`Default value` options: `object`**

Optional options for searching environment variables.

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` directory | `undefined` \| `string` |  The root directory from which to search. |
| `Optional` filePattern | `RegExp` |  The file pattern in which environment variables should be searched (Defaults to /.js$/). |

**Returns:** `this`
This instance.

___
<a id="setdirectory"></a>

###  setDirectory

▸ **setDirectory**(directory: *`string`*): `this`

*Inherited from [Configuration](_configuration_.configuration.md).[setDirectory](_configuration_.configuration.md#setdirectory)*

*Defined in [configuration.ts:38](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L38)*

Set the directory, where the files to be configured reside in. Default is current working directory.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| directory | `string` |  The directory to work in. |

**Returns:** `this`
This instance.

___

