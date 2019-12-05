import React from "react";
import { useApp } from "../../app/"
import { Card, CardPrimaryAction, CardMedia, CardActions, CardActionButtons, CardActionButton } from "@rmwc/card"
import { Typography } from "@rmwc/typography"
import '@material/typography/dist/mdc.typography.css'
import '@material/card/dist/mdc.card.css';
import '@material/button/dist/mdc.button.css';
import '@material/icon-button/dist/mdc.icon-button.css';

function PokemonCard(props) {
    const { actions } = useApp();
    const {
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
        <div className="card" onClick={ () => onClick() } style={ { margin: "0", width: "160px", height: "160px" } }>
            <div className="card-header" style={ { padding: "0" } }>
                <h4 className="h6 text-center" style={ { margin: "4px" } }>{ pokemon.name }</h4>
            </div>
            <div className="card-content" style={ { display: "flex", alignContent: "center", justifyContent: "center" } }>
                <img src={ image } style={ { width: "96px", margin: "0", height: "auto" } } />
            </div>
            <button className={ `button ${pokemon.caught ? "success" : "alert"} ` } style={ { width: "100%", minHeight: "0" } }>{ pokemon.caught ? "Caught" : "Uncaught" }</button>
        </div>
    );
}

export default PokemonCard;
