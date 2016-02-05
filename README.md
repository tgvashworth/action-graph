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

action-graph has a React-like Action API, and will do the minimum amount of work required to make sure all required actions run in the correct order.

It's designed for integration testing, but could probably be used to make a build tool.

Example:

```js
import { createClass, run } from 'action-graph';
import {
  Click,
  Type
} from './utils';

const OpenUrl = createClass({
    getDescription() {
        const { props } = this; // if you want
        return `Open ${props.get('url')}`;
    },

    getDefaultProps() {
        return {
            url: 'http://localhost',
            expectedTitle: ''
        };
    },

    // 'run' is where you do most of the work of an Action. It recieves the current
    // state as an argument, and must return some state, which is then passed to the
    // next Action to run.
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
    // it to close a modal window or delete temporary files.
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
