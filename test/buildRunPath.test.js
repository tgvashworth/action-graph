import test from 'ava';
import Immutable, { fromJS } from 'immutable';
import buildRunPath from '../src/buildRunPath';
import sameActionsList from '../src/sameActionsList';
import createClass from '../src/createClass';

// Create a very arbitrary, complex graph
const A = createClass({ displayName: 'A' });
const B = createClass({ displayName: 'B', getDependencies: () => ([ new A() ]) });
const C = createClass({ displayName: 'C', getDependencies: () => ([ new A() ]) });
const D = createClass({ displayName: 'D', getDependencies: () => ([ new B() ]) });
const E = createClass({ displayName: 'E', getDependencies: () => ([ new B() ]) });
const F = createClass({ displayName: 'F', getDependencies: () => ([ new E(), new C() ]) });
const G = createClass({ displayName: 'G', getDependencies: () => ([ new F() ]) });
const H = createClass({ displayName: 'H', getDependencies: () => ([ new E() ]) });
const I = createClass({ displayName: 'I', getDependencies: () => ([ new D(), new H() ]) });
const J = createClass({ displayName: 'J', getDependencies: () => ([ new H() ]) });
const K = createClass({ displayName: 'K' });
const L = createClass({ displayName: 'L', getDependencies: () => ([ new K() ]) });
const M = createClass({ displayName: 'M', getDependencies: () => ([ new K() ]) });
const N = createClass({ displayName: 'N', getDependencies: () => ([ new L(), new M() ]) });
const O = createClass({ displayName: 'O', getDependencies: () => ([ new J(), new G(), new N() ]) });

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
