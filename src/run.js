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
    return () => runPath.reduce((pPrev, action) => {
        return pPrev
            .then(() => action[k]())
            .catch(makeBundleErrorInAction(action));
    }, Promise.resolve());
}

export default function run(targetAction, context) {
    const runPath = buildRunPath(targetAction).map(dep => {
        dep.context = context;
        return dep;
    });
    const doRun = makePhase('run', runPath);
    const doTeardown = makePhase('teardown', runPath.reverse());

    return Promise.resolve()
        .then(doRun)
        .then(doTeardown);
}
