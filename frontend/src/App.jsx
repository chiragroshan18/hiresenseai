import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { authService } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
