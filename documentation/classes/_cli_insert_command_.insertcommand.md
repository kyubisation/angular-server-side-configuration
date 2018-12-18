[angular-server-side-configuration](../README.md) > ["cli/insert-command"](../modules/_cli_insert_command_.md) > [InsertCommand](../classes/_cli_insert_command_.insertcommand.md)

# Class: InsertCommand

## Hierarchy

 [CommandBase](_cli_command_base_.commandbase.md)

**↳ InsertCommand**

## Index

### Constructors

* [constructor](_cli_insert_command_.insertcommand.md#constructor)

### Properties

* [_envVariables](_cli_insert_command_.insertcommand.md#_envvariables)
* [_options](_cli_insert_command_.insertcommand.md#_options)

### Methods

* [_addEnvironmentVariablesFromCommandLine](_cli_insert_command_.insertcommand.md#_addenvironmentvariablesfromcommandline)
* [_configureDirectory](_cli_insert_command_.insertcommand.md#_configuredirectory)
* [_configureReplacement](_cli_insert_command_.insertcommand.md#_configurereplacement)
* [_dryMessage](_cli_insert_command_.insertcommand.md#_drymessage)
* [_execute](_cli_insert_command_.insertcommand.md#_execute)
* [_insertEnvironmentVariables](_cli_insert_command_.insertcommand.md#_insertenvironmentvariables)
* [_log](_cli_insert_command_.insertcommand.md#_log)
* [_logPopulatedEnvironmentVariables](_cli_insert_command_.insertcommand.md#_logpopulatedenvironmentvariables)
* [_logValue](_cli_insert_command_.insertcommand.md#_logvalue)
* [_searchEnvironmentVariables](_cli_insert_command_.insertcommand.md#_searchenvironmentvariables)
* [_validateConfig](_cli_insert_command_.insertcommand.md#_validateconfig)
* [execute](_cli_insert_command_.insertcommand.md#execute)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InsertCommand**(_options: *`object`*): [InsertCommand](_cli_insert_command_.insertcommand.md)

*Overrides [CommandBase](_cli_command_base_.commandbase.md).[constructor](_cli_command_base_.commandbase.md#constructor)*

*Defined in [cli/insert-command.ts:7](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L7)*

**Parameters:**

**_options: `object`**

| Name | Type |
| ------ | ------ |
| `Optional` directory |  `undefined` &#124; `string`|
| `Optional` dry |  `undefined` &#124; `false` &#124; `true`|
| `Optional` env | `string`[] |
| `Optional` head |  `undefined` &#124; `false` &#124; `true`|
| `Optional` placeholder |  `undefined` &#124; `string`|
| `Optional` search |  `undefined` &#124; `false` &#124; `true`|

**Returns:** [InsertCommand](_cli_insert_command_.insertcommand.md)

___

## Properties

<a id="_envvariables"></a>

### `<Private>` _envVariables

**● _envVariables**: *[EnvironmentVariablesConfiguration](_environment_variables_configuration_.environmentvariablesconfiguration.md)* =  new EnvironmentVariablesConfiguration()

*Defined in [cli/insert-command.ts:7](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L7)*

___
<a id="_options"></a>

### `<Private>` _options

**● _options**: *`object`*

*Defined in [cli/insert-command.ts:9](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L9)*

#### Type declaration

`Optional`  directory:  `undefined` &#124; `string`

`Optional`  dry:  `undefined` &#124; `false` &#124; `true`

`Optional`  env: `string`[]

`Optional`  head:  `undefined` &#124; `false` &#124; `true`

`Optional`  placeholder:  `undefined` &#124; `string`

`Optional`  search:  `undefined` &#124; `false` &#124; `true`

___

## Methods

<a id="_addenvironmentvariablesfromcommandline"></a>

### `<Private>` _addEnvironmentVariablesFromCommandLine

▸ **_addEnvironmentVariablesFromCommandLine**(): `void`

*Defined in [cli/insert-command.ts:57](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L57)*

**Returns:** `void`

___
<a id="_configuredirectory"></a>

### `<Private>` _configureDirectory

▸ **_configureDirectory**(): `void`

*Defined in [cli/insert-command.ts:43](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L43)*

**Returns:** `void`

___
<a id="_configurereplacement"></a>

### `<Private>` _configureReplacement

▸ **_configureReplacement**(): `void`

*Defined in [cli/insert-command.ts:64](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L64)*

**Returns:** `void`

___
<a id="_drymessage"></a>

### `<Private>` _dryMessage

▸ **_dryMessage**(): `void`

*Defined in [cli/insert-command.ts:37](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L37)*

**Returns:** `void`

___
<a id="_execute"></a>

### `<Protected>` _execute

▸ **_execute**(): `Promise`<`void`>

*Overrides [CommandBase](_cli_command_base_.commandbase.md).[_execute](_cli_command_base_.commandbase.md#_execute)*

*Defined in [cli/insert-command.ts:20](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L20)*

**Returns:** `Promise`<`void`>

___
<a id="_insertenvironmentvariables"></a>

### `<Private>` _insertEnvironmentVariables

▸ **_insertEnvironmentVariables**(): `Promise`<`void`>

*Defined in [cli/insert-command.ts:81](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L81)*

**Returns:** `Promise`<`void`>

___
<a id="_log"></a>

### `<Protected>` _log

▸ **_log**(message: *`string`*): `void`

*Inherited from [CommandBase](_cli_command_base_.commandbase.md).[_log](_cli_command_base_.commandbase.md#_log)*

*Defined in [cli/command-base.ts:19](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/command-base.ts#L19)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |

**Returns:** `void`

___
<a id="_logpopulatedenvironmentvariables"></a>

### `<Private>` _logPopulatedEnvironmentVariables

▸ **_logPopulatedEnvironmentVariables**(): `void`

*Defined in [cli/insert-command.ts:77](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L77)*

**Returns:** `void`

___
<a id="_logvalue"></a>

### `<Protected>` _logValue

▸ **_logValue**(message: *`string`*, value: *`any`*): `void`

*Inherited from [CommandBase](_cli_command_base_.commandbase.md).[_logValue](_cli_command_base_.commandbase.md#_logvalue)*

*Defined in [cli/command-base.ts:13](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/command-base.ts#L13)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |
| value | `any` |

**Returns:** `void`

___
<a id="_searchenvironmentvariables"></a>

### `<Private>` _searchEnvironmentVariables

▸ **_searchEnvironmentVariables**(): `void`

*Defined in [cli/insert-command.ts:49](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L49)*

**Returns:** `void`

___
<a id="_validateconfig"></a>

### `<Private>` _validateConfig

▸ **_validateConfig**(): `void`

*Defined in [cli/insert-command.ts:31](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/insert-command.ts#L31)*

**Returns:** `void`

___
<a id="execute"></a>

###  execute

▸ **execute**(): `Promise`<`void`>

*Inherited from [CommandBase](_cli_command_base_.commandbase.md).[execute](_cli_command_base_.commandbase.md#execute)*

*Defined in [cli/command-base.ts:5](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/command-base.ts#L5)*

**Returns:** `Promise`<`void`>

___

