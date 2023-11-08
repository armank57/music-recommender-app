import React from 'react';
import './TwoLists.css';
import DisplaySongs from '../DisplaySongs';

const TwoLists = ({ left, right }) => {
    return(
        <div className="flex_container">
            <div className="flex_items">
                <p className="text-1">Top Fifty Songs:</p>
                <DisplaySongs tracks={left} />
            </div>
            <div className="flex_items">
                <p className="text-1">Fifty Suggestions:</p>
                <DisplaySongs tracks={right} />
            </div>
        </div>
    );
}

export default TwoLists;