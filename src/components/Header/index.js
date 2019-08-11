import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import ProgressBar from "../ProgressBar";

const Header = props => {
    const { className } = props;
    const numCaught = useSelector(state => state.reducer.numCaught);
    const numPokemon = useSelector(state => state.reducer.numPokemon);

    return (
        <header className={className}>
            <h1>National Dex Tracker</h1>
            <ProgressBar total={numPokemon} complete={numCaught} />
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
