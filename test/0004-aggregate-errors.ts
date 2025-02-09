import test from 'tape';
import {deserializeError, serializeError} from '../src';

// Minimally polyfill AggregateError
if (!globalThis.AggregateError) {
  class AggregateError extends Error {
    constructor(private errors: Error[], message?: string) {
      super(message);
    };
  }
  globalThis.AggregateError = AggregateError;
}

function randomString(length: number): string {
  let output = '';
  while(output.length < length) output += Math.random().toString(36).substring(2);
  return output.substring(0, length);
}

test('Aggregate errors can be converted back-and-forth', t => {
  const AggregateError = globalThis.AggregateError;

  const err = new AggregateError([
    new Error(randomString(16)),
    new EvalError(randomString(16)),
    new RangeError(randomString(16)),
    new ReferenceError(randomString(16)),
    new SyntaxError(randomString(16)),
    new TypeError(randomString(16)),
    new URIError(randomString(16)),
  ]);

  t.ok(err instanceof AggregateError, 'Pre-serialization is an instance of AggregateError');

  const serialized = serializeError(err);
  t.ok(serialized, 'Serialized error is truthy');
  t.equal(typeof serialized, 'object', 'Serialized error is an object');
  t.equal(serialized.name, AggregateError.name, 'Serialized name matches constructor name');

  const deserialized = deserializeError<typeof AggregateError>(serialized);
  t.ok(deserialized instanceof AggregateError, `Deserialized is an instance of ${AggregateError.name}`);

  t.equal(deserialized.message, err.message, 'Deserialized message matches original');
  for(let i=0; i < err.errors.length; i++) {
    t.equal(Object.getPrototypeOf(err.errors[i]), Object.getPrototypeOf(deserialized.errors[i]), `Prototype match for entry ${i} in AggregateError`);
    t.equal(err.errors[i].message, deserialized.errors[i].message, `Message match for entry ${i} in AggregateError`);
  }

  t.end();
});
