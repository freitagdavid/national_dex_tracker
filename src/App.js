import React from "react";
import styled from "styled-components";
import Header from "./components/Header";
import BoxList from "./components/BoxList";
import { loadLocalPokemon } from "./reducers";
import { useDispatch } from "react-redux";

function App() {
    const dispatch = useDispatch();
    dispatch(loadLocalPokemon());
    return (
        <div className="App">
            <Header />
            <BoxList />
        </div>
    );
}

const StyledApp = styled(App)`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

export default StyledApp;
