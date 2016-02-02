import { List, fromJS } from 'immutable';
import uniqWith from 'lodash.uniqwith';
import is from './is';

export default function buildRunPath(action) {
    const list = action
        .getDependencies()
        .flatMap((dep) => buildRunPath(dep))
        .push(action);
    return List(uniqWith(list.toArray(), is));
}
