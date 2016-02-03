import { Map } from 'immutable';
import buildRunPath from './buildRunPath';

function makeBundleErrorInAction(action) {
    return e => {
        throw {
            stack: e.stack,
            message: e.message,
            action
        };
    };
}

function makePhase(k, runPath) {
    return initialState => runPath.reduce((pPrev, action) => {
        return pPrev
            .then(state => action[k](state))
            .catch(makeBundleErrorInAction(action));
    }, Promise.resolve(initialState));
}

export default function run(targetAction, context, initialState = Map()) {
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
