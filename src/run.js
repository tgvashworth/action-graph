import buildRunPath from './buildRunPath';

export default function run(targetAction, context) {
    const runPath = buildRunPath(targetAction).map(dep => {
        dep.context = context;
        return dep;
    });
    const doRun = () => runPath.reduce((pPrev, action) => {
        return pPrev
            .then(() => action.run(context))
            .catch(e => {
                throw {
                    stack: e.stack,
                    message: e.message,
                    action
                };
            });
    }, Promise.resolve());
    const doTeardown = () => runPath.reverse().reduce((pPrev, action) => {
        return pPrev
            .then(() => action.teardown(context))
            .catch(e => {
                throw {
                    stack: e.stack,
                    message: e.message,
                    action
                };
            });
    }, Promise.resolve());

    return Promise.resolve()
        .then(doRun)
        .then(doTeardown);
}
