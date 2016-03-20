import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import buildRunPath from '../src/buildRunPath';
import sameActionsList from '../src/sameActionsList';
import createClass from '../src/createClass';

function cC(name, deps=[]) {
    return createClass({
        displayName: name,
        getDependencies: () => deps
    });
}

// Create a very arbitrary, complex graph
const A = cC('A');
const B = cC('B', [ new A() ]);
const C = cC('C', [ new A() ]);
const D = cC('D', [ new B() ]);
const E = cC('E', [ new B() ]);
const F = cC('F', [ new E(), new C() ]);
const G = cC('G', [ new F() ]);
const H = cC('H', [ new E() ]);
const I = cC('I', [ new D(), new H() ]);
const J = cC('J', [ new H() ]);
const K = cC('K');
const L = cC('L', [ new K() ]);
const M = cC('M', [ new K() ]);
const N = cC('N', [ new L(), new M() ]);
const O = cC('O', [ new J(), new G(), new N() ]);

// Actions that depend on constructors, not instances
const A2 = cC('A2');
const B2 = cC('B2', [ A2 ]);
const C2 = cC('C2', [ new A2(), new B2() ]);
const D2 = cC('D2', [ new A2(), B2, new C2() ]);
const E2 = cC('E2', [ A2, B2 ]);
const F2 = cC('F2', [ new B2() ]);
// G2 is bad, its tree does not contain an implementation of A2
const G2 = cC('G2', [ new E2(), new F2() ]);
const H2 = cC('H2', [ new A2(), new G2() ]);

test('importable', (t) => {
    t.ok(buildRunPath);
});

let buildActionPathData = [
    [ new A(),
        fromJS([ new A() ]) ],
    [ new B(),
        fromJS([ new A(), new B() ]) ],
    [ new C(),
        fromJS([ new A(), new C() ]) ],
    [ new D(),
        fromJS([ new A(), new B(),  new D() ]) ],
    [ new E(),
        fromJS([ new A(), new B(), new E() ]) ],
    [ new F(),
        fromJS([ new A(), new B(), new E(), new C(), new F() ]) ],
    [ new G(),
        fromJS([ new A(), new B(), new E(), new C(), new F(), new G() ]) ],
    [ new H(),
        fromJS([ new A(), new B(), new E(), new H() ]) ],
    [ new I(),
        fromJS([ new A(), new B(),  new D(), new E(), new H(), new I() ]) ],
    [ new J(),
        fromJS([ new A(), new B(), new E(), new H(), new J() ]) ],

    [ new K(),
        fromJS([ new K() ]) ],
    [ new L(),
        fromJS([ new K(), new L() ]) ],
    [ new M(),
        fromJS([ new K(), new M() ]) ],
    [ new N(),
        fromJS([ new K(), new L(), new M(), new N() ]) ],
    [ new O(),
        fromJS([ new A(), new B(), new E(), new H(), new J(), new C(), new F(), new G(), new K(), new L(), new M(), new N(), new O() ]) ],

    // Constructors
    [ new C2(),
        fromJS([ new A2(), new B2(), new C2() ]) ],
    [ new D2(),
        fromJS([ new A2(), new B2(), new C2(), new D2() ]) ],
    [ new H2(),
        fromJS([ new A2(), new B2(), new E2(), new F2(), new G2(), new H2() ]) ]
];
buildActionPathData
    .forEach(([action, expected]) => {
        const expectedNames = expected.map(action => action.displayName);
        test(`${action.displayName} => ${expectedNames}`, (t) => {
            t.ok(
                sameActionsList(
                    buildRunPath(action),
                    expected
                )
            );
        });
    });

var throwBuildActionPathData = [
    new G2()
];
throwBuildActionPathData
    .forEach(action => {
        test(`${action.displayName} throws`, (t) => {
            t.throws(() => {
                buildRunPath(action);
            });
        });
    });
