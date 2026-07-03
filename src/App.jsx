import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import AddVehicle from './pages/AddVehicle'
import EditVehicle from './pages/EditVehicle'
import MyVehicles from './pages/MyVehicles'
import MyBookings from './pages/MyBookings'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'
import Owners from './pages/Owners'
import Settings from './pages/Settings'

function AppContent() {
  const { user, loading } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  if (loading) return null

  if (!user) {
    return <Login theme={theme} />
  }

  if (!user.name || !user.role) {
    return <Login theme={theme} />
  }

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'

  return (
    <div className={`min-h-screen ${bg} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <Navbar theme={theme} />
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/add-vehicle" element={user.role === 'vendor' ? <AddVehicle theme={theme} /> : <Navigate to="/" />} />
          <Route path="/edit-vehicle/:id" element={user.role === 'vendor' ? <EditVehicle theme={theme} /> : <Navigate to="/" />} />
          <Route path="/my-vehicles" element={user.role === 'vendor' ? <MyVehicles theme={theme} /> : <Navigate to="/" />} />
          <Route path="/my-bookings" element={<MyBookings theme={theme} />} />
          <Route path="/wishlist" element={user.role === 'customer' ? <Wishlist theme={theme} /> : <Navigate to="/" />} />
          <Route path="/profile" element={<Profile theme={theme} />} />
          <Route path="/owners" element={<Owners theme={theme} />} />
          <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
