import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import sameActionsList from '../src/sameActionsList';
import createClass from '../src/createClass';
import is from '../src/is';

test('importable', (t) => {
    t.ok(createClass);
});

test('createClass handles no spec', (t) => {
    t.ok(createClass());
});

test('createClass has default static displayName', (t) => {
    t.same(createClass({}).displayName, '');
});

test('createClass has default instance displayName', (t) => {
    var i = new createClass({});
    t.same(i.displayName, '');
});

test('createClass copies displayName to static property', (t) => {
    t.same(
        createClass({ displayName: 'The Example' }).displayName,
        'The Example'
    );
});

test('createClass copies displayName to instance property', (t) => {
    var i = createClass({ displayName: 'The Example' });
    t.same(
        i.displayName,
        'The Example'
    );
});

test(
    'createClass has default getDescription that returns the displayName',
    (t) => {
        var Example = createClass({ displayName: 'The Example' });
        var example = new Example();
        t.same(
            example.getDescription(),
            'The Example'
        );
    }
);

test(
    'createClass can overwrite getDescription',
    (t) => {
        var Example = createClass({
            getDescription: () => 'An action'
        });
        var example = new Example();
        t.same(
            example.getDescription(),
            'An action'
        );
    }
);

test(
    'createClass has default getDefaultFixtures',
    (t) => {
        var Example = createClass();
        var example = new Example();
        t.ok(
            Immutable.is(
                example.getDefaultFixtures(),
                fromJS({})
            )
        );
    }
);

test(
    'createClass can overwrite getDefaultFixtures',
    (t) => {
        var Example = createClass({
            getDefaultFixtures: () => ({ a: 1 })
        });
        var example = new Example();
        t.ok(
            Immutable.is(
                example.getDefaultFixtures(),
                fromJS({ a: 1 })
            )
        );
    }
);


test(
    'instantiation merges input with default fixtures',
    (t) => {
        var Example = createClass({
            getDefaultFixtures: () => ({ a: 1 })
        });
        var example = new Example({
            b: 2
        });
        t.ok(
            Immutable.is(
                example.fixtures,
                fromJS({
                    a: 1,
                    b: 2
                })
            )
        );
    }
);

test(
    'createClass has default getDependencies',
    (t) => {
        var Example = createClass();
        var example = new Example();
        t.ok(
            Immutable.is(
                example.getDependencies(),
                fromJS([])
            )
        );
    }
);

test(
    'createClass can overwrite getDependencies',
    (t) => {
        var Dep = createClass();
        var Example = createClass({
            getDependencies: () => ([ new Dep() ])
        });
        var example = new Example();
        t.ok(
            sameActionsList(
                example.getDependencies(),
                fromJS([ new Dep() ])
            )
        );
    }
);

test(
    'createClass can overwrite getDependencies with fixtures',
    (t) => {
        var Dep = createClass();
        var Example = createClass({
            getDependencies: () => ([ new Dep({ a: 10 }) ])
        });
        var example = new Example();
        t.ok(
            sameActionsList(
                example.getDependencies(),
                fromJS([ new Dep({ a: 10 }) ])
            )
        );
    }
);


test(
    'createClass calls methods with correct context',
    (t) => {
        t.plan(3);

        var Example = createClass({
            getDescription() {
                t.same(this.constructor, Example);
                return '';
            },

            getDefaultFixtures() {
                t.same(this.constructor, Example);
                return {};
            },

            getDependencies() {
                t.same(this.constructor, Example);
                return [];
            }
        });
        var example = new Example();
        example.getDescription();
        example.getDependencies();
    }
);
