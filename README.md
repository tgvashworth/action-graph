# action-graph

[![Build Status](https://travis-ci.org/phuu/integrator.svg?branch=master)](https://travis-ci.org/phuu/action-graph)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A task runner based on immutable data structures.

Status: *Implementation* (not ready for use, but please contribute!)

## Install

```
$ npm install action-graph
```

## What is it?

action-graph is a tool for specifying and running a graph of dependent actions.

Think Gulp meets React, but don't because that's a terrible analogy.

Here's an example test suite:

```js
import {

  // createClass is used to make Actions. It's like React's createClass. It takes an object that
  // specifies the Action's name, dependencies and properties, as well as behaviour when it's run.
  createClass,

  // run takes a 'target' action, some 'context' and an initial state to run the action-graph
  // against. It builds a 'run-path' for the target, putting dependencies in the right order,
  // and the runs each in turn.
  run

} from 'action-graph';

// Here's our first action. This action will type some text into an element, specified by the
// 'selector' property.
//
// Actions are instantiated like a class:
//
//      new Type({ selector: 'input', text: 'Hello!' })
//
const Type = createClass({

    // Props are the configurable attributes of an instance of an Action. They are used to
    // uniquely identify it (more on that later).
    getDefaultProps: function () {
        return {
            selector: undefined,
            text: undefined
        };
    },

    // Actions can choose to describe themselves with a name or descripton. This action implements
    // its own description to help debugging.
    getDescription: function () {
        return 'type ' + this.props.text + ' into ' + this.props.selector;
    },

    // Run is where most of the Action's work happens. It is supplied with a 'context', which will
    // be unique to the use-case of action-graph. Becuase this is an integration test, the context
    // contains a reference to the 'session', used to talk to a selenium server.
    //
    // The run method is passed a 'state' object, which is where actions can store the work they've
    // done. This is useful for running assertions against, or for building on the work of
    // another action. Run *must* return a state object. It will then be passed to the next action.
    run: function (state) {
        return this.context.session
            .findDisplayedByCssSelector(this.props.selector)
            .then(elem => elem.type(this.props.text))
            .then(() => state);
    }

});

const Click = createClass({ ... });

const OpenUrl = createClass({
    getDefaultProps() {
        return {
            url: 'http://localhost:9000',
            expectedTitle: ''
        };
    },

    getDescription() {
        const { props } = this; // if you want
        return `Open ${props.get('url')}`;
    },

    run(state) {
        const { props, context: { session } } = this;
        return session
            .get(props.url)
            .then(() => session.getPageTitle())
            .then(title => {
                if (title !== props.expectedTitle) {
                    throw new Error('Title was not as expected');
                }
            })
            .then(() => state.set('currentUrl', props.url));
    },

    // 'teardown' is where you undo what 'run' did. It's optional, but you might use
    // it to close a modal window or delete temporary files. Like 'run', it takes and must return
    // a state object.
    teardown(state) {
        return state;
    }
});

const SendAMessage = createClass({
    getDependencies() {
        const { props } = this; // if you want
        return [
            OpenUrl({
                url: 'https://your.app',
                expectedTitle: 'My App'
            }),
            Click({
                selector: '.new'
            }),
            Type({
                selector: '.subject',
                text: 'The subject'
            }),
            Type({
                selector: 'textarea',
                text: 'The message'
            }),
            Click({
                selector: '.send'
            })
        ];
    }
});

// Actually run the action. Second argument is 'context', third is the
// initial state.
run(
    SendAMessage,
    { session: getSession() },
    {}
);
```

### License

MIT
