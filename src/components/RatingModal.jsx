import { useState } from 'react'
import db from '../db/database'

export default function RatingModal({ vehicle, userId, onClose, theme }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const overlay = theme === 'dark' ? 'bg-black/60' : 'bg-black/40'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return
    setSubmitting(true)
    await db.ratings.add({
      vehicleId: vehicle.id,
      userId,
      rating,
      review: review.trim(),
      createdAt: Date.now()
    })
    setSubmitting(false)
    setDone(true)
    setTimeout(onClose, 1500)
  }

  if (done) {
    return (
      <div className={`fixed inset-0 ${overlay} flex items-center justify-center z-50 p-4`}>
        <div className={`${cardBg} rounded-2xl shadow-xl w-full max-w-sm p-8 text-center`}>
          <p className="text-4xl mb-3">⭐</p>
          <p className={`text-lg font-semibold ${textColor}`}>Thank you for your review!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 ${overlay} flex items-center justify-center z-50 p-4`} onClick={onClose}>
      <div className={`${cardBg} rounded-2xl shadow-xl w-full max-w-sm p-6`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${textColor}`}>Rate {vehicle.name}</h2>
          <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 ${textColor}`}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className={`text-3xl transition-colors ${
                    (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                  ★
                </button>
              ))}
            </div>
            <p className={`text-sm ${muted}`}>
              {rating === 0 ? 'Select rating' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          </div>

          <textarea placeholder="Write a review (optional)"
            value={review} onChange={e => setReview(e.target.value)}
            rows="3"
            className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`} />

          <button type="submit" disabled={submitting || rating === 0}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
