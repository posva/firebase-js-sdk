<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@firebase/auth-types](./auth-types.md) &gt; [PhoneMultiFactorGenerator](./auth-types.phonemultifactorgenerator.md) &gt; [assertion](./auth-types.phonemultifactorgenerator.assertion.md)

## PhoneMultiFactorGenerator.assertion() method

Provides a [PhoneMultiFactorAssertion](./auth-types.phonemultifactorassertion.md) to confirm ownership of the phone second factor.

<b>Signature:</b>

```typescript
static assertion(
    phoneAuthCredential: PhoneAuthCredential
  ): PhoneMultiFactorAssertion;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  phoneAuthCredential | [PhoneAuthCredential](./auth-types.phoneauthcredential.md) | A credential provided by [PhoneAuthProvider.credential()](./auth.phoneauthprovider.credential.md)<!-- -->. |

<b>Returns:</b>

[PhoneMultiFactorAssertion](./auth-types.phonemultifactorassertion.md)

A [PhoneMultiFactorAssertion](./auth-types.phonemultifactorassertion.md) which can be used with [MultiFactorResolver.resolveSignIn()](./auth-types.multifactorresolver.resolvesignin.md)
