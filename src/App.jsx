import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import useAuth from './utils/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/inventory" element={
        <PrivateRoute>
          <Inventory />
        </PrivateRoute>
      } />
      <Route path="/sales" element={
        <PrivateRoute>
          <Sales />
        </PrivateRoute>
      } />
      <Route path="/sales-history" element={
        <PrivateRoute>
          <SalesHistory />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
