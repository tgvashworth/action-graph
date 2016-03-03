# action-graph

action-graph is a tool for automating complex tasks efficiently and predictably.

It helps you structure units of work into atomic actions that promote reuse and predictability. Born to improve [integration testing][integrator] it's suitable for other structured tasks, like build and deploy tooling.

[![Build Status](https://travis-ci.org/phuu/action-graph.svg?branch=master)](https://travis-ci.org/phuu/action-graph)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Install

```
$ npm install --save action-graph
```

## The idea

Actions have dependencies. The dependencies are also actions, which in turn can have their own dependencies. For example, an action to "send a message" might need to first "login", and before you can "login" you need to "open the website".

With action graph, you'd specify this with three actions: `SendAMessage`, `Login` and `OpenTheWebsite`. `SendAMessage` would depend on `Login`, and `Login` would depend on `OpenTheWebsite`...

```
OpenTheWebsite
      |
    Login
      |
 SendAMessage
```

If you run the `SendAMessage` action, action-graph will automatically run `OpenTheWebsite` and `Login` first.

If you then wanted to test "delete a message" it would also depend on "login" and "open the website". You'd create a new action, `DeleteAMessage`, and have it depend on `Login`. Your graph now looks like...

```
        OpenTheWebsite
              |
            Login
             / \
 SendAMessage   DeleteAMessage
```

Running `DeleteAMessage` would cause `OpenAWebsite` and `Login` to run, but not `SendAMessage`. This is action-graph's special sauce — it will figure out the minimum amount of work required to run an action.

## A simple example

Here's an action with no dependencies.

```js
import { createClass } from 'action-graph';

// Calling createClass is how you make an action constructor. Pass it an object, it does the rest.
const SayHello = createClass({
    // 'run' is where the action does most of its work. The first rule is that run is passed a
    // 'state' object, where it can store information about what it has done done, and it
    // must return another state object to be passed to the next action.
    //
    // In this case we don't do anything with state — we just log a messasge!
    run(state) {
        console.log("Hello, world!");
        return state;
    }
});
```

## Example use

Here's an example integration test suite that will get you familiar with action-graph's API and use.

```js
import {
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

    // Run is where most of the action's work happens. The action has a 'context' property, which
    // is unique to the use-case of action-graph. Becuase this is an integration test, the context
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
