Project: /docs/reference/js/_project.yaml
Book: /docs/reference/_book.yaml
page_type: reference

{% comment %}
DO NOT EDIT THIS FILE!
This is generated by the JS SDK team, and any local changes will be
overwritten. Changes should be made in the source code at
https://github.com/firebase/firebase-js-sdk
{% endcomment %}

# IndexConfiguration interface
> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

A list of Firestore indexes to speed up local query execution.

See [JSON Format](https://firebase.google.com/docs/reference/firestore/indexes/#json_format) for a description of the format of the index definition.

<b>Signature:</b>

```typescript
export declare interface IndexConfiguration 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [indexes](./firestore_.indexconfiguration.md#indexconfigurationindexes) | [Index](./firestore_.index.md#index_interface)<!-- -->\[\] | <b><i>(BETA)</i></b> A list of all Firestore indexes. |

## IndexConfiguration.indexes

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

A list of all Firestore indexes.

<b>Signature:</b>

```typescript
readonly indexes?: Index[];
```