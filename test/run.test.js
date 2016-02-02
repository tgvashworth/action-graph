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
)

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
)

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
)
