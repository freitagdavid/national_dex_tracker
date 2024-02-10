/// <reference types="redux-persist/types" /> 

import { Provider as ReduxProvider } from 'react-redux';
import { NextUIProvider } from '@nextui-org/react';
import { store } from './app/store'
import { ReactNode } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { api } from './app/services/baseApi';

const persistor = persistStore(store);


export const Provider = ({ children }: { children: ReactNode }): ReactNode => {
    return (
        <ReduxProvider store={store}>
            {/* <PersistGate loading={null} persistor={persistor}> */}
            {/* <ApiProvider api={api}> */}
            <NextUIProvider>
                {children}
            </NextUIProvider>
            {/* </ApiProvider> */}
            {/* </PersistGate> */}
        </ReduxProvider>
    )
}