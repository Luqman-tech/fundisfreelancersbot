import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { fetchProviders, verifyProvider } from '../store/slices/providersSlice'
import DataTable from '../components/UI/DataTable'
import StatusBadge from '../components/UI/StatusBadge'

const Providers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { providers, loading, pagination } = useSelector((state: RootState) => state.providers)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchProviders({ page: 1, limit: 10, search }))
  }, [dispatch, search])

  const handleVerifyToggle = async (providerId: string, currentStatus: boolean) => {
    await dispatch(verifyProvider({ providerId, isVerified: !currentStatus }))
  }

  const columns = [
    {
      key: 'businessName',
      title: 'Provider',
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-700">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">
              {row.user.firstName} {row.user.lastName}
            </p>
          </div>
        </div>
      )
    },
    { 
      key: 'phoneNumber', 
      title: 'Phone',
      render: (_, row: any) => row.user.phoneNumber
    },
    {
      key: 'hourlyRate',
      title: 'Rate',
      render: (value: number) => `KES ${value}/hr`
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (value: number, row: any) => (
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm font-medium">{value.toFixed(1)}</span>
          <span className="text-xs text-gray-500 ml-1">({row.totalReviews})</span>
        </div>
      )
    },
    {
      key: 'completedJobs',
      title: 'Jobs',
      render: (value: number) => (
        <span className="text-sm font-medium">{value} completed</span>
      )
    },
    {
      key: 'isVerified',
      title: 'Status',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'verified' : 'unverified'} type="provider" />
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row: any) => (
        <button
          onClick={() => handleVerifyToggle(row.id, row.isVerified)}
          className={`btn text-xs ${row.isVerified ? 'btn-outline' : 'btn-primary'}`}
        >
          {row.isVerified ? 'Unverify' : 'Verify'}
        </button>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600">Manage and verify service providers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <CheckBadgeIcon className="h-5 w-5 text-success-600 mr-1" />
            {providers.filter(p => p.isVerified).length} verified
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Providers Table */}
      <DataTable
        columns={columns}
        data={providers}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => dispatch(fetchProviders({ page: i + 1, limit: 10, search }))}
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

export default Providers