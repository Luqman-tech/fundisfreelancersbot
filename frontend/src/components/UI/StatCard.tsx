import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon 
}) => {
  const changeColor = {
    increase: 'text-success-600',
    decrease: 'text-error-600',
    neutral: 'text-gray-600'
  }[changeType]

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColor}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard