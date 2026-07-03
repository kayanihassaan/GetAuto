import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile({ theme }) {
  const { user, completeRegistration, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const inputStyle = `w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  }`

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await completeRegistration(name.trim(), user.role)
    setSaving(false)
    setEditing(false)
  }

  const initials = (user?.name || '?').split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>Profile</h1>

        <div className={`${cardBg} rounded-xl p-6 shadow-md space-y-6`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              {editing ? (
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className={inputStyle} autoFocus />
              ) : (
                <h2 className={`text-lg font-bold ${textColor}`}>{user?.name}</h2>
              )}
              <p className={`text-sm ${muted}`}>{user?.email}</p>
              <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded-full capitalize ${
                user?.role === 'vendor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>{user?.role}</span>
            </div>
          </div>

          {editing ? (
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-variant disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setName(user?.name || '') }}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium hover:bg-gray-500">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="w-full py-2 border border-primary text-primary rounded-lg font-medium text-sm hover:bg-primary/5">
              Edit Name
            </button>
          )}

          <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

          <div>
            <h3 className={`font-semibold ${textColor} mb-2`}>Account</h3>
            <p className={`text-sm ${muted}`}>Email: {user?.email}</p>
            <p className={`text-sm ${muted}`}>Role: {user?.role}</p>
            <p className={`text-sm ${muted}`}>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</p>
          </div>

          <button onClick={logout}
            className="w-full py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
