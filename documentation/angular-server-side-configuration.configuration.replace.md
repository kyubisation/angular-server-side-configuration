[Home](./index) &gt; [angular-server-side-configuration](./angular-server-side-configuration.md) &gt; [Configuration](./angular-server-side-configuration.configuration.md) &gt; [replace](./angular-server-side-configuration.configuration.replace.md)

## Configuration.replace() method

Add a replacement function for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively. The function receives the file content and the file name as parameters and returns the file content with the replacement applied.

<b>Signature:</b>

```typescript
replace(replacement: (fileContent: string, fileName: string) => string): this;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  replacement | `(fileContent: string, fileName: string) => string` | The replacement function. |

<b>Returns:</b>

`this`

This instance.

