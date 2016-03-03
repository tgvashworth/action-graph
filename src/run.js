import Immutable, { Map, fromJS } from 'immutable';
import buildRunPath from './buildRunPath';

function ActionError(e, action) {
    this.message = e.message;
    this.stack = e.stack;
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
            .then(state => {
                return Promise.resolve(state)
                    .then(state => action[phase](state))
                    .then(resultState => {
                        const resultStateIsIterable = Immutable.Iterable.isIterable(resultState);
                        const resultStateIsUndefined = typeof resultState === 'undefined';
                        if (!resultStateIsUndefined && !resultStateIsIterable) {
                            throw new Error(
                                `You must return a state object or nothing from ` +
                                    `${action.getDescription()}'s ${phase}`
                            );
                        }
                        return (resultStateIsUndefined ? state : resultState);
                    });
            })
            .catch(makeBundleErrorInAction(action));
    }, Promise.resolve(initialState));
}

export default function run(targetAction, context = {}, initialState = {}) {
    return Promise.resolve()
        .then(() => {
            const runPath = buildRunPath(targetAction).map(dep => {
                dep.context = context;
                return dep;
            });
            const doRun = makePhase('run', runPath);
            const doTeardown = makePhase('teardown', runPath.reverse());
            return { runPath, doRun, doTeardown };
        })
        .catch(makeBundleErrorInAction(targetAction))
        .then(({ runPath, doRun, doTeardown }) => {
            return Promise.resolve(fromJS(initialState))
                .then(doRun)
                .then(doTeardown)
        });
}
