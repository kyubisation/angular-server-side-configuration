[angular-server-side-configuration](../README.md) > ["cli/wrap-aot"](../modules/_cli_wrap_aot_.md) > [WrapAotCommand](../classes/_cli_wrap_aot_.wrapaotcommand.md)

# Class: WrapAotCommand

## Hierarchy

 [CommandBase](_cli_command_base_.commandbase.md)

**↳ WrapAotCommand**

## Index

### Constructors

* [constructor](_cli_wrap_aot_.wrapaotcommand.md#constructor)

### Properties

* [_directory](_cli_wrap_aot_.wrapaotcommand.md#_directory)
* [_dist](_cli_wrap_aot_.wrapaotcommand.md#_dist)
* [_environmentFile](_cli_wrap_aot_.wrapaotcommand.md#_environmentfile)
* [_ngCommand](_cli_wrap_aot_.wrapaotcommand.md#_ngcommand)
* [_tokenCounter](_cli_wrap_aot_.wrapaotcommand.md#_tokencounter)

### Methods

* [_applyReplacements](_cli_wrap_aot_.wrapaotcommand.md#_applyreplacements)
* [_createReplacements](_cli_wrap_aot_.wrapaotcommand.md#_createreplacements)
* [_execute](_cli_wrap_aot_.wrapaotcommand.md#_execute)
* [_loadTypescript](_cli_wrap_aot_.wrapaotcommand.md#_loadtypescript)
* [_log](_cli_wrap_aot_.wrapaotcommand.md#_log)
* [_logValue](_cli_wrap_aot_.wrapaotcommand.md#_logvalue)
* [_resolveExpression](_cli_wrap_aot_.wrapaotcommand.md#_resolveexpression)
* [_resolveReplacements](_cli_wrap_aot_.wrapaotcommand.md#_resolvereplacements)
* [_revertReplacements](_cli_wrap_aot_.wrapaotcommand.md#_revertreplacements)
* [_spawnCommand](_cli_wrap_aot_.wrapaotcommand.md#_spawncommand)
* [_validateOptions](_cli_wrap_aot_.wrapaotcommand.md#_validateoptions)
* [execute](_cli_wrap_aot_.wrapaotcommand.md#execute)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new WrapAotCommand**(options: *`object`*): [WrapAotCommand](_cli_wrap_aot_.wrapaotcommand.md)

*Overrides [CommandBase](_cli_command_base_.commandbase.md).[constructor](_cli_command_base_.commandbase.md#constructor)*

*Defined in [cli/wrap-aot.ts:13](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L13)*

**Parameters:**

**options: `object`**

| Name | Type |
| ------ | ------ |
| directory | `string` |
| `Optional` dist | `undefined` | `string` |
| `Optional` environmentFile | `undefined` | `string` |
| ngCommands | `string`[] |

**Returns:** [WrapAotCommand](_cli_wrap_aot_.wrapaotcommand.md)

___

## Properties

<a id="_directory"></a>

### `<Private>` _directory

**● _directory**: *`string`*

*Defined in [cli/wrap-aot.ts:10](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L10)*

___
<a id="_dist"></a>

### `<Private>` _dist

**● _dist**: *`string`*

*Defined in [cli/wrap-aot.ts:12](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L12)*

___
<a id="_environmentfile"></a>

### `<Private>` _environmentFile

**● _environmentFile**: *`string`*

*Defined in [cli/wrap-aot.ts:11](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L11)*

___
<a id="_ngcommand"></a>

### `<Private>` _ngCommand

**● _ngCommand**: *`string`[]*

*Defined in [cli/wrap-aot.ts:9](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L9)*

___
<a id="_tokencounter"></a>

### `<Private>` _tokenCounter

**● _tokenCounter**: *`number`* = 0

*Defined in [cli/wrap-aot.ts:13](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L13)*

___

## Methods

<a id="_applyreplacements"></a>

### `<Private>` _applyReplacements

▸ **_applyReplacements**(fileContent: *`string`*, replacements: *`object`[]*): `void`

*Defined in [cli/wrap-aot.ts:82](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L82)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fileContent | `string` |
| replacements | `object`[] |

**Returns:** `void`

___
<a id="_createreplacements"></a>

### `<Private>` _createReplacements

▸ **_createReplacements**(fileContent: *`string`*): `Promise`<`object`[]>

*Defined in [cli/wrap-aot.ts:49](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L49)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fileContent | `string` |

**Returns:** `Promise`<`object`[]>

___
<a id="_execute"></a>

### `<Protected>` _execute

▸ **_execute**(): `Promise`<`void`>

*Overrides [CommandBase](_cli_command_base_.commandbase.md).[_execute](_cli_command_base_.commandbase.md#_execute)*

*Defined in [cli/wrap-aot.ts:32](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L32)*

**Returns:** `Promise`<`void`>

___
<a id="_loadtypescript"></a>

### `<Protected>` _loadTypescript

▸ **_loadTypescript**(): `Promise`<`object`>

*Defined in [cli/wrap-aot.ts:64](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L64)*

**Returns:** `Promise`<`object`>

___
<a id="_log"></a>

### `<Protected>` _log

▸ **_log**(message: *`string`*): `void`

*Inherited from [CommandBase](_cli_command_base_.commandbase.md).[_log](_cli_command_base_.commandbase.md#_log)*

*Defined in [cli/command-base.ts:19](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/command-base.ts#L19)*

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

*Defined in [cli/command-base.ts:13](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/command-base.ts#L13)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |
| value | `any` |

**Returns:** `void`

___
<a id="_resolveexpression"></a>

### `<Private>` _resolveExpression

▸ **_resolveExpression**(node: *`Node`*, SyntaxKind: *`object`*): `string`

*Defined in [cli/wrap-aot.ts:88](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L88)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| node | `Node` |
| SyntaxKind | `object` |

**Returns:** `string`

___
<a id="_resolvereplacements"></a>

### `<Private>` _resolveReplacements

▸ **_resolveReplacements**(node: *`Node`*): `Node`[]

*Defined in [cli/wrap-aot.ts:69](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L69)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| node | `Node` |

**Returns:** `Node`[]

___
<a id="_revertreplacements"></a>

### `<Private>` _revertReplacements

▸ **_revertReplacements**(fileContent: *`string`*, replacements: *`object`[]*): `void`

*Defined in [cli/wrap-aot.ts:104](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L104)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fileContent | `string` |
| replacements | `object`[] |

**Returns:** `void`

___
<a id="_spawncommand"></a>

### `<Protected>` _spawnCommand

▸ **_spawnCommand**(): `Promise`<`void`>

*Defined in [cli/wrap-aot.ts:95](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L95)*

**Returns:** `Promise`<`void`>

___
<a id="_validateoptions"></a>

### `<Private>` _validateOptions

▸ **_validateOptions**(): `void`

*Defined in [cli/wrap-aot.ts:41](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/wrap-aot.ts#L41)*

**Returns:** `void`

___
<a id="execute"></a>

###  execute

▸ **execute**(): `Promise`<`void`>

*Inherited from [CommandBase](_cli_command_base_.commandbase.md).[execute](_cli_command_base_.commandbase.md#execute)*

*Defined in [cli/command-base.ts:5](https://github.com/kyubisation/angular-server-side-configuration/blob/dfc956e/src/cli/command-base.ts#L5)*

**Returns:** `Promise`<`void`>

___

