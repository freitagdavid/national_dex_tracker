import { combineReducers, configureStore } from "@reduxjs/toolkit";
import caughtReducer from "../features/pokemon/userSlice";
import caughtTotalReducer from "../features/pokemon/caughtTotalSlice";
// import pokemonReducer from "../features/pokemon/pokemonSlice";
import { api } from "./services/baseApi";
// import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";

// const persistConfig = {
//     key: "root",
//     version: 1,
//     storage,
// };

// const reducers = combineReducers({
//     caught: caughtReducer,
//     caughtTotal: caughtTotalReducer,
// });

// export const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: combineReducers({
        [api.reducerPath]: api.reducer,
        caught: caughtReducer,
        caughtTotal: caughtTotalReducer,
        // pokemon: pokemonReducer,
    }),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
