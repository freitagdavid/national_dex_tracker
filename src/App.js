import React from "react";
import styled from "styled-components";
import Header from "./components/Header";
import BoxList from "./components/BoxList";

function App() {
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
