import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OpenAccount from './pages/OpenAccount'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import Transfer from './pages/Transfer'
import Cards from './pages/Cards'
import Loans from './pages/Loans'
import AdminPanel from './pages/AdminPanel'

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, loading } = useAuth()
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  const { token, loading } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={!loading && token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={!loading && token ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/open-account" element={<ProtectedRoute><OpenAccount /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
