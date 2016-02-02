export default function run(action) {
    return Promise.resolve(action.run());
}
