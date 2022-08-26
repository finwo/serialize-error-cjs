import { errorConstructors } from './constructors';
export { errorConstructors };

const getErrorConstructor = (name: string) => errorConstructors.get(name) ?? Error;

const commonProperties: { property: string, enumerable: boolean }[] = [
  {
    property: 'name',
    enumerable: false,
  },
  {
    property: 'message',
    enumerable: false,
  },
  {
    property: 'stack',
    enumerable: false,
  },
  {
    property: 'code',
    enumerable: true,
  },
  {
    property: 'cause',
    enumerable: false,
  },
];

export type SerializedError = {
  name: string;
  message: string;
  stack: string;
};

export function serializeError(subject: Error): SerializedError {
  if (!(subject instanceof Error)) {
    throw new Error('Non-error objects can not be serialized by this package');
  }
  const data = {};
  for(const { property } of commonProperties) {
    data[property] = subject[property];
  }
  return data as SerializedError;
}

export function deserializeError(subject: SerializedError): Error {
  const fn = getErrorConstructor(subject.name);
  const output = new fn();

  for(const { property, enumerable } of commonProperties) {
    Object.defineProperty(output, property, {
      value: subject[property],
      enumerable,
      configurable: true,
      writable: true,
    });
  }

  return output;
}

