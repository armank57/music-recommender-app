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

  const topTracksIds = []; // ids for getting recommendations
  const chunkedTopTrackIds = [];
  const recommendedTracks = []; // URIs for making playlists

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

  async function getRecommendations(index) {
    return (await fetchWebApi(`v1/recommendations?limit=5&seed_tracks=${chunkedTopTrackIds[index].join(',')}`, 'GET')).tracks;
  }

  async function createPlaylist(tracksUri) {
    const { id: user_id } = await fetchWebApi('v1/me', 'GET');

    const playlist = await fetchWebApi(`v1/users/${user_id}/playlists`, 'POST', {
      "name": "MusicCrafter's Playlist",
      "description": `Check out these songs, specificallly crafted for ${user_id}!`,
      "public": false
    });

    await fetchWebApi(`v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`, 'POST');

    return playlist;
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
      
      /* Fills the recommendedTracks array */
      let counter = 0;
      for (let i = 0; i < 10; i++) {
        const tempRecs = await getRecommendations(i);
        for (let j = 0; j < 5; j++) {
          recommendedTracks[counter] = tempRecs[j].uri;
          counter++;
        }
      }

      const createdPlaylist = await createPlaylist(recommendedTracks);
      console.log(createdPlaylist.name, createdPlaylist.id);

    }
  };

  return (
        <button onClick={handleClick}>Click me!</button>
  );
}

export default GenerateRecs;