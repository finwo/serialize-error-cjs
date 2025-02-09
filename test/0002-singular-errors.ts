import * as t from 'tape';
import {deserializeError, serializeError} from '../src';

const singularConstructors = [
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
].filter(c => c);

function randomString(length: number): string {
  let output = '';
  while(output.length < length) output += Math.random().toString(36).substring(2);
  return output.substring(0, length);
}

t.test('Singular errors can be converted back-and-forth', t => {
  for(const singularConstructor of singularConstructors) {
    const err = new singularConstructor(randomString(16));
    t.ok(err instanceof singularConstructor, 'Pre-serialization is an instance of given constructor');

    const serialized = serializeError(err);
    t.ok(serialized, 'Serialized error is truthy');
    t.equal(typeof serialized, 'object', 'Serialized error is an object');
    t.equal(serialized.name, singularConstructor.name, 'Serialized name matches constructor name');

    const deserialized = deserializeError(serialized);
    t.ok(deserialized instanceof singularConstructor, 'Deserialized is an instance of given constructor');

    t.equal(deserialized.message, err.message, 'Deserialized message matches original');
  }

  t.end();
});

