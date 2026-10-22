const axios = require('axios');
const https = require('https');
const http = require('http');

if (!process.env.TMDB_ACCESS_TOKEN && !process.env.TMDB_API_KEY) {
  console.warn('⚠️  TMDB credentials not configured. Movie data will not be available.');
}

const httpsAgent = new https.Agent({
  family: 4,
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 15000,
});

const httpAgent = new http.Agent({
  family: 4,
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 15000,
});

const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  timeout: 15000,
  httpAgent,
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.TMDB_ACCESS_TOKEN
      ? { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
      : {}),
  },
  params: {
    ...(process.env.TMDB_API_KEY && !process.env.TMDB_ACCESS_TOKEN
      ? { api_key: process.env.TMDB_API_KEY }
      : {}),
  },
});

// Automatic retry with exponential backoff on network/TLS disconnects or 5xx errors
tmdbClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const maxRetries = 3;

    const isRetryable =
      !error.response ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('socket disconnected')) ||
      (error.message && error.message.toLowerCase().includes('tls')) ||
      (error.response && error.response.status >= 500);

    if (isRetryable && config.__retryCount < maxRetries) {
      config.__retryCount += 1;
      const delayMs = config.__retryCount * 250;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return tmdbClient(config);
    }

    const msg = error.response?.data?.status_message || error.message;
    console.error(`TMDB API Error: ${msg}`);
    return Promise.reject(error);
  }
);

module.exports = tmdbClient;
