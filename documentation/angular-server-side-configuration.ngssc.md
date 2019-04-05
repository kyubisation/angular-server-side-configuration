[Home](./index) &gt; [angular-server-side-configuration](./angular-server-side-configuration.md) &gt; [Ngssc](./angular-server-side-configuration.ngssc.md)

## Ngssc interface

Model for ngssc.json.

<b>Signature:</b>

```typescript
export interface Ngssc extends ConfigVariables 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [filePattern](./angular-server-side-configuration.ngssc.filepattern.md) | `string` | Pattern for files that should have variables inserted. |
|  [insertInHead](./angular-server-side-configuration.ngssc.insertinhead.md) | `boolean` | Whether to insert the variables in the head tag or try to replace &lt;<!-- -->!--CONFIG--<!-- -->&gt; |
|  [recursiveMatching](./angular-server-side-configuration.ngssc.recursivematching.md) | `boolean` | Whether to recursively look for files matching filePattern. |

