import { isStrict } from '../src/is';

export default function sameActionsList(left, right) {
    return left.count() === right.count() &&
        left.zip(right).every(([ l, r ]) => isStrict(l, r));
}
