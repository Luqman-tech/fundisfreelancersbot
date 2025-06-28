import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  UsersIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { fetchDashboardData } from '../store/slices/dashboardSlice'
import StatCard from '../components/UI/StatCard'
import DataTable from '../components/UI/DataTable'
import StatusBadge from '../components/UI/StatusBadge'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { stats, recentActivity, loading } = useSelector((state: RootState) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  const activityColumns = [
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <StatusBadge status={value} type="booking" />
      )
    },
    { key: 'description', title: 'Description' },
    { 
      key: 'amount', 
      title: 'Amount',
      render: (value: number) => value ? `KES ${value.toLocaleString()}` : '-'
    },
    { 
      key: 'timestamp', 
      title: 'Time',
      render: (value: string) => new Date(value).toLocaleString()
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Fundis & Freelancers admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change="+12% from last month"
          changeType="increase"
          icon={<UsersIcon className="h-6 w-6 text-primary-600" />}
        />
        <StatCard
          title="Service Providers"
          value={stats?.totalProviders?.toLocaleString() || '0'}
          change="+8% from last month"
          changeType="increase"
          icon={<UserGroupIcon className="h-6 w-6 text-primary-600" />}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings?.toLocaleString() || '0'}
          change="+23% from last month"
          changeType="increase"
          icon={<CalendarIcon className="h-6 w-6 text-primary-600" />}
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${stats?.totalRevenue?.toLocaleString() || '0'}`}
          change="+15% from last month"
          changeType="increase"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-primary-600" />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Bookings"
          value={stats?.activeBookings?.toLocaleString() || '0'}
          icon={<ClockIcon className="h-6 w-6 text-warning-600" />}
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments?.toLocaleString() || '0'}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-warning-600" />}
        />
        <StatCard
          title="Completed Jobs"
          value={stats?.completedBookings?.toLocaleString() || '0'}
          icon={<ChartBarIcon className="h-6 w-6 text-success-600" />}
        />
        <StatCard
          title="Average Rating"
          value={stats?.averageRating?.toFixed(1) || '0.0'}
          icon={<ChartBarIcon className="h-6 w-6 text-success-600" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <DataTable
            columns={activityColumns}
            data={recentActivity}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="card space-y-4">
            <button className="btn btn-primary w-full">
              Verify Pending Providers
            </button>
            <button className="btn btn-secondary w-full">
              Review Disputed Bookings
            </button>
            <button className="btn btn-outline w-full">
              Export Monthly Report
            </button>
            <button className="btn btn-outline w-full">
              Send Platform Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard