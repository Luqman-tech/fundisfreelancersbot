import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CreditCardIcon } from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { fetchPayments } from '../store/slices/paymentsSlice'
import DataTable from '../components/UI/DataTable'
import StatusBadge from '../components/UI/StatusBadge'

const Payments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { payments, loading, pagination } = useSelector((state: RootState) => state.payments)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    dispatch(fetchPayments({ page: 1, limit: 10, status: statusFilter }))
  }, [dispatch, statusFilter])

  const columns = [
    {
      key: 'transactionId',
      title: 'Transaction ID',
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-600">#{value.slice(-8)}</span>
      )
    },
    {
      key: 'booking',
      title: 'Booking',
      render: (_, row: any) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
            <CreditCardIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.booking.title}</p>
            <p className="text-sm text-gray-500">
              {row.booking.client.firstName} {row.booking.client.lastName}
            </p>
          </div>
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
      key: 'platformFee',
      title: 'Platform Fee',
      render: (value: number) => (
        <span className="text-sm text-gray-600">KES {value?.toLocaleString() || '0'}</span>
      )
    },
    {
      key: 'providerAmount',
      title: 'Provider Amount',
      render: (value: number) => (
        <span className="text-sm text-success-600">KES {value?.toLocaleString() || '0'}</span>
      )
    },
    {
      key: 'method',
      title: 'Method',
      render: (value: string) => (
        <span className="capitalize px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => <StatusBadge status={value} type="payment" />
    },
    {
      key: 'mpesaReceiptNumber',
      title: 'M-Pesa Receipt',
      render: (value: string) => value ? (
        <span className="font-mono text-xs text-gray-600">{value}</span>
      ) : '-'
    },
    {
      key: 'processedAt',
      title: 'Processed',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Pending'
    },
  ]

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage platform payments</p>
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

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => dispatch(fetchPayments({ page: i + 1, limit: 10, status: statusFilter }))}
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

export default Payments