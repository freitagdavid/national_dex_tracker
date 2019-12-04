import React, { useState } from "react";
import styled from "styled-components";
import PokemonCard from "../PokemonCard";
import downChevron from "../../img/downChevron.svg";
import ProgressBar from "../ProgressBar";
import { useApp } from "../../app/"
import { useEffect } from "react";

function Box(props) {
    const { state } = useApp();
    const boxSize = 30;
    const { className, boxNum } = props;
    const [collapsed, setCollapsed] = useState(false);
    const [boxCaughtPercent, setBoxCaughtPercent] = useState("0");

    useEffect(() => {
        updateProgress()
    }, [])

    const toggleCollapse = () => {
        setCollapsed(state => !state);
    };

    let boxPoke = state.boxes[boxNum].map((pokemon, index) => {
        return <PokemonCard pokemon={ pokemon } boxNum={ boxNum } pokeNum={ boxNum * boxSize + index } updateProgress={ () => updateProgress() } />
    })

    const updateProgress = () => setBoxCaughtPercent(() => {
        return (state.boxes[boxNum].filter((item, index) => state.pokemon[boxNum * boxSize + index].caught).length / state.boxes[boxNum].length * 100).toFixed(2)
    }
    )

    return (
        <div className={ className }>
            <div className="boxHeader" onClick={ () => toggleCollapse() }>
                <div className="imgWrapper">
                    <img
                        src={ downChevron }
                        className={ collapsed ? "closed" : "open" }
                    />
                </div>
                <h2>{ `Box ${boxNum + 1}` }</h2>
                <div className="progressWrapper">
                    <ProgressBar
                        percentComplete={ boxCaughtPercent }
                        height="100%"
                        width="100%"
                    ></ProgressBar>
                </div>
            </div>
            <div className={ `${collapsed ? "closed" : "open"} boxContent` }>
                { boxPoke }
            </div>
        </div >
    );
}

const StyledBox = styled(Box)`
    width: 90vw;
    border: solid black 1px;
    margin: 20px 0;
    .imgWrapper {
        height: 0;
        /* transition: all 0.1s linear; */
        .closed {
            transition: all 0.15s linear;
            transform: rotate(180deg);
        }
        .open {
            transition: all 0.15s linear;
        }
    }
    h2 {
        color: white;
        background-color: black;
        width: 100%;
        text-align: center;
        padding: 15px 0;
        img {
            float: left;
            height: 32px;
            width: 32px;
        }
    }
    .boxHeader {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        align-items: center;
        background-color: black;
        .imgWrapper {
            grid-column: 1 / 3;
            height: 100%;
            width: 100%;
            > img {
                filter: invert(100%);
                width: 40px;
                height: 40px;
            }
        }
        h2 {
            grid-column: 3 / 5;
        }
        .progressWrapper {
            background-color: white;
            width: 95%;
            height: 80%;
            margin: 10px auto;
            display: flex;
            grid-column: 5 / 7;
            align-content: center;
            justify-content: center;
        }
    }
    & > .boxContent {
        transition: max-height 0.2s linear;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
        outline: 1px solid black;
        overflow: hidden;
        max-height: 635px;
        &.closed {
            max-height: 0;
        }
    }
`;

export default StyledBox;
