import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import sameActionsList from '../src/sameActionsList';
import commonPrefix from '../src/commonPrefix';
import createClass from '../src/createClass';

test('importable', (t) => {
    t.ok(commonPrefix);
});

test(
    'finds commonPrefix of two identical lists',
    (t) => {
        var Example1 = createClass();
        var Example2 = createClass();
        var left = fromJS([ new Example1(), new Example2() ]);
        var right = fromJS([ new Example1(), new Example2() ]);
        t.ok(
            sameActionsList(
                commonPrefix(left, right),
                fromJS([ new Example1(), new Example2() ])
            )
        )
    }
);

test(
    'finds commonPrefix of two different lists',
    (t) => {
        var Example1 = createClass();
        var Example2 = createClass();
        var Example3 = createClass();
        var left = fromJS([ new Example1(), new Example2() ]);
        var right = fromJS([ new Example3(), new Example2() ]);
        t.ok(
            sameActionsList(
                commonPrefix(left, right),
                fromJS([])
            )
        )
    }
);

test(
    'finds commonPrefix of two different lists with shared prefix',
    (t) => {
        var Example1 = createClass();
        var Example2 = createClass();
        var Example3 = createClass();
        var left = fromJS([ new Example1(), new Example2() ]);
        var right = fromJS([ new Example1(), new Example3() ]);
        t.ok(
            sameActionsList(
                commonPrefix(left, right),
                fromJS([ new Example1() ])
            )
        )
    }
);
