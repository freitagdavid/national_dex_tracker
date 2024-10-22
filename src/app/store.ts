import {configureStore} from '@reduxjs/toolkit';
import { pokeApi } from '../features/pokedex/pokeApiSlice';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { listSlice } from '../features/pokedex/listSlice';

export const store = configureStore({
    reducer: {
        [pokeApi.reducerPath]: pokeApi.reducer,
        pokemonList: listSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokeApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;