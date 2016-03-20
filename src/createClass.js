import { Map, List, fromJS } from 'immutable';
import uniqueId from 'lodash.uniqueid';

export default function createClass(spec = {}) {
    const {
        displayName = 'unnamed action',
        getDefaultProps,
        getDescription,
        getDependencies,
        beforeRun,
        run,
        afterRun,
        beforeTeardown,
        teardown,
        afterTeardown
    } = spec;

    class Action {
        static _id = uniqueId('ActionClass');
        // Static and on the instance, because that's just easier
        static displayName = displayName;
        displayName = displayName;

        constructor(props = {}) {
            this._id = uniqueId('ActionInstance');
            this.props = fromJS(this.getDefaultProps()).merge(fromJS(props)).toJS();
        }

        // Default props, merged with those passed into the Action's
        // constructor, are used to differentiate identify the Action.
        getDefaultProps() {
            return (
                typeof getDefaultProps === 'function'
                    ? getDefaultProps.call(this)
                    : {}
            );
        }

        // The description is used when describing what will be run, and other
        // logging tasks.
        getDescription() {
            return (
                typeof getDescription === 'function'
                    ? getDescription.call(this, this.props)
                    : this.displayName
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

        // beforeRun is used to specify actions to be run before the action's main section
        beforeRun() {
            return (
                typeof beforeRun === 'function'
                    ? List(beforeRun.call(this))
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

        // afterRun is used to specify actions to be run after the action's main section
        afterRun() {
            return (
                typeof afterRun === 'function'
                    ? List(afterRun.call(this))
                    : List()
            );
        }

        // beforeTeardown is used to specify actions to be run before the action's teardown section
        beforeTeardown() {
            return (
                typeof beforeTeardown === 'function'
                    ? List(beforeTeardown.call(this))
                    : List()
            );
        }

        // Teardown allows an action to undo what it previously did
        teardown(v, ...args) {
            return Promise.resolve()
                .then(() => {
                    return (
                        typeof teardown === 'function'
                            ? teardown.call(this, v, ...args)
                            : v
                    );
                });
        }

        // afterTeardown is used to specify actions to be run after the action's teardown section
        afterTeardown() {
            return (
                typeof afterTeardown === 'function'
                    ? List(afterTeardown.call(this))
                    : List()
            );
        }

    }

    return Action;
}
