import Immutable, { fromJS } from 'immutable';

export function isStrict(left, right) {
    // Must be the same class
    if (left.constructor !== right.constructor) {
        return false;
    }

    // Props must be identical
    if (!Immutable.is(fromJS(left.props), fromJS(right.props))) {
        return false;
    }

    return true;
}

export default function is(left, right) {
    // The constructor counts as a match
    if (left === right.constructor || right === left.constructor) {
        return true;
    }

    return isStrict(left, right);
}
