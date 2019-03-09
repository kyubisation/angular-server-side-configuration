[angular-server-side-configuration](../README.md) > ["cli/command-base"](../modules/_cli_command_base_.md) > [CommandBase](../classes/_cli_command_base_.commandbase.md)

# Class: CommandBase

## Hierarchy

**CommandBase**

↳  [InitCommand](_cli_init_command_.initcommand.md)

↳  [InsertCommand](_cli_insert_command_.insertcommand.md)

↳  [WrapAotCommand](_cli_wrap_aot_.wrapaotcommand.md)

## Index

### Constructors

* [constructor](_cli_command_base_.commandbase.md#constructor)

### Properties

* [_name](_cli_command_base_.commandbase.md#_name)

### Methods

* [_execute](_cli_command_base_.commandbase.md#_execute)
* [_log](_cli_command_base_.commandbase.md#_log)
* [_logValue](_cli_command_base_.commandbase.md#_logvalue)
* [execute](_cli_command_base_.commandbase.md#execute)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new CommandBase**(_name: *`string`*): [CommandBase](_cli_command_base_.commandbase.md)

*Defined in [cli/command-base.ts:1](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/cli/command-base.ts#L1)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| _name | `string` |

**Returns:** [CommandBase](_cli_command_base_.commandbase.md)

___

## Properties

<a id="_name"></a>

### `<Private>` _name

**● _name**: *`string`*

*Defined in [cli/command-base.ts:2](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/cli/command-base.ts#L2)*

___

## Methods

<a id="_execute"></a>

### `<Protected>``<Abstract>` _execute

▸ **_execute**(): `Promise`<`void`>

*Defined in [cli/command-base.ts:11](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/cli/command-base.ts#L11)*

**Returns:** `Promise`<`void`>

___
<a id="_log"></a>

### `<Protected>` _log

▸ **_log**(message: *`string`*): `void`

*Defined in [cli/command-base.ts:19](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/cli/command-base.ts#L19)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |

**Returns:** `void`

___
<a id="_logvalue"></a>

### `<Protected>` _logValue

▸ **_logValue**(message: *`string`*, value: *`any`*): `void`

*Defined in [cli/command-base.ts:13](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/cli/command-base.ts#L13)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |
| value | `any` |

**Returns:** `void`

___
<a id="execute"></a>

###  execute

▸ **execute**(): `Promise`<`void`>

*Defined in [cli/command-base.ts:5](https://github.com/kyubisation/angular-server-side-configuration/blob/76af84f/src/cli/command-base.ts#L5)*

**Returns:** `Promise`<`void`>

___

