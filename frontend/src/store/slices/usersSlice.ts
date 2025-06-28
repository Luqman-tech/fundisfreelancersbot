import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  lastSeen: string
}

interface UsersState {
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/users', {
        params: { page, limit, search }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ userId, isActive }: { userId: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/admin/users/${userId}/status`, { isActive })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data.users
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.data
        const index = state.users.findIndex(user => user.id === updatedUser.id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
      })
  },
})

export const { clearError, setSelectedUser } = usersSlice.actions
export default usersSlice.reducer