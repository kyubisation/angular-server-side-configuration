[Home](./index) &gt; [angular-server-side-configuration](./angular-server-side-configuration.md) &gt; [Configuration](./angular-server-side-configuration.configuration.md) &gt; [applyAndSaveTo](./angular-server-side-configuration.configuration.applyandsaveto.md)

## Configuration.applyAndSaveTo() method

Apply the replacements to the content of the given file and save it asynchronously.

<b>Signature:</b>

```typescript
applyAndSaveTo(file: string): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  file | `string` | The HTML file to apply the replacements to. |

<b>Returns:</b>

`Promise<void>`

A promise, which resolves after the file has had the replacements applied.

