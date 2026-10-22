import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
// Guard against outdated placeholder URLs or missing production environment variables
const API_BASE_URL =
  rawApiUrl && !rawApiUrl.includes('cinescope-api.onrender.com')
    ? rawApiUrl
    : import.meta.env.PROD
    ? 'https://moviedata-98yi.onrender.com/api'
    : 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor with automatic retry for idempotent GET requests
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config
    config.__retryCount = config.__retryCount || 0

    // Retry up to 2 times for GET requests that encounter network or 5xx errors (e.g. Render spinning up)
    if (
      config &&
      config.method === 'get' &&
      config.__retryCount < 2 &&
      (!error.response || error.response.status >= 500)
    ) {
      config.__retryCount += 1
      const delay = config.__retryCount === 1 ? 800 : 1800
      await new Promise((r) => setTimeout(r, delay))
      return api(config)
    }

    let message = error.response?.data?.message
    if (!message) {
      if (error.response?.status === 503 || error.response?.status === 502) {
        message = 'Server is waking up (Render free tier). Please wait a few seconds and try again.'
      } else if (!error.response && error.message) {
        message = 'Unable to reach CineScope server. It may be starting up, please try again.'
      } else {
        message = 'An unexpected error occurred'
      }
    }
    const status = error.response?.status

    // Return a structured error
    return Promise.reject({
      message,
      status,
      errors: error.response?.data?.errors || [],
    })
  }
)

export default api
