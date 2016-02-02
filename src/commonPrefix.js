import is from '../src/is';

export default function commonPrefix(left, right) {
    return left.zip(right)
        .takeWhile(([l, r]) => is(l, r))
        .map(([l]) => l);
}
