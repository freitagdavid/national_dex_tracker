import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider as OMProvider } from 'overmind-react'
import { config } from "./app/"
import { createOvermind } from "overmind";

// const store = createStore(rootReducer, applyMiddleware(thunk, logger));

export const overmind = createOvermind(config, {
    devtools: true
})

ReactDOM.render(
    <OMProvider value={ overmind }>
        <App />
    </OMProvider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
