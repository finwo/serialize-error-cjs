import test from 'tape';
import { deserializeError, serializeError, errorConstructors, errorConstructorOptions } from '../src';

class ConstructedError extends Error {
  ran: boolean;
  constructor(message?: string) {
    super(message);
    this.name = 'ConstructedError';
    this.ran  = true;
  }
}

class StrictError extends Error {
  tag: string;
  constructor(options: { message: string, tag: string }) {
    super(options.message);
    this.name = 'StrictError';
    this.tag  = options.tag;
  }
}

const register = (name: string, constructor: unknown) => {
  errorConstructors.set(name, constructor as ErrorConstructor);
};

const unregister = (name: string) => {
  errorConstructors.delete(name);
  errorConstructorOptions.delete(name);
};

test('The constructor is called by default', t => {
  register('ConstructedError', ConstructedError);

  const serialized = serializeError(new ConstructedError('unicorn'));
  t.equal(serialized.name, 'ConstructedError', 'Serialized name matches the assigned name');

  const deserialized = deserializeError<ConstructedError>(serialized);
  t.ok(deserialized instanceof ConstructedError, 'Deserialized is an instance of ConstructedError');
  t.equal(deserialized.ran, true, 'Constructor was called during deserialization');
  t.equal(deserialized.message, 'unicorn', 'Deserialized message matches original');

  unregister('ConstructedError');
  t.end();
});

test('construct:false builds through Object.create instead', t => {
  register('ConstructedError', ConstructedError);
  errorConstructorOptions.set('ConstructedError', { construct: false });

  const serialized   = serializeError(new ConstructedError('unicorn'));
  const deserialized = deserializeError<ConstructedError>(serialized);

  t.ok(deserialized instanceof ConstructedError, 'Deserialized is still an instance of ConstructedError');
  t.equal(deserialized.ran, undefined, 'Constructor was not called during deserialization');
  t.equal(deserialized.message, 'unicorn', 'Deserialized message matches original');

  unregister('ConstructedError');
  t.end();
});

test('The args builder feeds the constructor', t => {
  register('StrictError', StrictError);
  errorConstructorOptions.set('StrictError', {
    args: subject => [{ message: subject.message, tag: 'from-args' }],
  });

  const serialized = serializeError(new StrictError({ message: 'unicorn', tag: 'original' }));
  t.equal(serialized.name, 'StrictError', 'Serialized name matches the assigned name');

  const deserialized = deserializeError<StrictError>(serialized);
  t.ok(deserialized instanceof StrictError, 'Deserialized is an instance of StrictError');
  t.equal(deserialized.tag, 'from-args', 'Constructor received the built arguments');
  t.equal(deserialized.message, 'unicorn', 'Deserialized message matches original');

  unregister('StrictError');
  t.end();
});

test('A throwing constructor falls back to Object.create and warns once', t => {
  register('StrictError', StrictError);

  const serialized = serializeError(new StrictError({ message: 'unicorn', tag: 'original' }));

  const warnings: unknown[][] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => { warnings.push(args); };

  const deserialized = deserializeError<StrictError>(serialized);
  deserializeError<StrictError>(serialized);
  deserializeError<StrictError>(serialized);

  console.warn = originalWarn;

  t.ok(deserialized instanceof StrictError, 'Deserialized is still an instance of StrictError');
  t.equal(deserialized.tag, undefined, 'Constructor did not complete');
  t.equal(deserialized.message, 'unicorn', 'Deserialized message matches original');
  t.equal(warnings.length, 1, 'Warning is emitted once across repeated deserializations');

  unregister('StrictError');
  t.end();
});
