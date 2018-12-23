[angular-server-side-configuration](../README.md) > ["environment-variables-configuration"](../modules/_environment_variables_configuration_.md)

# External module: "environment-variables-configuration"

## Index

### Classes

* [EnvironmentVariablesConfiguration](../classes/_environment_variables_configuration_.environmentvariablesconfiguration.md)

### Variables

* [readFileAsync](_environment_variables_configuration_.md#readfileasync)
* [writeFileAsync](_environment_variables_configuration_.md#writefileasync)

### Functions

* [environmentVariablesDiscoveryFunction](_environment_variables_configuration_.md#environmentvariablesdiscoveryfunction)

---

## Variables

<a id="readfileasync"></a>

### `<Const>` readFileAsync

**● readFileAsync**: *`__promisify__`* =  promisify(readFile)

*Defined in [environment-variables-configuration.ts:4](https://github.com/kyubisation/angular-server-side-configuration/blob/c276a03/src/environment-variables-configuration.ts#L4)*

___
<a id="writefileasync"></a>

### `<Const>` writeFileAsync

**● writeFileAsync**: *`__promisify__`* =  promisify(writeFile)

*Defined in [environment-variables-configuration.ts:5](https://github.com/kyubisation/angular-server-side-configuration/blob/c276a03/src/environment-variables-configuration.ts#L5)*

___

## Functions

<a id="environmentvariablesdiscoveryfunction"></a>

### `<Const>` environmentVariablesDiscoveryFunction

▸ **environmentVariablesDiscoveryFunction**(fileContent: *`string`*): `string`[]

*Defined in [environment-variables-configuration.ts:7](https://github.com/kyubisation/angular-server-side-configuration/blob/c276a03/src/environment-variables-configuration.ts#L7)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fileContent | `string` |

**Returns:** `string`[]

___

