import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Booking {
  id: string
  title: string
  description: string
  scheduledDate: string
  amount: number
  status: string
  paymentStatus: string
  client: {
    firstName: string
    lastName: string
    phoneNumber: string
  }
  provider: {
    businessName: string
    user: {
      firstName: string
      lastName: string
    }
  }
  service: {
    title: string
  }
  createdAt: string
}

interface BookingsState {
  bookings: Booking[]
  selectedBooking: Booking | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async ({ page = 1, limit = 10, status = '' }: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/bookings', {
        params: { page, limit, status }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.data.bookings
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedBooking } = bookingsSlice.actions
export default bookingsSlice.reducer