<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@firebase/auth-types](./auth-types.md) &gt; [ActionCodeSettings](./auth-types.actioncodesettings.md) &gt; [url](./auth-types.actioncodesettings.url.md)

## ActionCodeSettings.url property

Sets the link continue/state URL.

<b>Signature:</b>

```typescript
url: string;
```

## Remarks

This has different meanings in different contexts: - When the link is handled in the web action widgets, this is the deep link in the `continueUrl` query parameter. - When the link is handled in the app directly, this is the `continueUrl` query parameter in the deep link of the Dynamic Link.
