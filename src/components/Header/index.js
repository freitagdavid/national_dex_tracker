import React from "react";
import styled from "styled-components";
import ProgressBar from "../ProgressBar";
import { useApp } from "../../overmind";

const Header = props => {
    const { state } = useApp();
    const { className } = props;

    return (
        <header className={ className }>
            <h1>National Dex Tracker</h1>
            <ProgressBar
                width="90vw"
                height="40px"
                percentComplete={ state.percentComplete }
            />
        </header>
    );
};

const StyledHeader = styled(Header)`
    position: absolute;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 10vh;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background-color: white;
    outline: black 1px solid;
    h1 {
        font-size: 1.5rem;
        text-align: center;
    }
`;

export default StyledHeader;
