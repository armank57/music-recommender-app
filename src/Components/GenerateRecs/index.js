import React from 'react';
import './GenerateRecs.css'

async function fetchWebApi(endpoint, method, body, token) {
    const res = await fetch('https://api.spotify.com/${endpoint}', {
      headers: {
        Authorization: 'Bearer ${token}',
      },
      method,
      body: JSON.stringify(body)
    });
    return await res.json();
  }

function GenerateRecs({ token }) {


  async function getTopTracks() {
    return (await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=50', 'GET')).items;
  }

  /* Upon click, we get the top tracks that the user listens to */
  const handleClick = async () => {
    const result = await getTopTracks();
  };

  return (
        <button onClick={handleClick}>Click me!</button>
  );
}

export default GenerateRecs;