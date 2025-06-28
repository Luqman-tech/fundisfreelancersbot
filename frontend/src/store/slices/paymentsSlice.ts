import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  transactionId: string
  mpesaReceiptNumber?: string
  phoneNumber: string
  platformFee: number
  providerAmount: number
  processedAt: string
  booking: {
    id: string
    title: string
    client: {
      firstName: string
      lastName: string
    }
  }
  createdAt: string
}

interface PaymentsState {
  payments: Payment[]
  selectedPayment: Payment | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async ({ page = 1, limit = 10, status = '' }: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/payments', {
        params: { page, limit, status }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments')
    }
  }
)

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload.data.payments
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedPayment } = paymentsSlice.actions
export default paymentsSlice.reducer