[Home](./index) &gt; [angular-server-side-configuration](./angular-server-side-configuration.md) &gt; [Configuration](./angular-server-side-configuration.configuration.md) &gt; [discoverVariables](./angular-server-side-configuration.configuration.discovervariables.md)

## Configuration.discoverVariables() method

Search for variables in the received file content. Should return an array of found variable names.

<b>Signature:</b>

```typescript
protected abstract discoverVariables(fileContent: string): string[];
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  fileContent | `string` | The file content that should be searched. |

<b>Returns:</b>

`string[]`

