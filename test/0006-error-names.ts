import test from 'tape';
import { deserializeError, serializeError, errorConstructors } from '../src';

class BareError extends Error {}

class RenamedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'renamed';
  }
}

test('Built-in errors keep their own name', t => {
  t.equal(serializeError(new Error('unicorn')).name, 'Error', 'Error serializes as Error');
  t.equal(serializeError(new TypeError('unicorn')).name, 'TypeError', 'TypeError serializes as TypeError');
  t.end();
});

test('Bare Error subclasses fall back to their class name', t => {
  errorConstructors.set('BareError', BareError as ErrorConstructor);

  const serialized = serializeError(new BareError('unicorn'));
  t.equal(serialized.name, 'BareError', 'Serialized name falls back to the class name');

  const deserialized = deserializeError<BareError>(serialized);
  t.ok(deserialized instanceof BareError, 'Deserialized is an instance of BareError');
  t.equal(deserialized.message, 'unicorn', 'Deserialized message matches original');

  errorConstructors.delete('BareError');
  t.end();
});

test('An assigned name wins over the class name', t => {
  t.equal(serializeError(new RenamedError('unicorn')).name, 'renamed', 'Name assigned in the constructor is preferred');

  const adhoc = new Error('unicorn');
  adhoc.name = 'AdHocError';
  t.equal(serializeError(adhoc).name, 'AdHocError', 'Name assigned on the instance is preferred');

  t.end();
});

test('DOMException always serializes as DOMException', t => {
  const DOMException = globalThis.DOMException;

  if (!DOMException) {
    t.pass('DOMException is not available in this runtime');
    t.end();
    return;
  }

  t.equal(serializeError(new DOMException('unicorn')).name, 'DOMException', 'Unnamed DOMException');
  t.equal(serializeError(new DOMException('unicorn', 'AbortError')).name, 'DOMException', 'Named DOMException');
  t.end();
});
