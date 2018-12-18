[angular-server-side-configuration](../README.md) > ["cli/init-command"](../modules/_cli_init_command_.md) > [InitCommand](../classes/_cli_init_command_.initcommand.md)

# Class: InitCommand

## Hierarchy

 [CommandBase](_cli_command_base_.commandbase.md)

**↳ InitCommand**

## Index

### Constructors

* [constructor](_cli_init_command_.initcommand.md#constructor)

### Properties

* [_directory](_cli_init_command_.initcommand.md#_directory)
* [_environmentFile](_cli_init_command_.initcommand.md#_environmentfile)
* [_options](_cli_init_command_.initcommand.md#_options)
* [_packagePath](_cli_init_command_.initcommand.md#_packagepath)

### Methods

* [_execute](_cli_init_command_.initcommand.md#_execute)
* [_initEnvironmentFile](_cli_init_command_.initcommand.md#_initenvironmentfile)
* [_installPackage](_cli_init_command_.initcommand.md#_installpackage)
* [_log](_cli_init_command_.initcommand.md#_log)
* [_logValue](_cli_init_command_.initcommand.md#_logvalue)
* [_validateOptions](_cli_init_command_.initcommand.md#_validateoptions)
* [execute](_cli_init_command_.initcommand.md#execute)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InitCommand**(_options: *`object`*): [InitCommand](_cli_init_command_.initcommand.md)

*Overrides [CommandBase](_cli_command_base_.commandbase.md).[constructor](_cli_command_base_.commandbase.md#constructor)*

*Defined in [cli/init-command.ts:10](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L10)*

**Parameters:**

**_options: `object`**

| Name | Type |
| ------ | ------ |
| `Optional` directory |  `undefined` &#124; `string`|
| `Optional` environmentFile |  `undefined` &#124; `string`|
| `Optional` npm |  `undefined` &#124; `false` &#124; `true`|
| `Optional` yarn |  `undefined` &#124; `false` &#124; `true`|

**Returns:** [InitCommand](_cli_init_command_.initcommand.md)

___

## Properties

<a id="_directory"></a>

### `<Private>` _directory

**● _directory**: *`string`*

*Defined in [cli/init-command.ts:10](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L10)*

___
<a id="_environmentfile"></a>

### `<Private>` _environmentFile

**● _environmentFile**: *`string`*

*Defined in [cli/init-command.ts:9](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L9)*

___
<a id="_options"></a>

### `<Private>` _options

**● _options**: *`object`*

*Defined in [cli/init-command.ts:12](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L12)*

#### Type declaration

`Optional`  directory:  `undefined` &#124; `string`

`Optional`  environmentFile:  `undefined` &#124; `string`

`Optional`  npm:  `undefined` &#124; `false` &#124; `true`

`Optional`  yarn:  `undefined` &#124; `false` &#124; `true`

___
<a id="_packagepath"></a>

### `<Private>` _packagePath

**● _packagePath**: *`string`*

*Defined in [cli/init-command.ts:8](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L8)*

___

## Methods

<a id="_execute"></a>

### `<Protected>` _execute

▸ **_execute**(): `Promise`<`void`>

*Overrides [CommandBase](_cli_command_base_.commandbase.md).[_execute](_cli_command_base_.commandbase.md#_execute)*

*Defined in [cli/init-command.ts:26](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L26)*

**Returns:** `Promise`<`void`>

___
<a id="_initenvironmentfile"></a>

### `<Private>` _initEnvironmentFile

▸ **_initEnvironmentFile**(): `void`

*Defined in [cli/init-command.ts:42](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L42)*

**Returns:** `void`

___
<a id="_installpackage"></a>

### `<Private>` _installPackage

▸ **_installPackage**(): `void`

*Defined in [cli/init-command.ts:74](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L74)*

**Returns:** `void`

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
<a id="_validateoptions"></a>

### `<Private>` _validateOptions

▸ **_validateOptions**(): `void`

*Defined in [cli/init-command.ts:32](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/init-command.ts#L32)*

**Returns:** `void`

___
<a id="execute"></a>

###  execute

▸ **execute**(): `Promise`<`void`>

*Inherited from [CommandBase](_cli_command_base_.commandbase.md).[execute](_cli_command_base_.commandbase.md#execute)*

*Defined in [cli/command-base.ts:5](https://github.com/kyubisation/angular-server-side-configuration/blob/e20a7d2/src/cli/command-base.ts#L5)*

**Returns:** `Promise`<`void`>

___

