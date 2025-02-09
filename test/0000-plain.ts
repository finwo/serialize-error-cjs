import t from 'tap';

import { serializeError, deserializeError } from '../src';

t.test('Library exports', t => {
  t.equal(typeof serializeError, 'function', 'Exported serializeError is a function');
  t.equal(typeof deserializeError, 'function', 'Exported deserializeError is a function');
  t.end();
});
