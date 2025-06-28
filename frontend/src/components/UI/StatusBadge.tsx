import React from 'react'

interface StatusBadgeProps {
  status: string
  type?: 'booking' | 'payment' | 'user' | 'provider'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'booking' }) => {
  const getStatusConfig = () => {
    const configs = {
      booking: {
        pending: { class: 'badge-warning', text: 'Pending' },
        confirmed: { class: 'badge-info', text: 'Confirmed' },
        in_progress: { class: 'badge-info', text: 'In Progress' },
        completed: { class: 'badge-success', text: 'Completed' },
        cancelled: { class: 'badge-error', text: 'Cancelled' },
        disputed: { class: 'badge-error', text: 'Disputed' },
      },
      payment: {
        pending: { class: 'badge-warning', text: 'Pending' },
        processing: { class: 'badge-info', text: 'Processing' },
        completed: { class: 'badge-success', text: 'Completed' },
        failed: { class: 'badge-error', text: 'Failed' },
        refunded: { class: 'badge-gray', text: 'Refunded' },
      },
      user: {
        active: { class: 'badge-success', text: 'Active' },
        inactive: { class: 'badge-gray', text: 'Inactive' },
        verified: { class: 'badge-success', text: 'Verified' },
        unverified: { class: 'badge-warning', text: 'Unverified' },
      },
      provider: {
        verified: { class: 'badge-success', text: 'Verified' },
        unverified: { class: 'badge-warning', text: 'Pending' },
        active: { class: 'badge-success', text: 'Active' },
        inactive: { class: 'badge-gray', text: 'Inactive' },
      }
    }

    return configs[type][status] || { class: 'badge-gray', text: status }
  }

  const config = getStatusConfig()

  return (
    <span className={`badge ${config.class}`}>
      {config.text}
    </span>
  )
}

export default StatusBadge