import React from 'react';
import './Heading.css';

const Heading = () => {
    return (
        <div className="flex_container">
            <div className="flex_items">
                <img src={require('../../MusicMonkey.JPG')} width={300} height={300} className="logo" alt="Logo"></img>
            </div>

            <div className="flex_items">
                <h1 className="title">Chimp 'n Beats</h1>
                <p className="instructions">
                    Your personal music recommender! Log in to Spotify to view your recent listening history 
                    from the past month, and we will generate a list of recommendations and a playlist to listen to right away in Spotify.
                </p>
            </div>
        </div>
    );
}

export default Heading;