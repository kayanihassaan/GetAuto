import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/database'
import { useAuth } from '../context/AuthContext'
import RatingModal from '../components/RatingModal'

const TYPE_ICONS = { car: '🚙', bike: '🏍️', bus: '🚌' }

export default function MyBookings({ theme }) {
  const { user } = useAuth()
  const [rateVehicle, setRateVehicle] = useState(null)

  const bookings = useLiveQuery(
    () => db.bookings.where('userId').equals(user.id).reverse().toArray(),
    [user.id]
  )

  const vehicleIds = [...new Set(bookings?.map(b => b.vehicleId) || [])]

  const vehicles = useLiveQuery(
    () => vehicleIds.length ? db.vehicles.where('id').anyOf(vehicleIds).toArray() : [],
    [vehicleIds.join(',')]
  )

  const allRatings = useLiveQuery(
    () => (user?.id ? db.ratings.where('userId').equals(user.id).toArray() : []),
    [user?.id]
  )

  const ratedVehicleIds = new Set(allRatings?.map(r => r.vehicleId) || [])
  const vehicleMap = {}
  vehicles?.forEach(v => { vehicleMap[v.id] = v })

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const handleCancel = async (booking) => {
    if (!confirm('Cancel this booking?')) return
    await db.bookings.update(booking.id, { status: 'cancelled' })
    await db.vehicles.update(booking.vehicleId, { isBooked: false })
  }

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>
          {user.role === 'vendor' ? 'Bookings on My Vehicles' : 'My Bookings'}
        </h1>

        {!bookings || bookings.length === 0 ? (
          <div className={`text-center py-12 ${muted}`}>
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const v = vehicleMap[b.vehicleId]
              const canRate = b.status !== 'cancelled' && user.role === 'customer' && !ratedVehicleIds.has(b.vehicleId)
              return (
                <div key={b.id} className={`${cardBg} rounded-xl p-4 shadow-md`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {v && <span className="text-lg">{TYPE_ICONS[v.type] || '🚗'}</span>}
                        <h3 className={`font-semibold ${textColor}`}>{v?.name || `Vehicle #${b.vehicleId}`}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>{b.status || 'confirmed'}</span>
                      </div>
                      <p className={`text-sm ${muted} mt-1`}>
                        {b.customerName} · {b.contactNumber} · {b.paymentMethod}
                      </p>
                      <p className={`text-sm ${muted}`}>
                        {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      <p className={`text-sm font-medium ${textColor} mt-1`}>
                        Total: Rs. {b.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {canRate && (
                        <button onClick={() => setRateVehicle(v)}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-variant">
                          ⭐ Rate
                        </button>
                      )}
                      {ratedVehicleIds.has(b.vehicleId) && user.role === 'customer' && (
                        <span className="px-3 py-1.5 text-xs text-gray-400">Rated ✓</span>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(b)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {rateVehicle && (
        <RatingModal
          vehicle={rateVehicle}
          userId={user.id}
          onClose={() => setRateVehicle(null)}
          theme={theme}
        />
      )}
    </div>
  )
}
