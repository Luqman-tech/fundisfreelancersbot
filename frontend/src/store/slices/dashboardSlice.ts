import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface DashboardStats {
  totalUsers: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  activeBookings: number
  pendingPayments: number
  completedBookings: number
  averageRating: number
}

interface RecentActivity {
  id: string
  type: 'booking' | 'payment' | 'registration'
  description: string
  timestamp: string
  amount?: number
}

interface DashboardState {
  stats: DashboardStats | null
  recentActivity: RecentActivity[]
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  loading: false,
  error: null,
}

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/recent-activity')
      ])
      
      return {
        stats: statsResponse.data.data,
        recentActivity: activityResponse.data.data
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
        state.recentActivity = action.payload.recentActivity
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer