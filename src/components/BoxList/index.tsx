import React, { Suspense } from "react";
import styled from "styled-components";
import { useGetNumPokemonSpeciesQuery } from "../../features/pokedex/pokeApiSlice";
import Box from "../Box";

// const Box = React.lazy(() => import("../Box"));

interface Props {
    className?: string;
}

const BoxList = ({className}: Props) => {
    let boxes = [];
    const numSpecies = useGetNumPokemonSpeciesQuery();
    const numBoxes = Math.ceil((numSpecies?.data || 0) /30);



    for (let i = 0; i < numBoxes; i++) {
        boxes.push(<Box id={ `box-${i}` } boxNum={ i } key={ i } />);
    }

    return (
        <Suspense fallback={ <p>Loading</p> }>
            <div className={ className }>{ boxes }</div>
        </Suspense>
    );
};

const StyledBoxList = styled(BoxList)`
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 25px;
`;

export default StyledBoxList;