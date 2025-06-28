import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Service {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  duration: number
  isActive: boolean
  provider: {
    businessName: string
    user: {
      firstName: string
      lastName: string
    }
  }
  category: {
    name: string
  }
  createdAt: string
}

interface ServicesState {
  services: Service[]
  selectedService: Service | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: ServicesState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/services', {
        params: { page, limit, search }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services')
    }
  }
)

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false
        state.services = action.payload.data.services
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedService } = servicesSlice.actions
export default servicesSlice.reducer