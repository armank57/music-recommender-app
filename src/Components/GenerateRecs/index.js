import { useState } from 'react';
import './GenerateRecs.css'

async function fetchWebApi(endpoint, method, body) {
  let accessToken = localStorage.getItem('access_token');
  
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      method,
      body: JSON.stringify(body)
    });
  return await res.json();
}

function GenerateRecs() {

  const [isClicked, setIsClicked] = useState(null);
  const topTracksIds = [];
  const chunkedTopTrackIds = [];

  /* Parses the topTrackIds into chunks of 5 */
  function parseTopTracks() {
    let counter = 0;
    for (let i = 0; i < 10; i++) {
      const temp = [];
      for (let j = 0; j < 5; j++) {
        temp[j] = topTracksIds[counter];
        counter++;
      }
      chunkedTopTrackIds.push(temp);
    }  
  }
  
  async function getTopTracks() {
    return (await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=50', 'GET')).items;
  }

  async function getRecommendations() {
    return (await fetchWebApi(`v1/recommendations?limit=50&seed_tracks=${topTracksIds.join(',')}`), 'GET').tracks;
  }

  /* Upon click, we get the top tracks that the user listens to */
  const handleClick = async () => {
    if (!isClicked) {
      setIsClicked(true);
      const result = await getTopTracks();
      for (let i = 0; i < 50; i++) {
        topTracksIds[i] = result[i].id;
      }

      parseTopTracks();
      console.table(chunkedTopTrackIds);

     /* const recommendedTracks = await getRecommendations();
      for (let i = 0; i < 50; i++) {
        console.log(recommendedTracks[i].name);
      } */
    }
  };

  return (
        <button onClick={handleClick}>Click me!</button>
  );
}

export default GenerateRecs;