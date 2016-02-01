import test from 'ava';
import createAction from '../src/createAction';

test('importable', (t) => {
    t.ok(createAction);
});
