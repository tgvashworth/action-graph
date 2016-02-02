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
