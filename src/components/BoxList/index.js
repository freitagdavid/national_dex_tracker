import React, { Suspense } from "react";
import styled from "styled-components";
import { useApp } from "../../app/"
// import Box from "../Box";

const Box = React.lazy(() => import("../Box"));

const BoxList = props => {
    const { state } = useApp();
    const { className } = props;
    let boxes = [];
    let numBoxes = state.numBoxes
    for (let i = 0; i < numBoxes; i++) {
        boxes.push(<Box id={ `box-${i}` } boxNum={ i } key={ i } />);
    }

    return (
        <Suspense fallback={ <p>Loading</p> }>
            <div className={ className }>{ boxes }</div>
        </Suspense>
    );
};

export default BoxList;
