import React from "react"
import styled from "styled-components";

function ProgressBar(props) {
    let { percentComplete, className } = props;
    return (
        <div data-role="progress" data-type="buffer" data-value={ percentComplete } data-buffer={ 100 } />
    );
}

export default ProgressBar;
