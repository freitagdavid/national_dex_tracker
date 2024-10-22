import React from "react";
import {createRoot} from 'react-dom/client';
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {store} from './app/store';
import { Provider as ReduxProvider } from "react-redux";

const container = document.getElementById('root');

const root = createRoot(container);

root.render(
        <ReduxProvider store={store} >
            <App />
        </ReduxProvider>
);

serviceWorker.unregister();
