import Immutable, { fromJS } from 'immutable';

export default function is(left, right) {
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
