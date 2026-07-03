import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import db from '../db/database'
import BookingForm from './BookingForm'

const TYPE_ICONS = { car: '🚙', bike: '🏍️', bus: '🚌' }
const TYPE_COLORS = {
  car: 'from-yellow-500 to-yellow-700',
  bike: 'from-yellow-400 to-yellow-600',
  bus: 'from-yellow-600 to-amber-700',
}

export default function VehicleCard({ vehicle, onBooked, theme }) {
  const [showBooking, setShowBooking] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [avgRating, setAvgRating] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    db.wishlist.where({ userId: user.id, vehicleId: vehicle.id }).first()
      .then(w => setInWishlist(!!w))
    db.ratings.where('vehicleId').equals(vehicle.id).toArray()
      .then(ratings => {
        if (ratings.length) {
          setAvgRating(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length)
          setRatingCount(ratings.length)
        }
      })
  }, [user, vehicle.id])

  const toggleWishlist = async (e) => {
    e.stopPropagation()
    if (!user) return
    if (inWishlist) {
      const item = await db.wishlist.where({ userId: user.id, vehicleId: vehicle.id }).first()
      if (item) await db.wishlist.delete(item.id)
      setInWishlist(false)
    } else {
      await db.wishlist.add({ userId: user.id, vehicleId: vehicle.id, createdAt: Date.now() })
      setInWishlist(true)
    }
  }

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const gradient = TYPE_COLORS[vehicle.type] || TYPE_COLORS.car
  const icon = TYPE_ICONS[vehicle.type] || '🚗'

  const isOwner = user?.id === vehicle.ownerId

  return (
    <>
      <div className={`${cardBg} rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]`}>
        <div className={`h-32 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
          <span className="text-5xl opacity-80">{icon}</span>
          {user?.role === 'customer' && (
            <button onClick={toggleWishlist}
              className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-lg shadow">
              {inWishlist ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-lg ${textColor} truncate`}>{vehicle.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>{vehicle.type}</span>
              </div>
              <p className={`text-sm ${muted}`}>{vehicle.variant}</p>
              {vehicle.location && <p className={`text-xs ${muted} mt-0.5`}>📍 {vehicle.location}</p>}
              {ratingCount > 0 && (
                <p className={`text-xs ${muted} mt-0.5`}>
                  {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                  <span className="ml-1">({ratingCount})</span>
                </p>
              )}
            </div>
            <span className="font-bold text-primary text-lg whitespace-nowrap ml-2">Rs.{vehicle.rentPerDay}/d</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => !isOwner && setShowBooking(true)}
              disabled={vehicle.isBooked || isOwner}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                vehicle.isBooked
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isOwner
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-variant'
              }`}
            >
              {isOwner ? 'Your Listing' : vehicle.isBooked ? 'Booked' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingForm
          vehicle={vehicle}
          onClose={() => setShowBooking(false)}
          onConfirm={onBooked}
          theme={theme}
        />
      )}
    </>
  )
}
