import Immutable, { fromJS } from 'immutable';

export default function is(left, right) {
    // Must be the same class
    if (left.constructor !== right.constructor) {
        return false;
    }

    // Fixtures must be identical
    if (!Immutable.is(fromJS(left.fixtures), fromJS(right.fixtures))) {
        return false;
    }

    return true;
}
