import { Map, List } from 'immutable';

export default function createClass(spec={}) {
    const {
        displayName = '',
        getDescription,
        getDefaultFixtures,
        getDependencies,
        run,
        teardown
    } = spec;

    class Action {
        // Static and on the instance, because that's just easier
        static displayName = displayName;
        displayName = displayName;

        constructor(fixtures = Map()) {
            this.fixtures = this.getDefaultFixtures().merge(fixtures);
        }

        // The description is used when describing what will be run, and other
        // logging tasks.
        getDescription() {
            return (
                typeof getDescription === 'function'
                    ? getDescription.call(this)
                    : this.displayName
            );
        }

        // Default fixtures, merged with those passed into the Action's
        // constructor, are used to differentiate identify the Action.
        getDefaultFixtures() {
            return (
                typeof getDefaultFixtures === 'function'
                    ? Map(getDefaultFixtures.call(this))
                    : Map()
            );
        }

        // Dependecies are used to compose Actions into chains.
        getDependencies() {
            return (
                typeof getDependencies === 'function'
                    ? List(getDependencies.call(this))
                    : List()
            );
        }

        // The main block of an action - do your work here.
        // The result is wrapped up in a Promise.
        run(v, ...args) {
            return Promise.resolve()
                .then(() => {
                    return (
                        typeof run === 'function'
                            ? run.call(this, v, ...args)
                            : v
                    );
                });
        }

        // Teardown allows an action to undo what it previously did
        teardown(v) {
            return Promise.resolve()
                .then(() => {
                    return (
                        typeof teardown === 'function'
                            ? teardown.call(this, v)
                            : v
                    );
                });
        }
    }

    return Action;
}
