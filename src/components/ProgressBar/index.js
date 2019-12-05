import React from "react"

function ProgressBar(props) {
    let { percentComplete } = props;
    return (
        <div data-role="progress" data-type="buffer" data-value={ percentComplete } data-buffer={ 100 } />
    );
}

export default ProgressBar;
