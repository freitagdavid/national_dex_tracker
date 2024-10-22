import React from "react";
import ProgressBar from "../ProgressBar"
import '@material/top-app-bar/dist/mdc.top-app-bar.css'
import { useAppSelector } from "../../app/hooks";
import { selectPercentCaught } from "../../features/pokedex/listSlice";

const Header = props => {

    // const { state } = useApp();
    const percentComplete = useAppSelector(selectPercentCaught);
    

    return (
        <div data-role="appbar">
            <a href="#/" className="brand">National Dex Tracker</a>
            <ProgressBar percentComplete={ percentComplete } />
        </div>
    );
};

export default Header;
