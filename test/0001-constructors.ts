import test from 'tape';

import { errorConstructors } from '../src/constructors';

const expectedConstructors = [
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
].filter(c => c);

test('Default error constructors', t => {
  t.ok(errorConstructors instanceof Map, 'Exported errorConstructors is a map');

  for(const expectedConstructor of expectedConstructors) {
    t.ok(errorConstructors.has(expectedConstructor.name), `Default constructor list contains '${expectedConstructor.name}'`);
  }

  t.end();
});

