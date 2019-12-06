import React from "react";
import { useApp } from "../../app/"
import { pad } from "../../helpers"
import styled from "styled-components"

function Card(props) {
    const { actions } = useApp();
    const {
        pokeNum,
        pokemon,
        updateProgress,
        className
    } = props;
    let image;
    try {
        image = require(`../../img/pokedex/${pad(pokeNum + 1, 3, "0")}.png`);
    } catch (e) {
        // image = pokemon.sprites.front_default;
    }

    console.log(pad(pokeNum + 1, 3, "0"))

    const onClick = () => {
        actions.togglePokemon(pokeNum);
        updateProgress();
    }

    return (
        <div className={ `card ${className}` } onClick={ () => onClick() }>
            <div className="card-header">
                <h4 className="h6 text-center">{ pokemon.name }</h4>
            </div>
            <div className="card-content">
                <img src={ `../../img/pokedex/${pad(pokeNum + 1, 3, "0")}.png` } height="475" width="475" alt={ pokemon.name } />
            </div>
            <button className={ `button ${pokemon.caught ? "success" : "alert"} ` }>{ pokemon.caught ? "Caught" : "Uncaught" }</button>
        </div>
    );
}

const StyledCard = styled(Card)`
    margin: 0;
    width: 160px;
    height: 160px;
    .card-header {
        padding: 0;
        h4 {
            margin: 4px;
        }
    }
    .card-content {
        width: 100px;
        height: 100px;
        margin: 0 auto;
        img {
            width: 100%;
            margin: 0;
            height: auto;
        }
    }
    button {
        width: 100%;
        min-height: 0;
    }
`

export default StyledCard;
