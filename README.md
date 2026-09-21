# serialize-error-cjs

> Serialize/deserialize an error into a plain object in commonjs

Loosely based on [serialize-error](https://npmjs.com/package/serialize-error),
but with support for commonjs projects.

Useful if you for example need to `JSON.stringify()` or `process.send()` the error.

## Install

```sh
npm install serialize-error-cjs
```

## Usage

```js
import {serializeError, deserializeError} from 'serialize-error-cjs';

const error = new Error('🦄');

console.log(error);
//=> [Error: 🦄]

const serialized = serializeError(error);

console.log(serialized);
//=> {name: 'Error', message: '🦄', stack: 'Error: 🦄\n    at Object.<anonymous> …'}

const deserialized = deserializeError(serialized);

console.log(deserialized);
//=> [Error: 🦄]
```

### Error constructors

When a serialized error with a known `name` is encountered, it will be deserialized using the corresponding error constructor, while unknown error names will be deserialized as regular errors:

```js
import {deserializeError} from 'serialize-error';

const known = deserializeError({
  name: 'TypeError',
  message: '🦄'
});

console.log(known);
//=> [TypeError: 🦄] <-- Still a TypeError

const unknown = deserializeError({
  name: 'TooManyCooksError',
  message: '🦄'
});

console.log(unknown);
//=> [Error: 🦄] <-- Just a regular Error
```

The [list of known errors](./src/constructors.ts) can be extended globally. This also works if `serialize-error-cjs` is a sub-dependency that's not used directly.

```js
import {errorConstructors} from 'serialize-error-cjs';
import {MyCustomError} from './errors.js'

errorConstructors.set('MyCustomError', MyCustomError)
```

**Note:** the constructor is called during deserialization, without arguments. The common properties (message, stack, code, cause, errors) are written onto the instance afterwards, so the constructor only has to survive being called as `new MyCustomError()`.

If your class sets `this.name` in its constructor, that name is used as the key. If it sets nothing, the class name is used instead. Prefer assigning `this.name` explicitly: a string literal survives minification, a class name does not.

### Constructor options

Constructors that cannot be called as `new MyCustomError()` are configured through `errorConstructorOptions`:

```js
import {errorConstructors, errorConstructorOptions} from 'serialize-error-cjs';
import {MyCustomError} from './errors.js'

errorConstructors.set('MyCustomError', MyCustomError)

// Build the arguments the constructor needs
errorConstructorOptions.set('MyCustomError', {
  args: serialized => [{ message: serialized.message }],
})

// Or skip the constructor entirely, using Object.create instead
errorConstructorOptions.set('MyCustomError', { construct: false })
```

- `construct`: `boolean`, defaults to `true`. When `false`, the instance is built with `Object.create()` and the constructor is never called.
- `args`: `(serialized: SerializedError) => unknown[]`, defaults to `() => []`. Builds the argument list handed to the constructor.

`AggregateError` ships with `args` preconfigured, since its first parameter is a required iterable.

If a constructor throws during deserialization, `serialize-error-cjs` falls back to `Object.create()` and warns once per error name. Deserialization itself never throws.

## API

### serializeError(value: T extends Error): SerializedError

Serialize an `Error` object into a plain object.

- Custom properties **NOT** are preserved.
- Non-enumerable properties are kept non-enumerable (name, message, stack).
- Circular references are **NOT** handled.

### deserializeError&lt;T extends Error&gt;(value: SerializedError): T

Deserialize a plain object or any value into an `Error` object.

- All passed values are interpreted as errors
- Custom properties are **NOT** preserved
- Non-enumerable properties are kept non-enumerable (name, message, stack, cause)
- Circular references are **NOT** handled
- The constructor of the class **IS** called, without arguments, unless configured otherwise
