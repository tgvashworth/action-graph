import Immutable, { Map } from 'immutable';
import buildRunPath from './buildRunPath';

function ActionError(e, action) {
    this.message = e.message;
    this.action = action;
}

function makeBundleErrorInAction(action) {
    return e => {
        throw new ActionError(e, action);
    };
}

function makePhase(phase, runPath) {
    return initialState => runPath.reduce((pPrev, action) => {
        return pPrev
            .then(state => action[phase](state))
            .then(resultState => {
                if (!Immutable.Iterable.isIterable(resultState)) {
                    throw new Error(`You must return a state object from Action#${phase}()`)
                }
                return resultState;
            })
            .catch(makeBundleErrorInAction(action));
    }, Promise.resolve(initialState));
}

export default function run(targetAction, context = {}, initialState = Map()) {
    const runPath = buildRunPath(targetAction).map(dep => {
        dep.context = context;
        return dep;
    });
    const doRun = makePhase('run', runPath);
    const doTeardown = makePhase('teardown', runPath.reverse());

    return Promise.resolve(initialState)
        .then(doRun)
        .then(doTeardown);
}
