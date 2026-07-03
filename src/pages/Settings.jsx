import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/database'

export default function Settings({ theme, setTheme }) {
  const [clearing, setClearing] = useState(false)
  const [showBookings, setShowBookings] = useState(false)

  const bookings = useLiveQuery(
    () => db.bookings.reverse().toArray(),
    []
  )

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const clearAllData = async () => {
    if (confirm('Delete ALL data? This cannot be undone!')) {
      setClearing(true)
      await db.cars.clear()
      await db.bookings.clear()
      setClearing(false)
      window.location.reload()
    }
  }

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>Settings</h1>

        <div className={`${cardBg} rounded-xl p-6 shadow-md space-y-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-semibold ${textColor}`}>Dark Mode</h2>
              <p className={`text-sm ${muted}`}>Toggle app theme</p>
            </div>
            <button onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

          <div>
            <button onClick={() => setShowBookings(!showBookings)}
              className="w-full text-left">
              <h2 className={`font-semibold ${textColor}`}>Booking History</h2>
              <p className={`text-sm ${muted}`}>{bookings?.length || 0} bookings made</p>
            </button>
            {showBookings && bookings && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {bookings.length === 0 ? (
                  <p className={`text-sm ${muted}`}>No bookings yet</p>
                ) : (
                  bookings.map(b => (
                    <div key={b.id} className={`p-3 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`font-medium ${textColor}`}>{b.customerName} - {new Date(b.startDate).toLocaleDateString()}</p>
                      <p className={muted}>Car #{b.carId} · Rs. {b.totalPrice} · {b.paymentMethod}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

          <div>
            <h2 className={`font-semibold ${textColor} mb-1`}>Danger Zone</h2>
            <button onClick={clearAllData} disabled={clearing}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">
              {clearing ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
