import test from 'ava';
import createClass from '../src/createClass';

test('importable', (t) => {
    t.ok(createClass);
});
