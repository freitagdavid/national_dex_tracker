import React from "react";
import styled from "styled-components";
import { useApp } from "../../app/"

function PokemonCard(props) {
    const { actions } = useApp();
    const {
        className,
        pokeNum,
        pokemon,
        updateProgress
    } = props;
    let image;
    try {
        image = require(`../../img/pokedex/${props.pokeNum}.png`);
    } catch (e) {
        image = pokemon.sprites.front_default;
    }

    const onClick = () => {
        actions.togglePokemon(pokeNum);
        updateProgress();
    }

    return (
        <div
            className={ `${className} ${pokemon.caught ? "selected" : ""}` }
            onClick={ () => onClick() }
        >
            <h3>{ pokemon.name }</h3>
            <img src={ image } alt={ pokemon.name } />
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
        width: 96px;
        height: 96px;
    }
    &.selected h3 {
        background-color: green;
        color: white;
    }
`;

export default StyledPokemonCard;
