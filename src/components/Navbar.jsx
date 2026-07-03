import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ theme }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Home', icon: '🏠', roles: ['vendor', 'customer'] },
    { to: '/my-vehicles', label: 'My Vehicles', icon: '🚗', roles: ['vendor'] },
    { to: '/add-vehicle', label: 'Add Vehicle', icon: '➕', roles: ['vendor'] },
    { to: '/wishlist', label: 'Wishlist', icon: '❤️', roles: ['customer'] },
    { to: '/my-bookings', label: 'Bookings', icon: '📋', roles: ['vendor', 'customer'] },
    { to: '/profile', label: 'Profile', icon: '👤', roles: ['vendor', 'customer'] },
    { to: '/settings', label: 'Settings', icon: '⚙️', roles: ['vendor', 'customer'] },
  ]

  const visibleLinks = links.filter(l => l.roles.includes(user?.role))

  const bg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className={`${bg} border-b sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className={`font-bold text-lg ${textColor} truncate`}>
            🚗 GetAuto
          </NavLink>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} hidden sm:block`}>
              {user?.name} ({user?.role})
            </span>
            <button onClick={() => setOpen(!open)} className={`p-2 rounded-md ${textColor} md:hidden`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="hidden md:flex items-center gap-1">
              {visibleLinks.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary text-white' : `${textColor} hover:bg-gray-100`
                    }`
                  }>
                  {l.icon} {l.label}
                </NavLink>
              ))}
              <button onClick={handleLogout}
                className={`px-3 py-2 rounded-md text-sm font-medium ${textColor} hover:bg-red-50 hover:text-red-600 transition-colors`}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div className={`md:hidden ${bg} border-b shadow-md z-30 relative`}>
          <div className="px-2 py-2 space-y-1">
            <div className={`px-3 py-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.name} · {user?.role}
            </div>
            {visibleLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'bg-primary text-white' : `${textColor} hover:bg-gray-100`
                  }`
                }>
                {l.icon} {l.label}
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}
