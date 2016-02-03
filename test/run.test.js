import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import run from '../src/run';
import createClass from '../src/createClass';

test('importable', (t) => {
    t.ok(run);
});

test(
    'it runs the run phase for an action with no dependencies',
    (t) => {
        t.plan(1);
        var Example = createClass({
            run(v) {
                t.pass();
                return v;
            }
        });
        return run(new Example());
    }
);

test(
    'it runs the teardown phase for an action with no dependencies',
    (t) => {
        t.plan(1);
        var Example = createClass({
            teardown(v) {
                t.pass();
                return v;
            }
        });
        return run(new Example());
    }
);

test(
    'it runs the teardown phase for an action with no dependencies after the run phase',
    (t) => {
        t.plan(2);
        var count = 0;
        var Example = createClass({
            run(v) {
                t.same(count, 0);
                count++;
                return v;
            },

            teardown(v) {
                t.same(count, 1);
                return v;
            }
        });
        return run(new Example());
    }
);

test(
    'it runs the run phase for a dependency before the target',
    (t) => {
        t.plan(2);
        var count = 0;
        var ActionA = createClass({
            run(v) {
                t.same(count, 0);
                count++;
                return v;
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run(v) {
                t.same(count, 1);
                return v;
            }
        });
        return run(new ActionB());
    }
);

test(
    'it runs the teardown phase for a dependency after the target',
    (t) => {
        t.plan(4);
        var count = 0;
        var ActionA = createClass({
            run(v) {
                t.same(count, 0);
                count++;
                return v;
            },

            teardown(v) {
                t.same(count, 3);
                count++;
                return v;
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run(v) {
                t.same(count, 1);
                count++;
                return v;
            },

            teardown(v) {
                t.same(count, 2);
                count++;
                return v;
            }
        });
        return run(new ActionB());
    }
);

test(
    'context is given to all actions',
    (t) => {
        t.plan(2);
        var contextExample = {};
        var ActionA = createClass({
            run(v) {
                const { context } = this;
                t.same(context.example, contextExample);
                return v;
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run(v) {
                const { context } = this;
                t.same(context.example, contextExample);
                return v;
            }
        });
        return run(new ActionB(), {
            example: contextExample
        });
    }
);

test(
    'run propagates run errors',
    (t) => {
        t.plan(2);
        var Action = createClass({
            run() {
                t.pass();
                throw new Error('Nope');
            }
        });
        return run(new Action())
            .then(
                () => t.fail(),
                (err) => {
                    t.same(err.message, 'Nope');
                }
            );
    }
);

test(
    'run propagates teardown errors',
    (t) => {
        t.plan(3);
        var Action = createClass({
            teardown() {
                t.pass();
                throw new Error('Nope');
            }
        });
        var instance = new Action();
        return run(instance)
            .then(
                () => t.fail(),
                (err) => {
                    t.same(err.message, 'Nope');
                    t.same(err.action, instance);
                }
            );
    }
);

test(
    'run passes state to phases and passes on return value',
    (t) => {
        t.plan(8);
        var initialState = fromJS({});
        var ActionA = createClass({
            run(state) {
                t.is(state, initialState);
                return state.set('A run', true);
            },

            teardown(state) {
                t.ok(state.get('B teardown'));
                return state.set('A teardown', true);
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run(state) {
                t.ok(state.get('A run'));
                return state.set('B run', true);
            },

            teardown(state) {
                t.ok(state.get('B run'));
                return state.set('B teardown', true);
            }
        });
        return run(new ActionB(), {}, initialState)
            .then((state) => {
                t.ok(state.get('A run'), true);
                t.ok(state.get('B run'), true);
                t.ok(state.get('B teardown'), true);
                t.ok(state.get('A teardown'), true);
            });
    }
);

test(
    'throws if state is not returned from run',
    (t) => {
        t.plan(1);
        var Action = createClass({
            run() {
                return false; // oh no!
            }
        });
        return run(new Action(), {}, fromJS({}))
            .then(
                () => t.fail(),
                (err) => {
                    t.same(err.message, 'You must return a state object from Action#run()');
                }
            );
    }
);

test(
    'throws if state is not returned from teardown',
    (t) => {
        t.plan(1);
        var Action = createClass({
            teardown() {
                return false; // oh no!
            }
        });
        return run(new Action(), {}, fromJS({}))
            .then(
                () => t.fail(),
                (err) => {
                    t.same(err.message, 'You must return a state object from Action#teardown()');
                }
            );
    }
);
