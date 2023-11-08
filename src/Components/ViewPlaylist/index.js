import React from 'react';
import './ViewPlaylist.css';

const ViewPlaylist = ({ playlistURL }) => {

    function openInNewTab(url) {
        window.open(url, '_blank').focus();
    }

    const handleClick = () => {
        openInNewTab(playlistURL);
    }

    return(
        <button onClick={handleClick} className="button-1" role="button">View Your Playlist Now!</button>
    );
}

export default ViewPlaylist;