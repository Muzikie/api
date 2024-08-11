// src/api/song/services/music.ts

import axios from 'axios';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let tokenData: { access_token: string, expires_at: number } | null = null;

const getSpotifyAccessToken = async () => {
  if (tokenData && Date.now() < tokenData.expires_at) {
    return tokenData.access_token;
  }

  if (!CLIENT_ID) {
    throw new Error('CLIENT_ID env variable is missing');
  }

  if (!CLIENT_SECRET) {
    throw new Error('CLIENT_SECRET env variable is missing');
  }

  const tokenResponse = await axios.post(SPOTIFY_TOKEN_URL, null, {
    params: {
      grant_type: 'client_credentials',
    },
    auth: {
      username: CLIENT_ID,
      password: CLIENT_SECRET,
    },
  });
  const { access_token, expires_in } = tokenResponse.data;
  const expires_at = Date.now() + expires_in * 1000;
  tokenData = { access_token, expires_at };

  return access_token;
};

const fetchFromSpotify = async (id: string) => {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    return undefined;
  }

  const response = await axios.get(`${SPOTIFY_API_URL}/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

const platformHandlers = {
  spotify: fetchFromSpotify,
  // Add other platforms like Apple Music here
};

export const fetchFromPlatform = async (platform: string, id: string) => {
  const handler = platformHandlers[platform];

  if (!handler) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const data = await handler(id);
  return [{ platform, data }];
};

export default {
  fetchFromPlatform,
};
