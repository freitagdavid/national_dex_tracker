import React from "reactn";
import styled from "styled-components";

function ProgressBar(props) {
    let { total, complete, className } = props;
    return (
        <span className={className}>
            <span>{(complete / total) * 100}%</span>
        </span>
    );
}

const StyledProgressBar = styled(ProgressBar)`
    position: relative;
    display: flex;
    width: 90vw;
    height: 40px;
    justify-content: center;
    align-items: center;
    outline: solid black 1px;
    margin: 0 auto;
    span {
        &:after {
        content:'\\A';
        position: absolute;
        background: red;
        top:0;
        bottom:0;
        left:0;
        width: ${props => `${(props.complete / props.total) * 100}%`};
        }
    }
    span {
        /* width: ${props => `${(props.complete / props.total) * 100}%`}; */
        /* background-color: red; */

    }
`;

export default StyledProgressBar;
