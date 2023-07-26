import { useEffect, useState } from 'react';
import { GenerateRecs } from './Components';
import './App.css';

function App() {

  const CLIENT_ID = "3bfca1a4fbc94f3f9a861b34e5c8d61f";
  const REDIRECT_URI = "http://localhost:3000";
  const SCOPES = 'user-top-read playlist-modify-private';

  const [access_token, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [refresh_token, setRefreshToken] = useState(() => localStorage.getItem('refresh_token') || null);
  const [expires_at, setExpiresAt] = useState(() => localStorage.getItem('expires_at') || null);

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
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
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
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);

    const t = new Date();
    const expirationTime = t.setSeconds(t.getSeconds() + data.expires_in);
    setExpiresAt(expirationTime);

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('expires_at', expirationTime);
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

  const isTokenExpired = () => {
    if (!expires_at) return true;
    const expirationTime = parseInt(expires_at, 10);
    const currentTime = Date.now();
    return currentTime >= expirationTime;
  };

  useEffect(() => {
    if (isTokenExpired() && refresh_token) {
      refreshToken();
    }
  }, [expires_at, refresh_token])

  useEffect( () => {
    const args = new URLSearchParams(window.location.search);
    let code = args.get('code');
    let token = localStorage.getItem('access_token');

    if (code && !token) {
      exchangeToken(code);
    } 
  }, [])

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>MusicCrafter</h1>
        <p>
          Your personal music recommender! Log-in to Spotify to view your recent listening history, 
          and we'll generate recommendations and a playlist to listen to right away in Spotify.
        </p>

        { !access_token ?
        <button onClick={redirectToAuth}>Log In</button>
        : <button onClick={logout}>Logout</button>
        }

        { access_token ?
        <GenerateRecs />
        : <h3>Please log-in to gain access to the rest of the page.</h3>
        }

      </header>
    </div>
  );
}

export default App;
