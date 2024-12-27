import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/Api'

interface AuthState {
  loading: boolean
  user: Record<string, any> | null
  error: string | null
}

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
}

// Login action
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('login', { email, password })

      // Сохраняем токены
      const { access_token, refresh_token, ...userData } = response.data
      localStorage.setItem(
        'access_token',
        JSON.stringify({
          access_token,
          ...userData,
        })
      )
      localStorage.setItem('refresh_token', refresh_token)

      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка при входе'
      return rejectWithValue(message)
    }
  }
)

// Register action
export const register = createAsyncThunk(
  'auth/register',
  async (
    { last_name, first_name, middle_name, email, role, password, confirmPassword }: Record<string, any>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('register', {
        last_name,
        first_name,
        middle_name,
        email,
        role,
        password,
        confirmPassword,
      })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка при регистрации'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer