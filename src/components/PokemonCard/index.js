import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

function PokemonCard(props) {
    const { className, pokeNum } = props;
    const pokemon = useSelector(state => state.reducer.pokemon[pokeNum]);
    const dispatch = useDispatch();

    const toggle = () => {
        console.log(pokeNum);
        dispatch({ type: "TOGGLE_POKEMON", payload: pokeNum });
    };

    return (
        <div
            className={`${className} ${pokemon.caught ? "selected" : ""}`}
            onClick={() => toggle()}
        >
            <h3>{pokemon.name}</h3>
            <img
                src={pokemon.sprites.front_default}
                width="96"
                height="96"
                alt={pokemon.name}
            />
        </div>
    );
}

const StyledPokemonCard = styled(PokemonCard)`
    border: solid black 1px;
    height: 125px;
    width: 1fr;
    display: flex;
    flex-direction: column;
    h3 {
        background-color: red;
        color: white;
        border-bottom: solid black 2px;
        width: 100%;
        text-align: center;
        margin-bottom: 10px;
    }
    img {
        align-self: center;
    }
    &.selected h3 {
        background-color: green;
        color: white;
    }
`;

// export default withGlobal(function(global) {
//     console.log(global);
// })(StyledPokemonCard);

export default StyledPokemonCard;
