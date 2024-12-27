import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333/api/auth/',
  timeout: 1000,
})

api.defaults.headers.common['Content-Type'] = 'application/json'

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    if (response.config.url?.endsWith('/login') && response.status === 200) {
      const { token } = response.data
      localStorage.setItem('token', token)
      window.location.href = '/'
    }
    return response
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error("Сетевая ошибка:", error.message)
      error.message = "Ошибка соединения с сервером"
      return Promise.reject(error)
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tokens')
      window.location.href = '/login'
    }
    else {
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api