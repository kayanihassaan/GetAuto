import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import db from '../db/database'
import { useAuth } from '../context/AuthContext'

const TYPE_ICONS = { car: '🚙', bike: '🏍️', bus: '🚌' }

export default function MyVehicles({ theme }) {
  const { user } = useAuth()

  const vehicles = useLiveQuery(
    () => db.vehicles.where('ownerId').equals(user.id).reverse().toArray(),
    [user.id]
  )

  const vehicleIds = vehicles?.map(v => v.id) || []

  const bookings = useLiveQuery(
    () => vehicleIds.length ? db.bookings.where('vehicleId').anyOf(vehicleIds).toArray() : [],
    [vehicleIds.join(',')]
  )

  const allRatings = useLiveQuery(
    () => vehicleIds.length ? db.ratings.where('vehicleId').anyOf(vehicleIds).toArray() : [],
    [vehicleIds.join(',')]
  )

  const confirmedBookings = bookings?.filter(b => b.status !== 'cancelled') || []
  const totalRevenue = confirmedBookings.reduce((s, b) => s + (b.totalPrice || 0), 0)
  const totalRentals = confirmedBookings.length

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle permanently?')) return
    await db.vehicles.delete(id)
    await db.bookings.where('vehicleId').equals(id).delete()
  }

  const toggleBooked = async (v) => {
    await db.vehicles.update(v.id, { isBooked: !v.isBooked })
  }

  const getVehicleBookings = (vehicleId) => confirmedBookings.filter(b => b.vehicleId === vehicleId)
  const getVehicleRevenue = (vehicleId) => getVehicleBookings(vehicleId).reduce((s, b) => s + (b.totalPrice || 0), 0)
  const getVehicleRatings = (vehicleId) => allRatings?.filter(r => r.vehicleId === vehicleId) || []
  const getAvgRating = (vehicleId) => {
    const r = getVehicleRatings(vehicleId)
    return r.length ? (r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1) : '—'
  }

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${textColor}`}>My Dashboard</h1>
          <Link to="/add-vehicle"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-variant">
            + Add New
          </Link>
        </div>

        {/* Stats Cards */}
        {vehicles && vehicles.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className={`${cardBg} rounded-xl p-4 shadow-md text-center`}>
              <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
              <p className={`text-xs ${muted}`}>Listings</p>
            </div>
            <div className={`${cardBg} rounded-xl p-4 shadow-md text-center`}>
              <p className="text-2xl font-bold text-primary">{totalRentals}</p>
              <p className={`text-xs ${muted}`}>Total Rentals</p>
            </div>
            <div className={`${cardBg} rounded-xl p-4 shadow-md text-center`}>
              <p className="text-2xl font-bold text-primary">Rs.{totalRevenue.toLocaleString()}</p>
              <p className={`text-xs ${muted}`}>Total Revenue</p>
            </div>
            <div className={`${cardBg} rounded-xl p-4 shadow-md text-center`}>
              <p className="text-2xl font-bold text-primary">{allRatings?.length || 0}</p>
              <p className={`text-xs ${muted}`}>Reviews</p>
            </div>
          </div>
        )}

        {/* Vehicles List */}
        <h2 className={`text-lg font-semibold ${textColor} mb-3`}>Your Vehicles</h2>

        {!vehicles || vehicles.length === 0 ? (
          <div className={`text-center py-12 ${muted}`}>
            <p className="text-5xl mb-4">🚗</p>
            <p className="text-lg mb-4">You haven't listed any vehicles yet</p>
            <Link to="/add-vehicle" className="text-primary font-medium hover:underline">
              List your first vehicle
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map(v => {
              const vBookings = getVehicleBookings(v.id)
              const vRevenue = getVehicleRevenue(v.id)
              const vRatings = getVehicleRatings(v.id)
              const avg = getAvgRating(v.id)
              return (
                <div key={v.id} className={`${cardBg} rounded-xl p-4 shadow-md`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{TYPE_ICONS[v.type] || '🚗'}</span>
                        <h3 className={`font-semibold ${textColor} truncate`}>{v.name}</h3>
                        <span className={`text-sm ${muted}`}>- {v.variant}</span>
                        <span className="text-sm font-medium text-primary">Rs.{v.rentPerDay}/d</span>
                        {v.location && <span className={`text-xs ${muted}`}>📍{v.location}</span>}
                        {v.isBooked && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Booked</span>}
                      </div>
                      {/* Per-car stats */}
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className={muted}>📋 {vBookings.length} rentals</span>
                        <span className={muted}>💰 Rs.{vRevenue.toLocaleString()}</span>
                        <span className={muted}>
                          {'★'.repeat(Math.round(Number(avg)) || 0)}{'☆'.repeat(5 - Math.round(Number(avg) || 0))}
                          <span className="ml-1">{avg} ({vRatings.length})</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/edit-vehicle/${v.id}`}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-variant">
                        Edit
                      </Link>
                      <button onClick={() => toggleBooked(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          v.isBooked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}>
                        {v.isBooked ? 'Free' : 'Book'}
                      </button>
                      <button onClick={() => handleDelete(v.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
