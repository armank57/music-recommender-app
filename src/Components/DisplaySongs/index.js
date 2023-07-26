import React from 'react';
import './DisplaySongs.css';

const DisplaySongs = ({ tracks }) => {
    console.log(tracks);
    const artists = [];
    
    return (
        <div>
            {tracks.map((track) => (
                <div key={track.id} className="track-item">
                    <img src={track.image} alt={`Album art for ${track.album}`} />
                    <div className="track-details">
                        <h3 className="truncate">{track.name}</h3>
                        <p>{track.artists[0].name}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DisplaySongs;