import React from 'react';
import './DisplaySongs.css';

const DisplaySongs = ({ tracks }) => {
    console.log(tracks);
    return (
        <div className="track-list">
            {tracks.map((track) => (
                <div key={track.id} className="track-item">
                    <img src={track.image} alt={`Album cover: ${track.album}`} />
                    <p>{track.name}</p>
                </div>
            ))}
        </div>
    );
}

export default DisplaySongs;