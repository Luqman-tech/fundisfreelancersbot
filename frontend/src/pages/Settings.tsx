import React from 'react'
import { 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage platform settings and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CogIcon className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Platform Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Fundis & Freelancers"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@fundis.com"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Phone
              </label>
              <input
                type="tel"
                defaultValue="+254700000000"
                className="input"
              />
            </div>
            
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Commission (%)
              </label>
              <input
                type="number"
                defaultValue="5"
                min="0"
                max="100"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Booking Amount (KES)
              </label>
              <input
                type="number"
                defaultValue="100"
                min="0"
                className="input"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoPayouts"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="autoPayouts" className="ml-2 block text-sm text-gray-900">
                Enable automatic payouts to providers
              </label>
            </div>
            
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <BellIcon className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">New User Registrations</p>
                <p className="text-sm text-gray-500">Get notified when new users register</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Failures</p>
                <p className="text-sm text-gray-500">Get notified when payments fail</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Disputed Bookings</p>
                <p className="text-sm text-gray-500">Get notified about booking disputes</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                defaultValue="60"
                min="5"
                max="480"
                className="input"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">IP Whitelist</p>
                <p className="text-sm text-gray-500">Restrict admin access to specific IPs</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings