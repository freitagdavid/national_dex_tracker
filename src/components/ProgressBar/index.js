import React from "react"
import styled from "styled-components";

function ProgressBar(props) {
    let { percentComplete, className } = props;
    return (
        <span className={ className }>
            <span>{ percentComplete }%</span>
        </span>
    );
}

const StyledProgressBar = styled(ProgressBar)`
    position: relative;
    display: flex;
    width: ${props => `${props.width}`};
    height: ${props => `${props.height}`};
    justify-content: center;
    align-items: center;
    outline: solid black 1px;
    margin: 0 auto;
    span {
        font-weight: 700;
        font-size: 1.2rem;
        color: black;
        z-index: 1;
        &:after {
            z-index: -1;
            content: "\\A";
            position: absolute;
            background-color: red;
            top: 0;
            bottom: 0;
            left: 0;
            width: ${props => `${props.percentComplete}%`};
        }
    }
    span {
        /* background-color: red; */
    }
`;

export default StyledProgressBar;
