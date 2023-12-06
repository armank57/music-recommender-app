import React from 'react';
import {useState} from 'react';
import './DisplaySongs.css';

const DisplaySongs = ({ tracks }) => {    
    return (
        <div>
            {tracks.map((track) => (
                <div key={track.id} className="track-item">
                    <a href={track.link} target="_blank" rel="noreferrer">
                        <img src={track.image} alt={`Album art for ${track.album}`} />
                    </a>
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