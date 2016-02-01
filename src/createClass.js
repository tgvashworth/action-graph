export default function createClass(spec) {
    const {
        displayName = '',
        getDescription
    } = (spec || {});

    class Action {
        static displayName = displayName;
        displayName = displayName;
        getDescription() {
            return (
                typeof getDescription === 'function'
                    ? getDescription.call(this)
                    : this.displayName
            );
        }
    }

    return Action;
}
