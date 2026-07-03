import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/database'
import VehicleCard from '../components/VehicleCard'

const VEHICLE_TYPES = [
  { key: '', label: 'All', icon: '🚗' },
  { key: 'car', label: 'Cars', icon: '🚙' },
  { key: 'bike', label: 'Bikes', icon: '🏍️' },
  { key: 'bus', label: 'Buses', icon: '🚌' },
]

export default function Home({ theme }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [refresh, setRefresh] = useState(0)

  const vehicles = useLiveQuery(
    () => db.vehicles
      .filter(v =>
        (!typeFilter || v.type === typeFilter) &&
        (!search || v.name.toLowerCase().includes(search.toLowerCase()) ||
         v.variant.toLowerCase().includes(search.toLowerCase()) ||
         v.location?.toLowerCase().includes(search.toLowerCase()))
      )
      .reverse()
      .toArray(),
    [search, typeFilter, refresh]
  )

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const inputBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-1`}>Available Vehicles</h1>
        <p className={`${muted} mb-4`}>Find and book your ride</p>

        <input
          type="text"
          placeholder="Search by name, variant, or location"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4`}
        />

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {VEHICLE_TYPES.map(t => (
            <button key={t.key} onClick={() => setTypeFilter(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                typeFilter === t.key
                  ? 'bg-primary text-white'
                  : `${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {!vehicles ? (
          <p className={`text-center ${muted}`}>Loading...</p>
        ) : vehicles.length === 0 ? (
          <div className={`text-center py-12 ${muted}`}>
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">{search || typeFilter ? 'No vehicles match your filters' : 'No vehicles available yet'}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} onBooked={() => setRefresh(r => r + 1)} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
