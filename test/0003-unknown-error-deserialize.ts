import test from 'tape';
import {deserializeError, serializeError} from '../src';

function randomString(length: number): string {
  let output = '';
  while(output.length < length) output += Math.random().toString(36).substring(2);
  return output.substring(0, length);
}

test('Singular errors can be converted back-and-forth', t => {

  const testError = serializeError(new Error(randomString(16)));
  testError.name  = 'UnknownError';

  const deserialized = deserializeError(testError);
  t.ok(deserialized instanceof Error, 'Deserializing unknown error type returns a plain Error');

  t.end();
});

