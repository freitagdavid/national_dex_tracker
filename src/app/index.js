import { createHook } from 'overmind-react';
import { state } from './state';
import { onInitialize } from './onInitialize';
import * as actions from './actions';
import * as effects from './effects';

export const useApp = createHook();

export const config = {
    onInitialize,
    state,
    actions,
    effects,
};
