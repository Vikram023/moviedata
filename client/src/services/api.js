import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
    // Retry once for GET requests that encounter network errors or 5xx errors
    if (
      config &&
      config.method === 'get' &&
      !config.__retry &&
      (!error.response || error.response.status >= 500)
    ) {
      config.__retry = true
      await new Promise((r) => setTimeout(r, 400))
      return api(config)
    }

    const message = error.response?.data?.message || 'An unexpected error occurred'
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
