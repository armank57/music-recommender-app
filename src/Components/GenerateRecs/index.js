import { useState } from 'react';
import './GenerateRecs.css';
import DisplaySongs from '../DisplaySongs';

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

  const [isClicked, setIsClicked] = useState(false);
  const [playlistMade, setPlaylistMade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const topTracksIds = []; // ids for getting recommendations
  const chunkedTopTrackIds = [];
  const recommendedTracks = []; // URIs for making playlists

  const oldTracks = []; // info for old tracks for DisplaySongs
  const newTracks = []; // info for new tracks for DisplaySongs

  const sampleTracks = [
    {
      name: "Mo Bamba",
      artists: ["Shek Wes"],
      album: "Sample Album",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Single.jpg/2324px-Banana-Single.jpg",
      id: "000x",
    }
  ];

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
      setIsLoading(true);

      const result = await getTopTracks();
      for (let i = 0; i < 50; i++) {
        topTracksIds[i] = result[i].id;
        oldTracks[i] = {
          name: result[i].name,
          album: result[i].album.name,
          artists: result[i].artists,
          image: result[i].album.images[0].url,
          id: result[i].id,
        };
      }

      parseTopTracks();
      
      /* Fills the recommendedTracks array */
      let counter = 0;
      for (let i = 0; i < 10; i++) {
        const tempRecs = await getRecommendations(i);
        for (let j = 0; j < 5; j++) {
          recommendedTracks[counter] = tempRecs[j].uri;
          newTracks[counter] = {
            name: tempRecs[j].name,
            album: tempRecs[j].album.name,
            artists: tempRecs[j].artists,
            image: tempRecs[j].album.images[0].url,
            id: tempRecs[j].id,
          };
          counter++;
        }
      }

      const createdPlaylist = await createPlaylist(recommendedTracks);
      setPlaylistMade(true);
      setIsLoading(false);

    }
  };

  return (
        <div>
          <button onClick={handleClick}>Click me!</button>

          { isLoading ?
          <h3>Loading...</h3>
          : (isClicked && playlistMade) ?
            <DisplaySongs tracks={sampleTracks}/>
            : <h3>Nothing to see</h3>
          }
        </div>
  );
}

export default GenerateRecs;