import React from "react";
import styled from "styled-components";
import Header from "./components/Header";
import BoxList from "./components/BoxList";
import { useGetNumPokemonSpeciesQuery, useGetPokemonChunkQuery, useGetPokemonSpeciesAllQuery } from "./features/pokedex/pokeApiSlice";
import { useAppSelector, usePokemonSpeciesAll } from "./app/hooks";



function App() {

    return (
        <div className="App">
            <Header />
            {/* <TopAppBarFixedAdjust /> */}
            <BoxList />
        </div>
    );
}

const StyledApp = styled(App)`
`;

export default StyledApp;
