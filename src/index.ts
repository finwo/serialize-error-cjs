import { errorConstructors } from './constructors';
export { errorConstructors };

const getErrorConstructor = (name: string) => errorConstructors.get(name) ?? Error;

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
  for(const prop of commonProperties) {
    if (!(prop.name in subject)) continue;
    let value = subject[prop.name];
    if (prop.serialize) value = prop.serialize(value);
    data[prop.name] = value;
  }
  if (globalThis.DOMException && (subject instanceof globalThis.DOMException)) {
    data.name = 'DOMException';
  } else {
    data.name = Object.getPrototypeOf(subject).name;
  }
  return data;
}

export function deserializeError<T extends Error>(subject: SerializedError): T {
  const con = getErrorConstructor(subject.name);
  const output = Object.create(con.prototype);

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

