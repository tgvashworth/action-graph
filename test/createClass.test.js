import test from 'ava';
import createClass from '../src/createClass';

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
