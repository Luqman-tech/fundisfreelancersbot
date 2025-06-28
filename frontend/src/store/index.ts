import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import dashboardSlice from './slices/dashboardSlice'
import usersSlice from './slices/usersSlice'
import providersSlice from './slices/providersSlice'
import servicesSlice from './slices/servicesSlice'
import bookingsSlice from './slices/bookingsSlice'
import paymentsSlice from './slices/paymentsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    users: usersSlice,
    providers: providersSlice,
    services: servicesSlice,
    bookings: bookingsSlice,
    payments: paymentsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch