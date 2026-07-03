import { useState } from 'react'
import db from '../db/database'
import { useAuth } from '../context/AuthContext'

export default function BookingForm({ vehicle, onClose, onConfirm, theme }) {
  const { user } = useAuth()
  const [days, setDays] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [submitting, setSubmitting] = useState(false)

  const totalPrice = days * vehicle.rentPerDay
  const overlay = theme === 'dark' ? 'bg-black/60' : 'bg-black/40'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const startDate = Date.now()
    const endDate = startDate + days * 86400000

    await db.bookings.add({
      vehicleId: vehicle.id,
      userId: user.id,
      customerName: user.name,
      contactNumber: user.email,
      startDate,
      endDate,
      totalPrice,
      paymentMethod,
      status: 'confirmed'
    })

    await db.vehicles.update(vehicle.id, { isBooked: true })
    setSubmitting(false)
    onConfirm?.(vehicle.id)
    onClose()
  }

  return (
    <div className={`fixed inset-0 ${overlay} flex items-center justify-center z-50 p-4`} onClick={onClose}>
      <div className={`${cardBg} rounded-2xl shadow-xl w-full max-w-md p-6`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${textColor}`}>Book {vehicle.name}</h2>
          <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 ${textColor}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`text-sm ${muted} mb-4`}>
          {vehicle.name} · {vehicle.variant} · Rs. {vehicle.rentPerDay}/day
          {vehicle.location && <span> · 📍 {vehicle.location}</span>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Number of Days</label>
            <input type="number" min="1" max="30" value={days}
              onChange={e => setDays(Math.max(1, Number(e.target.value)))}
              className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}>
              <option>Cash</option>
              <option>Credit Card</option>
              <option>JazzCash</option>
              <option>EasyPaisa</option>
            </select>
          </div>
          <div className={`text-right text-lg font-bold ${textColor}`}>
            Total: Rs. {totalPrice.toLocaleString()}
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}
