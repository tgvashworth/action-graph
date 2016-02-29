import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import is, { isStrict } from '../src/is';
import createClass from '../src/createClass';

test('importable', (t) => {
    t.ok(is);
    t.ok(isStrict);
});

test('matches two instances of same class', (t) => {
    var Example = createClass();
    t.ok(
        is(new Example(), new Example())
    );
});

test('does not match two instances of different class', (t) => {
    var Example1 = createClass();
    var Example2 = createClass();
    t.notOk(
        is(new Example1(), new Example2())
    );
});

test('does not match two instances with different props', (t) => {
    var Example = createClass();
    t.notOk(
        is(new Example({ a: 1 }), new Example({ b: 2 }))
    );
});

test('matches an instance and its constructor', (t) => {
    var Example = createClass();
    t.ok(
        is(new Example(), Example)
    );
});

test('strict matches two instances of same class', (t) => {
    var Example = createClass();
    t.ok(
        isStrict(new Example(), new Example())
    );
});

test('strict does not match two instances of different class', (t) => {
    var Example1 = createClass();
    var Example2 = createClass();
    t.notOk(
        isStrict(new Example1(), new Example2())
    );
});

test('strict does not match two instances with different props', (t) => {
    var Example = createClass();
    t.notOk(
        isStrict(new Example({ a: 1 }), new Example({ b: 2 }))
    );
});

test('strict does not match an instance and its constructor', (t) => {
    var Example = createClass();
    t.notOk(
        isStrict(new Example(), Example)
    );
});
