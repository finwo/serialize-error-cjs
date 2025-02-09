import test from 'tape';

import { serializeError, deserializeError } from '../src';

test('Library exports', t => {
  t.equal(typeof serializeError, 'function', 'Exported serializeError is a function');
  t.equal(typeof deserializeError, 'function', 'Exported deserializeError is a function');
  t.end();
});
