import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { fetchBookings } from '../store/slices/bookingsSlice'
import DataTable from '../components/UI/DataTable'
import StatusBadge from '../components/UI/StatusBadge'

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { bookings, loading, pagination } = useSelector((state: RootState) => state.bookings)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    dispatch(fetchBookings({ page: 1, limit: 10, status: statusFilter }))
  }, [dispatch, statusFilter])

  const columns = [
    {
      key: 'id',
      title: 'Booking ID',
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-600">#{value.slice(-8)}</span>
      )
    },
    {
      key: 'service',
      title: 'Service',
      render: (_, row: any) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
            <CalendarIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.service.title}</p>
            <p className="text-sm text-gray-500">{row.title}</p>
          </div>
        </div>
      )
    },
    {
      key: 'client',
      title: 'Client',
      render: (_, row: any) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.client.firstName} {row.client.lastName}
          </p>
          <p className="text-sm text-gray-500">{row.client.phoneNumber}</p>
        </div>
      )
    },
    {
      key: 'provider',
      title: 'Provider',
      render: (_, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{row.provider.businessName}</p>
          <p className="text-sm text-gray-500">
            {row.provider.user.firstName} {row.provider.user.lastName}
          </p>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => (
        <span className="font-medium text-gray-900">KES {value.toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => <StatusBadge status={value} type="booking" />
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      render: (value: string) => <StatusBadge status={value} type="payment" />
    },
    {
      key: 'scheduledDate',
      title: 'Scheduled',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
  ]

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage platform bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => dispatch(fetchBookings({ page: i + 1, limit: 10, status: statusFilter }))}
                className={`px-3 py-2 text-sm rounded-md ${
                  pagination.page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings