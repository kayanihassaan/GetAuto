import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import db from '../db/database'

export default function AddCar({ theme }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', variant: '', rentPerDay: '', description: '', imagePath: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const inputStyle = `w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  }`

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.variant || !form.rentPerDay) return

    setSubmitting(true)
    await db.cars.add({
      name: form.name.trim(),
      variant: form.variant.trim(),
      rentPerDay: Number(form.rentPerDay),
      description: form.description.trim(),
      imagePath: form.imagePath.trim(),
      isBooked: false
    })
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => { navigate('/') }, 1500)
  }

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>Add a Car</h1>

        {success ? (
          <div className={`${cardBg} rounded-xl p-8 text-center shadow-md`}>
            <p className="text-4xl mb-3">✅</p>
            <p className={`text-lg font-semibold ${textColor}`}>Car added successfully!</p>
            <p className={muted}>Redirecting to home...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`${cardBg} rounded-xl p-6 shadow-md space-y-4`}>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Car Name *</label>
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
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Description</label>
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Image URL (optional)</label>
              <input name="imagePath" value={form.imagePath} onChange={handleChange} className={inputStyle} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Car'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
