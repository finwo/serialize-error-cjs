import { errorConstructors, errorConstructorOptions } from './constructors';
import type { SerializedError, ErrorConstructorOptions } from './types';

export { errorConstructors, errorConstructorOptions };
export type { SerializedError, ErrorConstructorOptions };

const getErrorConstructor = (name: string) => errorConstructors.get(name) ?? Error;

const warnedConstructors = new Set<string>();

function warnConstructorFailure(name: string, cause: unknown): void {
  if (warnedConstructors.has(name)) return;
  warnedConstructors.add(name);
  if (typeof console === 'undefined') return;
  if (typeof console.warn !== 'function') return;
  console.warn(
    `serialize-error-cjs: the '${name}' constructor threw during deserialization, falling back to ` +
    'Object.create. Configure errorConstructorOptions for this name to silence this warning.',
    cause,
  );
}

function getErrorName(subject: Error): string {
  if (globalThis.DOMException && (subject instanceof globalThis.DOMException)) {
    return 'DOMException';
  }
  // An assigned name is a string literal, so unlike a class name it survives minification.
  const assigned = subject.name;
  if (assigned && assigned !== 'Error') return assigned;
  // Nothing assigned, fall back to the class name to catch bare Error subclasses.
  try {
    return Object.getPrototypeOf(subject)?.constructor?.name || assigned || 'Error';
  } catch {
    return assigned || 'Error';
  }
}

const commonProperties: { name: string, descriptor: Partial<PropertyDescriptor>, deserialize?: (_:any)=>any, serialize?: (_:any)=>any }[] = [
  {
    name: 'message',
    descriptor: {
      enumerable: false,
      configurable: true,
      writable: true,
    },
  },
  {
    name: 'stack',
    descriptor: {
      enumerable: false,
      configurable: true,
      writable: true,
    },
  },
  {
    name: 'code',
    descriptor: {
      enumerable: true,
      configurable: true,
      writable: true,
    },
  },
  {
    name: 'cause',
    descriptor: {
      enumerable: false,
      configurable: true,
      writable: true,
    },
  },
  {
    name: 'errors',
    descriptor: {
      enumerable: false,
      configurable: true,
      writable: true,
    },
    deserialize: (errors: SerializedError[]) => errors.map(error => deserializeError(error)),
    serialize: (errors: Error[]) => errors.map(error => serializeError(error)),
  },
];

export function serializeError(subject: Error): SerializedError {
  const data: SerializedError = {
    name   : 'Error',
    message: '',
    stack  : '',
  };
  for(const prop of commonProperties) {
    if (!(prop.name in subject)) continue;
    let value = subject[prop.name];
    if (prop.serialize) value = prop.serialize(value);
    data[prop.name] = value;
  }
  data.name = getErrorName(subject);
  return data;
}

export function deserializeError<T extends Error>(subject: SerializedError): T {
  const con     = getErrorConstructor(subject.name);
  const options = errorConstructorOptions.get(subject.name) ?? {};

  let output;
  if (options.construct === false) {
    output = Object.create(con.prototype);
  } else {
    try {
      output = Reflect.construct(con, options.args ? options.args(subject) : []);
    } catch(e) {
      warnConstructorFailure(subject.name, e);
      output = Object.create(con.prototype);
    }
  }

  for(const prop of commonProperties) {
    if (!(prop.name in subject)) continue;

    let value = subject[prop.name];
    if (prop.deserialize) value = prop.deserialize(value);

    Object.defineProperty(output, prop.name, {
      ...prop.descriptor,
      value: value,
    });
  }

  return output;
}

