import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Inventory from './pages/inventory'
import CreateProduct from './pages/createProduct'
import Checkout from './pages/checkout'
import './App.css'

function App() {
  // Check if user is logged in by looking for the token in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/inventory" 
          element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} 
        />
        <Route path="/create-product" element={isAuthenticated ? <CreateProduct /> : <Navigate to="/login" />} />
        <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" />} />
        
        {/* Redirect home to inventory if authenticated, otherwise to login */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/inventory" /> : <Navigate to="/login" />} 
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App