import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import db from '../db/database'
import { useAuth } from '../context/AuthContext'

const TYPE_ICONS = { car: '🚙', bike: '🏍️', bus: '🚌' }

export default function Wishlist({ theme }) {
  const { user } = useAuth()

  const wishlistItems = useLiveQuery(
    () => db.wishlist.where('userId').equals(user.id).reverse().toArray(),
    [user.id]
  )

  const vehicleIds = [...new Set(wishlistItems?.map(w => w.vehicleId) || [])]

  const vehicles = useLiveQuery(
    () => vehicleIds.length ? db.vehicles.where('id').anyOf(vehicleIds).toArray() : [],
    [vehicleIds.join(',')]
  )

  const vehicleMap = {}
  vehicles?.forEach(v => { vehicleMap[v.id] = v })

  const removeWishlist = async (vehicleId) => {
    const item = wishlistItems?.find(w => w.vehicleId === vehicleId)
    if (item) await db.wishlist.delete(item.id)
  }

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>❤️ Wishlist</h1>

        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className={`text-center py-12 ${muted}`}>
            <p className="text-5xl mb-4">❤️</p>
            <p className="text-lg mb-4">Your wishlist is empty</p>
            <Link to="/" className="text-primary font-medium hover:underline">Browse vehicles</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistItems.map(w => {
              const v = vehicleMap[w.vehicleId]
              if (!v) return null
              return (
                <div key={w.id} className={`${cardBg} rounded-xl p-4 shadow-md`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{TYPE_ICONS[v.type] || '🚗'}</span>
                      <div>
                        <h3 className={`font-semibold ${textColor}`}>{v.name}</h3>
                        <p className={`text-sm ${muted}`}>{v.variant} · Rs. {v.rentPerDay}/day{v.location ? ` · 📍 ${v.location}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to="/"
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-variant">
                        Book
                      </Link>
                      <button onClick={() => removeWishlist(v.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200">
                        Remove
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
