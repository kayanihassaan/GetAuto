import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login({ theme }) {
  const { sendOTP, verifyOTP, completeRegistration, user } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [sentCode, setSentCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    setError('')
    setSending(true)
    try {
      const code = await sendOTP(email)
      setSentCode(code)
      setSending(false)
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Failed to send code')
      setSending(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.length !== 6) { setError('Enter the 6-digit code'); return }
    setError('')
    setVerifying(true)
    const result = await verifyOTP(email, code)
    setVerifying(false)
    if (!result) { setError('Invalid or expired code'); return }
    if (!result.name || !result.role) {
      setStep('register')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name.trim() || !role) return
    await completeRegistration(name.trim(), role)
  }

  if (step === 'register') {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl shadow-xl w-full max-w-sm p-8`}>
          <h1 className={`text-2xl font-bold ${textColor} text-center mb-2`}>Welcome!</h1>
          <p className={`text-sm ${muted} text-center mb-6`}>Complete your profile</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`} />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {['vendor', 'customer'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium capitalize transition-all ${
                      role === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : `border-gray-200 ${textColor} hover:border-gray-300`
                    }`}>
                    {r === 'vendor' ? '🚗 Rent Out' : '🔍 Book'}
                    <span className={`block text-xs ${muted} mt-0.5`}>
                      {r === 'vendor' ? 'List my vehicles' : 'Find vehicles'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={!name.trim() || !role}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
              Get Started
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`${bg} min-h-screen flex items-center justify-center p-4`}>
      <div className={`${cardBg} rounded-2xl shadow-xl w-full max-w-sm p-8`}>
        <div className="text-center mb-8">
          <svg width="64" height="64" viewBox="0 0 512 512" className="mx-auto mb-4">
            <rect width="512" height="512" rx="80" fill="#FFD700"/>
            <rect x="64" y="192" width="384" height="192" rx="32" fill="#1a1a1a"/>
            <rect x="96" y="256" width="96" height="64" rx="8" fill="#FFD700"/>
            <rect x="224" y="256" width="96" height="64" rx="8" fill="#FFD700"/>
            <rect x="352" y="256" width="96" height="64" rx="8" fill="#FFD700"/>
            <circle cx="128" cy="352" r="40" fill="#1a1a1a" stroke="#FFD700" strokeWidth="4"/>
            <circle cx="384" cy="352" r="40" fill="#1a1a1a" stroke="#FFD700" strokeWidth="4"/>
          </svg>
          <h1 className={`text-2xl font-bold ${textColor}`}>GetAuto</h1>
          <p className={`text-sm ${muted} mt-1`}>Vehicle Rental Marketplace</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Email Address</label>
              <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value.trim())}
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary text-lg ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={sending || !email.includes('@')}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className={`text-sm ${textColor} text-center`}>
              Enter the 6-digit code sent to<br />
              <span className="font-semibold">{email}</span>
            </p>
            {sentCode && (
              <p className="text-center">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  Demo code: {sentCode}
                </span>
              </p>
            )}
            <input type="text" inputMode="numeric" placeholder="000000" maxLength={6} required value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-[0.5em] ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={verifying || code.length !== 6}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-variant transition-colors disabled:opacity-50">
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className={`w-full text-sm ${muted} hover:${textColor}`}>
              Change email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
