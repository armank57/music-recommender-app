import React from 'react';
import './Heading.css';

const Heading = () => {
    return (
        <div className="flex_container">
            <div className="flex_items">
                <h1>MusicCrafter</h1>
                <img src={require('../../MusicMonkey.JPG')} width={300} height={300} className="logo" alt="Logo"></img>
            </div>

            <div className="flex_items">
                <p className="instructions">
                    Your personal music recommender! Log-in to Spotify to view your recent listening history 
                    from the past month, and we'll generate recommendations and a playlist to listen to right away in Spotify.
                </p>
            </div>
        </div>
    );
}

export default Heading;