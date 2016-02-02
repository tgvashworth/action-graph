import buildRunPath from './buildRunPath';

export default function run(action) {
    const runPath = buildRunPath(action);
    const runThunk = (v) => runPath.reduce((pPrev, dep) => {
        return pPrev.then((v) => dep.run(v));
    }, Promise.resolve(v));
    const teardownThunk = (v) => runPath.reverse().reduce((pPrev, dep) => {
        return pPrev.then((v) => dep.teardown(v));
    }, Promise.resolve(v));

    return Promise.resolve()
        .then(() => runThunk())
        .then(
            () => teardownThunk(),
            () => teardownThunk()
        );
}
