import test from 'tape';
import {deserializeError, serializeError} from '../src';

function randomString(length: number): string {
  let output = '';
  while(output.length < length) output += Math.random().toString(36).substring(2);
  return output.substring(0, length);
}

function withCause(error: Error, cause: unknown): Error {
  (error as any).cause = cause;
  return error;
}

test('Error causes can be converted back-and-forth', t => {
  const cause = new TypeError(randomString(16));
  const err   = withCause(new Error(randomString(16)), cause);

  const serialized = serializeError(err);
  const wireCause: any = serialized.cause;
  t.ok(wireCause, 'Serialized cause is present');
  t.notEqual(typeof wireCause, 'string', 'Serialized cause is not a bare string');
  t.equal(wireCause && wireCause.name, 'TypeError', 'Serialized cause keeps its name');
  t.equal(wireCause && wireCause.message, cause.message, 'Serialized cause keeps its message');

  // Simulate a JSON round-trip, like the data crossing a wire
  const wire = JSON.parse(JSON.stringify(serialized));

  const deserialized = deserializeError(wire);
  const restoredCause: any = (deserialized as any).cause;
  t.ok(restoredCause instanceof TypeError, 'Deserialized cause is an instance of TypeError');
  t.equal(restoredCause && restoredCause.message, cause.message, 'Deserialized cause message matches original');
  t.ok(restoredCause && restoredCause.stack, 'Deserialized cause has a stack');

  t.end();
});

test('Non-error causes are passed through', t => {
  const err = withCause(new Error(randomString(16)), 'plain string cause');

  const serialized = serializeError(err);
  t.equal(serialized.cause as any, 'plain string cause', 'String cause survives serialization');

  const deserialized = deserializeError(serialized);
  t.equal((deserialized as any).cause, 'plain string cause', 'String cause survives deserialization');

  t.end();
});
