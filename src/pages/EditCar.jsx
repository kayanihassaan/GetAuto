import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/database'

export default function EditCar({ theme }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const cars = useLiveQuery(() => db.cars.toArray())

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const inputStyle = `w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  }`

  const startEdit = (car) => {
    setEditingId(car.id)
    setEditForm({ name: car.name, variant: car.variant, rentPerDay: car.rentPerDay, description: car.description })
  }

  const handleSave = async (id) => {
    await db.cars.update(id, {
      name: editForm.name.trim(),
      variant: editForm.variant.trim(),
      rentPerDay: Number(editForm.rentPerDay),
      description: editForm.description.trim()
    })
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this car permanently?')) {
      await db.cars.delete(id)
      await db.bookings.where('carId').equals(id).delete()
    }
  }

  const toggleBooked = async (car) => {
    await db.cars.update(car.id, { isBooked: !car.isBooked })
  }

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>Edit Cars</h1>

        {!cars || cars.length === 0 ? (
          <div className={`text-center py-12 ${muted}`}>
            <p className="text-5xl mb-4">🚗</p>
            <p>No cars to edit</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cars.map(car => (
              <div key={car.id} className={`${cardBg} rounded-xl p-4 shadow-md`}>
                {editingId === car.id ? (
                  <div className="space-y-3">
                    <input name="name" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputStyle} placeholder="Name" />
                    <input name="variant" value={editForm.variant} onChange={e => setEditForm(p => ({ ...p, variant: e.target.value }))} className={inputStyle} placeholder="Variant" />
                    <input name="rentPerDay" type="number" value={editForm.rentPerDay} onChange={e => setEditForm(p => ({ ...p, rentPerDay: e.target.value }))} className={inputStyle} placeholder="Rent per day" />
                    <textarea name="description" rows="2" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className={inputStyle} placeholder="Description" />
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(car.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium hover:bg-gray-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${textColor}`}>{car.name}</h3>
                        <span className={`text-sm ${muted}`}>- {car.variant}</span>
                        <span className={`text-sm font-medium text-primary`}>Rs. {car.rentPerDay}/day</span>
                        {car.isBooked && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Booked</span>}
                      </div>
                      {car.description && <p className={`text-sm ${muted} mt-1`}>{car.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => startEdit(car)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-variant">Edit</button>
                      <button onClick={() => toggleBooked(car)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${car.isBooked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                        {car.isBooked ? 'Mark Free' : 'Mark Booked'}
                      </button>
                      <button onClick={() => handleDelete(car.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
