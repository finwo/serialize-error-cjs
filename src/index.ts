import { errorConstructors } from './constructors';
export { errorConstructors };

const getErrorConstructor = (name: string) => errorConstructors.get(name) ?? Error;

const commonProperties: { property: string, enumerable: boolean }[] = [
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
  code?: string|number;
  cause?: string;
};

export function serializeError(subject: Error): SerializedError {
  const data: SerializedError = {
    name   : 'Error',
    message: '',
    stack  : '',
  };
  for(const { property } of commonProperties) {
    if (!(property in subject)) continue;
    data[property] = subject[property];
  }
  if (globalThis.DOMException && (subject instanceof globalThis.DOMException)) {
    data.name = 'DOMException';
  } else {
    data.name = Object.getPrototypeOf(subject).name;
  }
  return data;
}

export function deserializeError(subject: SerializedError): Error {
  const fn = getErrorConstructor(subject.name);
  const output = new fn();

  for(const { property, enumerable } of commonProperties) {
    if (!(property in subject)) continue;
    Object.defineProperty(output, property, {
      value: subject[property],
      enumerable,
      configurable: true,
      writable: true,
    });
  }

  return output;
}

