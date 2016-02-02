import buildRunPath from './buildRunPath';

export default function run(action, context) {
    const runPath = buildRunPath(action);
    const doRun = () => runPath.reduce((pPrev, dep) => {
        return pPrev.then(() => dep.run(context));
    }, Promise.resolve());
    const doTeardown = () => runPath.reverse().reduce((pPrev, dep) => {
        return pPrev.then(() => dep.teardown(context));
    }, Promise.resolve());

    return Promise.resolve()
        .then(doRun)
        .then(doTeardown);
}
