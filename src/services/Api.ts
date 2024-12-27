import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333/api/auth/',
  timeout: 1000,
})

api.defaults.headers.common['Content-Type'] = 'application/json'

api.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem('access_token')
    const token = tokenData ? JSON.parse(tokenData).access_token : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return Promise.reject(new Error('Ошибка соединения с сервером'))
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}refresh`, { refresh_token: refreshToken })
          const { access_token } = response.data

          const tokenData = JSON.parse(localStorage.getItem('access_token') || '{}')
          tokenData.access_token = access_token
          localStorage.setItem('access_token', JSON.stringify(tokenData))

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api