import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { fetchUsers, updateUserStatus } from '../store/slices/usersSlice'
import DataTable from '../components/UI/DataTable'
import StatusBadge from '../components/UI/StatusBadge'

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading, pagination } = useSelector((state: RootState) => state.users)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10, search }))
  }, [dispatch, search])

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    await dispatch(updateUserStatus({ userId, isActive: !currentStatus }))
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (_, row: any) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <UserIcon className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.firstName} {row.lastName}</p>
            <p className="text-sm text-gray-500">{row.email || 'No email'}</p>
          </div>
        </div>
      )
    },
    { key: 'phoneNumber', title: 'Phone' },
    {
      key: 'role',
      title: 'Role',
      render: (value: string) => (
        <span className="capitalize px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'isVerified',
      title: 'Status',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'verified' : 'unverified'} type="user" />
      )
    },
    {
      key: 'isActive',
      title: 'Active',
      render: (value: boolean, row: any) => (
        <button
          onClick={() => handleStatusToggle(row.id, value)}
          className={`btn text-xs ${value ? 'btn-danger' : 'btn-primary'}`}
        >
          {value ? 'Deactivate' : 'Activate'}
        </button>
      )
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage platform users</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => dispatch(fetchUsers({ page: i + 1, limit: 10, search }))}
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

export default Users