import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import db from '../db/database'
import { useAuth } from '../context/AuthContext'

export default function EditVehicle({ theme }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const inputStyle = `w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  }`

  useEffect(() => {
    (async () => {
      const v = await db.vehicles.get(Number(id))
      if (!v || v.ownerId !== user.id) { navigate('/my-vehicles'); return }
      setForm({ type: v.type, name: v.name, variant: v.variant, rentPerDay: v.rentPerDay, description: v.description, location: v.location, imagePath: v.imagePath })
      setLoading(false)
    })()
  }, [id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.variant || !form.rentPerDay) return
    setSaving(true)
    await db.vehicles.update(Number(id), {
      type: form.type,
      name: form.name.trim(),
      variant: form.variant.trim(),
      rentPerDay: Number(form.rentPerDay),
      description: form.description.trim(),
      location: form.location.trim(),
      imagePath: form.imagePath.trim()
    })
    setSaving(false)
    navigate('/my-vehicles')
  }

  if (loading || !form) {
    return <div className={`${bg} min-h-screen flex items-center justify-center ${textColor}`}>Loading...</div>
  }

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>Edit Vehicle</h1>
        <form onSubmit={handleSave} className={`${cardBg} rounded-xl p-6 shadow-md space-y-4`}>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Type</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputStyle}>
              <option value="car">🚙 Car</option>
              <option value="bike">🏍️ Bike</option>
              <option value="bus">🚌 Bus</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputStyle} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Variant *</label>
            <input name="variant" value={form.variant} onChange={handleChange} required className={inputStyle} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Rent Per Day (Rs.) *</label>
            <input name="rentPerDay" type="number" min="1" value={form.rentPerDay} onChange={handleChange} required className={inputStyle} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} className={inputStyle} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className={inputStyle} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/my-vehicles')}
              className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
