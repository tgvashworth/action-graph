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
            run() {
                t.pass();
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
            teardown() {
                t.pass();
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
            run() {
                t.same(count, 0);
                count++;
            },

            teardown() {
                t.same(count, 1);
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
            run() {
                t.same(count, 0);
                count++;
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run() {
                t.same(count, 1);
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
            run() {
                t.same(count, 0);
                count++;
            },

            teardown() {
                t.same(count, 3);
                count++;
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run() {
                t.same(count, 1);
                count++;
            },

            teardown() {
                t.same(count, 2);
                count++;
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
            run(context) {
                t.same(context.example, contextExample);
            }
        });
        var ActionB = createClass({
            getDependencies() {
                return [
                    new ActionA()
                ];
            },

            run(context) {
                t.same(context.example, contextExample);
            }
        });
        return run(new ActionB(), {
            example: contextExample
        });
    }
);
