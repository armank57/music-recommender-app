import { useEffect, useState } from 'react';
import { GenerateRecs } from './Components'
import './App.css';

function App() {

  const CLIENT_ID = "3bfca1a4fbc94f3f9a861b34e5c8d61f";
  const CLIENT_SECRET = "136347fed86a4dd2ae50407d89fa0f4d";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPES = 'user-top-read playlist-modify-private';

  let access_token = localStorage.getItem('access_token');
  let refresh_token = localStorage.getItem('refresh_token');
  let expires_at = localStorage.getItem('expires_at');

  function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return base64encode(digest);
  }

  function generateUrlWithSearchParams(url, params) {
    const urlObject = new URL(url);
    urlObject.search = new URLSearchParams(params).toString();

    return urlObject.toString();
  }

  const redirectToAuth = () => {
    const codeVerifier = generateRandomString(64);

    generateCodeChallenge(codeVerifier).then((code_challenge) => {
      window.localStorage.setItem('code_verifier', codeVerifier);

      window.location = generateUrlWithSearchParams(
        'https://accounts.spotify.com/authorize',
        {
          response_type: 'code',
          client_id: CLIENT_ID,
          scope: SCOPES,
          code_challenge_method: 'S256',
          code_challenge: code_challenge,
          redirect_uri: REDIRECT_URI,
        },
      );
    });
  }

  function exchangeToken(code) {
    const code_verifier = localStorage.getItem('code_verifier');

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: code_verifier,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP status ' + response.status);
        }
        return response.json();
      })
      .then((data) => {
        processTokenResponse(data);

        window.history.replaceState({}, document.title, '/');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function refreshToken() {
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    })
      .then(addThrowErrorToFetch)
      .then(processTokenResponse)
      .catch(handleError);
  }

  function processTokenResponse(data) {
    console.log(data);

    access_token = data.access_token;
    refresh_token = data.refresh_token;

    const t = new Date();
    expires_at = t.setSeconds(t.getSeconds() + data.expires_in);

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);
  }

  function handleError(error) {
    console.error(error);
  }

  async function addThrowErrorToFetch(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('HTTP Status ' + response.status);
    }
  }

  const args = new URLSearchParams(window.location.search);
  let code = args.get('code');

  if (code) {
    // exchangeToken(code);
  } else if (access_token && refresh_token && expires_at) {

  }

  useEffect( () => {
    if (code) {
      exchangeToken(code);
    } else if (access_token && refresh_token && expires_at) {

    }
  }, [])

  const [token, setToken] = useState("");

/*  useEffect( () => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      
      window.location.hash = "";
      window.localStorage.setItem("token", token);
      setToken(token);
    }

  }, []) */

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("expires_at");
    window.localStorage.removeItem("code_verifier");
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Your New Top Hits</h1>
        <p>Discover new music based on your top songs! View what you've been listening to a lot of lately,
          and we'll generate recommendations and even a playlist to listen to right away in Spotify!
        </p>

        { !access_token ?
        /*<a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}>
          Log-in to Spotify
        </a> */
        <button onClick={redirectToAuth}>Log In</button>
        : <button onClick={logout}>Logout</button>
        }

        { access_token ?
        <GenerateRecs token={access_token}/>
        : <h3>Please log-in to gain access to the rest of the page.</h3>
        }

      </header>
    </div>
  );
}

export default App;
