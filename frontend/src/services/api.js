import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred'
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error. Please check your connection.'))
    } else {
      // Something else happened
      return Promise.reject(new Error('An unexpected error occurred'))
    }
  }
)

export const shortenUrl = async (longUrl) => {
  try {
    const response = await api.post('/data/shorten', {
      longUrl
    })
    return response
  } catch (error) {
    throw error
  }
}


export default api
