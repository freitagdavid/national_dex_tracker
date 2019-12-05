import React, { useState } from "react";
import styled from "styled-components";
import PokemonCard from "../PokemonCard";
import downChevron from "../../img/downChevron.svg";
import ProgressBar from "../ProgressBar";
import { useApp } from "../../app/"
import { useEffect } from "react";
import { CollapsibleList, SimpleListItem } from "@rmwc/list"
import { GridList } from "@rmwc/grid-list"
import { Typography } from "@rmwc/typography"
import '@material/list/dist/mdc.list.css';
import '@rmwc/list/collapsible-list.css';
import '@material/grid-list/dist/mdc.grid-list.css';
import '@material/typography/dist/mdc.typography.min.css'

function Box(props) {
    const { state } = useApp();
    const boxSize = 30;
    const { className, boxNum } = props;
    const [collapsed, setCollapsed] = useState(false);
    const [boxCaughtPercent, setBoxCaughtPercent] = useState("0");

    useEffect(() => {
        updateProgress()
    }, [])

    let boxPoke = state.boxes[boxNum].map((pokemon, index) => {
        return <PokemonCard pokemon={ pokemon } boxNum={ boxNum } pokeNum={ boxNum * boxSize + index } updateProgress={ () => updateProgress() } />
    })

    const updateProgress = () => setBoxCaughtPercent(() => {
        return (state.boxes[boxNum].filter((item, index) => state.pokemon[boxNum * boxSize + index].caught).length / state.boxes[boxNum].length * 100).toFixed(2)
    }
    )

    return (
        <div className={ className } data-role="panel" data-title-caption={ `Box ${boxNum + 1}` } data-collapsible="true">
            <ProgressBar percentComplete={ boxCaughtPercent } />
            <div className="display-data">
                { boxPoke }
            </div>
        </div>
    );
}

const StyledBox = styled(Box)`
    width: 1048px;
    margin-top: 25px;
    .display-data {
        width: 100%;
        height: 100%;
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    }
`

export default StyledBox;
