import React from "react";
import styled from "styled-components";
import PokemonCard from "../PokemonCard";
import { useSelector } from "react-redux";

function Box(props) {
    const boxSize = 30;
    const { className, boxNum } = props;
    const pokemon = useSelector(state => state.reducer.pokemon);
    return (
        <div className={className}>
            <h2>{`Box ${boxNum + 1}`}</h2>
            <div>
                {pokemon
                    .slice(boxNum * boxSize, boxNum * boxSize + boxSize)
                    .map((item, i) => {
                        return (
                            <PokemonCard
                                key={i}
                                boxNum={boxNum}
                                pokeNum={boxNum * boxSize + i}
                            />
                        );
                    })}
            </div>
        </div>
    );
}

const StyledBox = styled(Box)`
    width: 90vw;
    border: solid black 1px;
    margin: 30px 0;
    h2 {
        color: white;
        background-color: black;
        width: 100%;
        text-align: center;
        padding: 15px 0;
    }
    & > div {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
        outline: 1px solid black;
    }
`;

export default StyledBox;
