import React from 'react'
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import StatCard from '../components/UI/StatCard'

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value="KES 2,450,000"
          change="+18% from last month"
          changeType="increase"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-success-600" />}
        />
        <StatCard
          title="New Users"
          value="1,234"
          change="+12% from last month"
          changeType="increase"
          icon={<UsersIcon className="h-6 w-6 text-primary-600" />}
        />
        <StatCard
          title="Booking Rate"
          value="78%"
          change="+5% from last month"
          changeType="increase"
          icon={<TrendingUpIcon className="h-6 w-6 text-success-600" />}
        />
        <StatCard
          title="Platform Growth"
          value="23%"
          change="+3% from last month"
          changeType="increase"
          icon={<ChartBarIcon className="h-6 w-6 text-primary-600" />}
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Revenue chart will be implemented here</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">User growth chart will be implemented here</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
          <div className="space-y-4">
            {[
              { name: 'Plumbing', bookings: 234, percentage: 85 },
              { name: 'Electrical', bookings: 189, percentage: 70 },
              { name: 'Cleaning', bookings: 156, percentage: 58 },
              { name: 'Tutoring', bookings: 123, percentage: 45 },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${service.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Providers</h3>
          <div className="space-y-4">
            {[
              { name: 'John\'s Plumbing', rating: 4.9, jobs: 45 },
              { name: 'ElectroFix', rating: 4.8, jobs: 38 },
              { name: 'Clean Masters', rating: 4.7, jobs: 32 },
              { name: 'Math Tutors', rating: 4.9, jobs: 28 },
            ].map((provider, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{provider.name}</p>
                  <p className="text-sm text-gray-500">⭐ {provider.rating} • {provider.jobs} jobs</p>
                </div>
                <span className="badge badge-success">Top Rated</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics