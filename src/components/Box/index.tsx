import React, { useState } from "react";
import styled from "styled-components";
import PokemonCard from "../PokemonCard";
import ProgressBar from "../ProgressBar";
import { useGetPokemonSpeciesAllQuery } from "../../features/pokedex/pokeApiSlice";

interface BoxProps {
    className?: string;
    boxNum: number;
    id: string;
    key: any;
}

function Box({className, boxNum}: BoxProps) {
    // const { state } = useApp();
    const boxSize = 30;
    const [boxCaughtPercent, setBoxCaughtPercent] = useState("0");
    const {isLoading, data, isSuccess} = useGetPokemonSpeciesAllQuery();

    // const updateProgress = useCallback(() => setBoxCaughtPercent(() => {
    //     return (state.boxes[boxNum].filter((item, index) => state.pokemon[boxNum * boxSize + index].caught).length / state.boxes[boxNum].length * 100).toFixed(2)
    // }
    // ), [boxNum, state.boxes, state.pokemon])

    const updateProgress = () => {}

    // useEffect(() => {
    //     updateProgress()
    // }, [updateProgress])

    // return (
    //     <div className={ className } data-role="panel" data-title-caption={ `Box ${boxNum + 1}` } data-collapsible="true">
    //         <ProgressBar percentComplete={ boxCaughtPercent } />
    //         <div className="display-data">
    //             {/* { boxPoke } */}
    //         </div>
    //     </div>
    // );

    return (
            <div className={ className } data-role="panel" data-title-caption={ `Box ${boxNum + 1}` } data-collapsible="true">
                {isLoading && (
                    <div>Loading</div>
                )}
                {isSuccess && data && (
                    <div id='boxContainer'>
                        <ProgressBar percentComplete={boxCaughtPercent} />
                        <div className="display-data">
                            {data.results.map((pokemon, index) => {
                                return <PokemonCard pokemon={pokemon} boxNum={boxNum} pokeNum={boxNum * boxSize + index} updateProgress={updateProgress} />
                            })}
                        </div>
                    </div>
                )}
            </div>
    )

}

const StyledBox = styled(Box)`
    width: 1048px;
    margin-top: 25px;
    height: fit-content;
    .display-data {
        margin-top: 10px;
        width: 100%;
        height: 100%;
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    }
    #boxContainer {
        width: 100%;
    }
`

export default StyledBox;
