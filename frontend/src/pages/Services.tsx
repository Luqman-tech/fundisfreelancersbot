import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { fetchServices } from '../store/slices/servicesSlice'
import DataTable from '../components/UI/DataTable'
import StatusBadge from '../components/UI/StatusBadge'

const Services: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { services, loading, pagination } = useSelector((state: RootState) => state.services)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchServices({ page: 1, limit: 10, search }))
  }, [dispatch, search])

  const columns = [
    {
      key: 'title',
      title: 'Service',
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
            <WrenchScrewdriverIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.category.name}</p>
          </div>
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
      key: 'price',
      title: 'Price',
      render: (value: number, row: any) => (
        <div>
          <p className="font-medium text-gray-900">KES {value.toLocaleString()}</p>
          <p className="text-xs text-gray-500 capitalize">{row.priceType}</p>
        </div>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (value: number) => value ? `${value} mins` : 'Variable'
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'active' : 'inactive'} type="provider" />
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage platform services</p>
        </div>
        <div className="text-sm text-gray-600">
          {services.filter(s => s.isActive).length} active services
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Services Table */}
      <DataTable
        columns={columns}
        data={services}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => dispatch(fetchServices({ page: i + 1, limit: 10, search }))}
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

export default Services