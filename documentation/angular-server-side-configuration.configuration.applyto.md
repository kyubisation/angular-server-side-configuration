[Home](./index) &gt; [angular-server-side-configuration](./angular-server-side-configuration.md) &gt; [Configuration](./angular-server-side-configuration.configuration.md) &gt; [applyTo](./angular-server-side-configuration.configuration.applyto.md)

## Configuration.applyTo() method

Apply the replacements to the content of the given file and return the resulting content as a promise.

<b>Signature:</b>

```typescript
applyTo(file: string): Promise<string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  file | `string` | The HTML file to apply the replacements to. |

<b>Returns:</b>

`Promise<string>`

A promise, which resolves to the file content with the replacements applied.

