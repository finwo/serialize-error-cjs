const list: [string, ErrorConstructor][] = [
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  globalThis.DOMException,
  globalThis.AssertionError,
  globalThis.SystemError,
]
  .filter(Boolean)
  .map(
    constructor => [constructor.name, constructor],
  );

export const errorConstructors = new Map(list);
