# memo-obj

A structural memoization utility for JavaScript/TypeScript objects using WeakRefs and FinalizationRegistry.

## Features

- Deep structural equality memoization  
- Handles circular references  
- Uses native ES2021+ features (WeakRef, FinalizationRegistry)  

## Usage

```ts
import memoObj from "memo-obj";

const a = { foo: 1, bar: { baz: 2 } };
const b = { foo: 1, bar: { baz: 2 } };

console.log(memoObj(a) === memoObj(b)); // true
````

## Requirements

Node.js 16+

## Running Tests

```sh
npm test
```
