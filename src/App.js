import React from "react";
import styled from "styled-components";
import Header from "./components/Header";
import BoxList from "./components/BoxList";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar"

function App() {
    return (
        <div className="App">
            <Header />
            <TopAppBarFixedAdjust />
            <BoxList />
        </div>
    );
}

const StyledApp = styled(App)`
`;

export default StyledApp;
