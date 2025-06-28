import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Provider {
  id: string
  businessName: string
  description: string
  hourlyRate: number
  rating: number
  totalReviews: number
  completedJobs: number
  isVerified: boolean
  isActive: boolean
  user: {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
  }
  location?: {
    name: string
  }
  createdAt: string
}

interface ProvidersState {
  providers: Provider[]
  selectedProvider: Provider | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: ProvidersState = {
  providers: [],
  selectedProvider: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export const fetchProviders = createAsyncThunk(
  'providers/fetchProviders',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/providers', {
        params: { page, limit, search }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch providers')
    }
  }
)

export const verifyProvider = createAsyncThunk(
  'providers/verify',
  async ({ providerId, isVerified }: { providerId: string; isVerified: boolean }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/admin/providers/${providerId}/verify`, { isVerified })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify provider')
    }
  }
)

const providersSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedProvider: (state, action) => {
      state.selectedProvider = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false
        state.providers = action.payload.data.providers
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(verifyProvider.fulfilled, (state, action) => {
        const updatedProvider = action.payload.data
        const index = state.providers.findIndex(provider => provider.id === updatedProvider.id)
        if (index !== -1) {
          state.providers[index] = updatedProvider
        }
      })
  },
})

export const { clearError, setSelectedProvider } = providersSlice.actions
export default providersSlice.reducer