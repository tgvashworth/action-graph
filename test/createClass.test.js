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
    t.same(createClass({}).displayName, 'unnamed action');
});

test('createClass has default instance displayName', (t) => {
    var i = new createClass({});
    t.same(i.displayName, 'unnamed action');
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
    'createClass passes props to getDescription',
    (t) => {
        t.plan(1);
        var Example = createClass({
            getDescription(props) {
                t.same(props, { a: 1 });
            }
        });
        var example = new Example({ a: 1 });
        example.getDescription();
    }
);

test(
    'createClass has default getDefaultProps',
    (t) => {
        var Example = createClass();
        var example = new Example();
        t.same(
            example.getDefaultProps(),
            {}
        );
    }
);

test(
    'createClass can overwrite getDefaultProps',
    (t) => {
        var Example = createClass({
            getDefaultProps: () => ({ a: 1 })
        });
        var example = new Example();
        t.same(
            example.getDefaultProps(),
            { a: 1 }
        );
    }
);


test(
    'instantiation merges input with default props',
    (t) => {
        var Example = createClass({
            getDefaultProps: () => ({ a: 1 })
        });
        var example = new Example({
            b: 2
        });
        t.same(
            example.props,
            { a: 1, b: 2 }
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
    'createClass can overwrite getDependencies with props',
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
    'createClass has default run which passes arg',
    (t) => {
        var Example = createClass();
        var example = new Example();
        return example.run(1)
            .then((v) => {
                t.same(v, 1);
            });
    }
);

test(
    'createClass can overwrite run but is still passed arg',
    (t) => {
        t.plan(2);
        var Dep = createClass();
        var Example = createClass({
            run: (v) => {
                t.same(v, 1);
                return 2;
            }
        });
        var example = new Example();
        return example.run(1)
            .then((v) => {
                t.same(v, 2);
            });
    }
);

test(
    'createClass calls methods with correct context',
    (t) => {
        t.plan(4);

        var Example = createClass({
            getDescription() {
                t.same(this.constructor, Example);
                return '';
            },

            getDefaultProps() {
                t.same(this.constructor, Example);
                return {};
            },

            getDependencies() {
                t.same(this.constructor, Example);
                return [];
            },

            run() {
                t.same(this.constructor, Example);
            }
        });
        var example = new Example();
        example.getDescription();
        example.getDependencies();
        return example.run();
    }
);
