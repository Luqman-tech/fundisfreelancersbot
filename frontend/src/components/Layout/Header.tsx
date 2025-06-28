import React from 'react'
import { useDispatch } from 'react-redux'
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline'
import { logout } from '../../store/slices/authSlice'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">
              Fundis & Freelancers Admin
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
            <BellIcon className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button
              onClick={handleLogout}
              className="btn btn-outline text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header