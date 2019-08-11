import React, { Suspense } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Box from "../Box";

const BoxList = props => {
    const { className } = props;
    const numPokemon = useSelector(state => state.reducer.numPokemon);
    let boxes = [];
    let numBoxes = Math.ceil(numPokemon / 30);
    for (let i = 0; i < numBoxes; i++) {
        boxes.push(<Box id={`box-${i}`} boxNum={i} key={i} />);
    }

    return (
        <Suspense fallback={<p>Loading</p>}>
            <div className={className}>{boxes}</div>
        </Suspense>
    );
};

const StyledBoxList = styled(BoxList)`
    overflow-y: scroll;
    overflow-x: hidden;
    height: 90vh;
    margin-top: 10vh;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
`;

export default StyledBoxList;
