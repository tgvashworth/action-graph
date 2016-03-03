import createClass from './createClass.js';

export default function anonymousAction(deps = []) {
    const Action = createClass({
        getDescription() {
            return `anonymous (${deps.map(d => d.getDescription()).join(', ')})`;
        },

        getDependencies() {
            return deps;
        }
    });
    return new Action();
}
