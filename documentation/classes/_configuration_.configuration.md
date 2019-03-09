[angular-server-side-configuration](../README.md) > ["configuration"](../modules/_configuration_.md) > [Configuration](../classes/_configuration_.configuration.md)

# Class: Configuration

Discover and apply configuration.

## Hierarchy

**Configuration**

↳  [ProcessEnvConfiguration](_process_env_configuration_.processenvconfiguration.md)

↳  [EnvironmentVariablesConfiguration](_environment_variables_configuration_.environmentvariablesconfiguration.md)

## Index

### Constructors

* [constructor](_configuration_.configuration.md#constructor)

### Properties

* [defaultInsertionFilePattern](_configuration_.configuration.md#defaultinsertionfilepattern)
* [directory](_configuration_.configuration.md#directory)
* [replacements](_configuration_.configuration.md#replacements)
* [variables](_configuration_.configuration.md#variables)

### Methods

* [applyAndSaveRecursively](_configuration_.configuration.md#applyandsaverecursively)
* [applyAndSaveTo](_configuration_.configuration.md#applyandsaveto)
* [applyTo](_configuration_.configuration.md#applyto)
* [discoverVariables](_configuration_.configuration.md#discovervariables)
* [generateIIFE](_configuration_.configuration.md#generateiife)
* [insertVariables](_configuration_.configuration.md#insertvariables)
* [insertVariablesIntoHead](_configuration_.configuration.md#insertvariablesintohead)
* [populateVariables](_configuration_.configuration.md#populatevariables)
* [regexReplace](_configuration_.configuration.md#regexreplace)
* [renderIIFE](_configuration_.configuration.md#renderiife)
* [replace](_configuration_.configuration.md#replace)
* [replaceBaseHref](_configuration_.configuration.md#replacebasehref)
* [replaceHtmlLang](_configuration_.configuration.md#replacehtmllang)
* [replaceTagAttribute](_configuration_.configuration.md#replacetagattribute)
* [searchEnvironmentVariables](_configuration_.configuration.md#searchenvironmentvariables)
* [setDirectory](_configuration_.configuration.md#setdirectory)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Configuration**(variables?: *`string`[]*): [Configuration](_configuration_.configuration.md)

*Defined in [configuration.ts:25](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L25)*

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` variables | `string`[] |  [] |  Optional array of environment variable names to populate. |

**Returns:** [Configuration](_configuration_.configuration.md)

___

## Properties

<a id="defaultinsertionfilepattern"></a>

###  defaultInsertionFilePattern

**● defaultInsertionFilePattern**: *`RegExp`* =  /index.html$/

*Defined in [configuration.ts:20](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L20)*

The default pattern for files to have the environment variables inserted into.

___
<a id="directory"></a>

###  directory

**● directory**: *`string`* =  process.cwd()

*Defined in [configuration.ts:15](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L15)*

The directory. Defaults to current working directory.

___
<a id="replacements"></a>

###  replacements

**● replacements**: *`Array`<`function`>* =  []

*Defined in [configuration.ts:25](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L25)*

An array of replacement functions.

___
<a id="variables"></a>

###  variables

**● variables**: *`string`[]*

*Defined in [configuration.ts:30](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L30)*

Optional array of environment variable names to populate.

___

## Methods

<a id="applyandsaverecursively"></a>

###  applyAndSaveRecursively

▸ **applyAndSaveRecursively**(options?: *`object`*): `Promise`<`string`[]>

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

### `<Protected>``<Abstract>` discoverVariables

▸ **discoverVariables**(fileContent: *`string`*): `string`[]

*Defined in [configuration.ts:223](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L223)*

Search for variables in the received file content. Should return an array of found variable names.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fileContent | `string` |  The file content that should be searched. |

**Returns:** `string`[]

___
<a id="generateiife"></a>

###  generateIIFE

▸ **generateIIFE**(): `string`

*Defined in [configuration.ts:200](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L200)*

Generates the IIFE which the renders the populated environment variables.

**Returns:** `string`

___
<a id="insertvariables"></a>

###  insertVariables

▸ **insertVariables**(placeholder?: *`string` \| `RegExp`*): `this`

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

*Defined in [configuration.ts:139](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L139)*

Insert the populated variables (wrapped in an IIFE inside a script tag) into the head tag. Appends variables to title tag, or if not found, at the end of the head tag.

**Returns:** `this`
This instance.

___
<a id="populatevariables"></a>

###  populateVariables

▸ **populateVariables**(): `object`

*Defined in [configuration.ts:209](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L209)*

Generates an object, with the environment variable names being the key and the actual values being the values.

**Returns:** `object`

___
<a id="regexreplace"></a>

###  regexReplace

▸ **regexReplace**(regex: *`RegExp`*, replaceValue: *`string`*): `this`

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

### `<Protected>``<Abstract>` renderIIFE

▸ **renderIIFE**(environmentVariables: *`object`*): `string`

*Defined in [configuration.ts:228](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L228)*

Render the IIFE

**Parameters:**

| Name | Type |
| ------ | ------ |
| environmentVariables | `object` |

**Returns:** `string`

___
<a id="replace"></a>

###  replace

▸ **replace**(replacement: *`function`*): `this`

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

*Defined in [configuration.ts:38](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/configuration.ts#L38)*

Set the directory, where the files to be configured reside in. Default is current working directory.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| directory | `string` |  The directory to work in. |

**Returns:** `this`
This instance.

___

