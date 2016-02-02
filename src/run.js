import buildRunPath from './buildRunPath';

export default function run(action, context) {
    const runPath = buildRunPath(action);
    const runThunk = (context) => runPath.reduce((pPrev, dep) => {
        return pPrev.then(() => dep.run(context));
    }, Promise.resolve());
    const teardownThunk = (context) => runPath.reverse().reduce((pPrev, dep) => {
        return pPrev.then(() => dep.teardown(context));
    }, Promise.resolve());

    return Promise.resolve()
        .then(() => runThunk(context))
        .then(
            () => teardownThunk(context),
            () => teardownThunk(context)
        );
}
