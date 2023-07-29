import React from 'react';
import './TwoLists.css';
import DisplaySongs from '../DisplaySongs';

const TwoLists = ({ left, right }) => {
    return(
        <div style={{display: 'flex'}}>
            <div style={{ flex: 1 }}>
                <DisplaySongs tracks={left} />
            </div>
            <div style={{ flex: 1 }}>
                <DisplaySongs tracks={right} />
            </div>
        </div>
    );
}

export default TwoLists;