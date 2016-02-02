export default function run(action) {
    return Promise.resolve()
        .then(() => action.run())
        .then(
            () => action.teardown(),
            () => action.teardown()
        );
}
