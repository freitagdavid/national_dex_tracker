import React from "react";
import ProgressBar from "../ProgressBar"
import '@material/top-app-bar/dist/mdc.top-app-bar.css'
import { useApp } from "../../app/";

const Header = props => {

    const { state } = useApp();

    return (
        <div data-role="appbar">
            <a href="#" className="brand">National Dex Tracker</a>
            <ProgressBar percentComplete={ state.percentComplete } />
        </div>
    );
};

export default Header;
