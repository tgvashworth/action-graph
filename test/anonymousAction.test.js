import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import sameActionsList from '../src/sameActionsList';
import createClass from '../src/createClass';
import anonymousAction from '../src/anonymousAction';
import is from '../src/is';

test('importable', (t) => {
    t.ok(anonymousAction);
});

test('anonymousAction handles no deps', (t) => {
    const action = anonymousAction();
    t.ok(action);
    t.same(
        action.getDescription(),
        'anonymous ()'
    );
});

test('anonymousAction reports the descriptions of its dependencies', (t) => {
    const ExampleA = createClass({
        displayName: 'a'
    });
    const ExampleB = createClass({
        getDescription() {
            return 'action b';
        }
    });
    const action = anonymousAction([
        new ExampleA(),
        new ExampleB()
    ]);
    t.same(
        action.getDescription(),
        'anonymous (a, action b)'
    );
});

test('anonymousAction exports its arguments as dependencies', (t) => {
    const ExampleA = createClass();
    const ExampleB = createClass();
    const action = anonymousAction([
        new ExampleA(),
        new ExampleB()
    ]);
    t.ok(
        sameActionsList(
            action.getDependencies(),
            fromJS([ new ExampleA(), new ExampleB() ])
        )
    );
});
