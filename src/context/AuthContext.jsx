import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import db from '../db/database'

const AuthContext = createContext(null)

const API = window.location.origin

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('kayani_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const sendOTP = useCallback(async (email) => {
    const res = await fetch(`${API}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()

    const code = data.code || ''

    const expiresAt = Date.now() + 5 * 60 * 1000
    await db.otps.add({ email, code, expiresAt })

    return code
  }, [API])

  const verifyOTP = useCallback(async (email, code) => {
    const otps = await db.otps
      .where('email').equals(email)
      .reverse()
      .toArray()

    const valid = otps.find(o => o.code === code && o.expiresAt > Date.now())
    if (!valid) return null

    await db.otps.where('email').equals(email).delete()

    let user = await db.users.where('email').equals(email).first()
    if (!user) {
      const id = await db.users.add({
        email, name: '', role: '', createdAt: Date.now()
      })
      user = await db.users.get(id)
    }

    localStorage.setItem('kayani_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const completeRegistration = useCallback(async (name, role) => {
    if (!user) return
    await db.users.update(user.id, { name, role })
    const updated = { ...user, name, role }
    localStorage.setItem('kayani_user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

  const logout = useCallback(() => {
    localStorage.removeItem('kayani_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, completeRegistration, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
