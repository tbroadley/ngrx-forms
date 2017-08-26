import {
  AbstractControlState,
  FormGroupState,
  FormGroupControls,
  KeyValue,
  createFormControlState,
  createFormGroupState,
} from '../../state';
import { Actions, SetValueAction } from '../../actions';
import { computeGroupState, callChildReducer, childReducer } from './util';

function createChildState(id: string, childValue: any): AbstractControlState<any> {
  if (childValue !== null && typeof childValue === 'object') {
    return createFormGroupState(id, childValue);
  }

  return createFormControlState(id, childValue);
}

export function setValueReducer<TValue extends KeyValue>(
  state: FormGroupState<TValue>,
  action: Actions<TValue>,
): FormGroupState<TValue> {
  if (action.type !== SetValueAction.TYPE) {
    return state;
  }

  if (action.controlId !== state.id) {
    return childReducer(state, action);
  }

  if (state.value === action.payload.value) {
    return state;
  }

  if (action.payload.value instanceof Date) {
    throw new Error('Date values are not supported. Please used serialized strings instead.');
  }

  const value = action.payload.value;

  const controls = Object.keys(value)
    .reduce((c, key) => {
      if (!state.controls[key]) {
        c[key] = createChildState(`${state.id}.${key}`, value[key]);
      } else {
        c[key] = callChildReducer(state.controls[key], new SetValueAction(state.controls[key].id, value[key]));
      }
      return c;
    }, {} as FormGroupControls<TValue>);

  return computeGroupState(state.id, controls, value, state.errors);
}