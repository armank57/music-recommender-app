import { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  const topTracksIds = []; // ids for getting recommendations
  const chunkedTopTrackIds = [];
  const recommendedTracks = []; // URIs for making playlists

  const [oldTracks, setOldTracks] = useState([]); // info for old tracks for DisplaySongs
  const [newTracks, setNewTracks] = useState([]); // info for new tracks for DisplaySongs
  const [recsUri, setRecsUri] = useState([]); // holds the uris for recommendations for the button event handler

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

  useEffect(() => {
    async function loadTracks() {
      try {
        const result = await getTopTracks();
        const oldTracksData = result.map((track) => ({
          name: track.name,
          album: track.album.name,
          artists: track.artists,
          image: track.album.images[0].url,
          id: track.id,
        }));
        setOldTracks(oldTracksData);

        for (let i = 0; i < 50; i++) {
          topTracksIds[i] = result[i].id;
        }

        parseTopTracks();

        /* Fills the recommendedTracks array */

        const newTracksData = [];
        let counter = 0;
        for (let i = 0; i < 10; i++) {
          const tempRecs = await getRecommendations(i);
          for (let j = 0; j < 5; j++) {
            recommendedTracks[counter] = tempRecs[j].uri;
            newTracksData[counter] =
              {
                name: tempRecs[j].name,
                album: tempRecs[j].album.name,
                artists: tempRecs[j].artists,
                image: tempRecs[j].album.images[0].url,
                id: tempRecs[j].id,
              };
            counter++;
          }
        }

        setRecsUri(recommendedTracks);
        setNewTracks(newTracksData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    }

    loadTracks();
  }, []);

  /* Upon click, we get the top tracks that the user listens to */
  const handleClick = async () => {
    if (!isClicked) {
      setIsClicked(true);

      const createdPlaylist = await createPlaylist(recsUri);
      console.log(createdPlaylist);

      setPlaylistMade(true);
    }
  };

  return (
        <div>
          { isLoading ?
          <h3>Loading...</h3>
          : (isClicked && playlistMade) ?
            <DisplaySongs tracks={oldTracks}/>
            : <button onClick={handleClick}>Click me!</button>
          }
        </div>
  );
}

export default GenerateRecs;