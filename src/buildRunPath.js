import { List, fromJS } from 'immutable';
import uniqWith from 'lodash.uniqwith';
import is, { isStrict }  from './is';

function getDepList(action) {
    return action
        .getDependencies()
        .flatMap((dep) => buildRunPath(dep))
        .push(action);
}

function findAllDeps(action) {
    if (typeof action === 'function') {
        return List([action]);
    }
    return action
        .getDependencies()
        .flatMap(findAllDeps)
        .push(action);
}

function dedupeFromLeft(arr, isEqual) {
    return arr.reduce((acc, v) => {
        if (!acc.some(isEqual.bind(null, v))) {
            acc.push(v);
        }
        return acc;
    }, []);
}

function getBestDepList(deps) {
    // To find the best dep list, we first create two lists:
    //  - All unique actions, unstrictly deduped (so constructors and instances make it in)
    //  - A deduped list just containing instances
    var dedupedUnstrict = dedupeFromLeft(deps, is);
    var dedupedActions = dedupeFromLeft(
        deps.filter(dep => typeof dep !== 'function'),
        isStrict
    );
    // To get a list of what we'd need to run, in order, go through the unstrictly deduped list
    // to find an instance for each action. Where they are missing, filter them out.
    var orderedActions = dedupedUnstrict
        .map(dep => dedupedActions.find(is.bind(null, dep)))
        .filter(Boolean);
    // To find what's not implemented, we get each dep from the unstrict list and find if there
    // is a suitable implementation in the action instance list. If there's not, it's not
    // implemented. Simples... right?
    var notImplemented = dedupedUnstrict.filter(dep => !dedupedActions.some(is.bind(null, dep)));
    return {
        deps: orderedActions,
        notImplemented: notImplemented
    };
}


export default function buildRunPath(action) {
    const allDeps = findAllDeps(action).toArray();
    const { deps, notImplemented } = getBestDepList(allDeps);

    if (notImplemented.length) {
        var displayNames = notImplemented.map(v => v.displayName);
        throw new Error(
            `Action "${action.displayName}" depends on ` +
                `"${displayNames.join('", "')}" but matching instances are missing`
        );
    }

    return List(deps);
}
