[Home](./index) &gt; [angular-server-side-configuration](./angular-server-side-configuration.md) &gt; [Configuration](./angular-server-side-configuration.configuration.md) &gt; [insertVariables](./angular-server-side-configuration.configuration.insertvariables.md)

## Configuration.insertVariables() method

Replace the placeholder with the populated variables wrapped in an IIFE inside a script tag.

<b>Signature:</b>

```typescript
insertVariables(placeholder?: string | RegExp): this;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  placeholder | `string | RegExp` | The placeholder to replace with the populated variables. (Defaults to &amp;lt;!--CONFIG--&amp;gt;.) |

<b>Returns:</b>

`this`

This instance.

