import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleExpenseCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('my-expenses');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'create-expense':
        return <ExpenseForm onExpenseCreated={handleExpenseCreated} />;
      case 'my-expenses':
        return <ExpenseList user={user} showAll={false} onUpdate={() => setRefreshTrigger(prev => prev + 1)} />;
      case 'all-expenses':
        return <ExpenseList user={user} showAll={true} onUpdate={() => setRefreshTrigger(prev => prev + 1)} />;
      case 'users':
        return <UserManagement user={user} />;
      case 'reports':
        return <Reports user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>💰 Finance Tracker</h1>
            <span className="company-name">ООО «Си Эл Инжиниринг и Ко»</span>
          </div>

          <div className="nav-links">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              📊 Дашборд
            </button>
            <button
              onClick={() => setCurrentView('create-expense')}
              className={`nav-link ${currentView === 'create-expense' ? 'active' : ''}`}
            >
              ➕ Новая заявка
            </button>
            <button
              onClick={() => setCurrentView('my-expenses')}
              className={`nav-link ${currentView === 'my-expenses' ? 'active' : ''}`}
            >
              📋 Мои заявки
            </button>

            {user.role !== 'employee' && (
              <>
                <button
                  onClick={() => setCurrentView('all-expenses')}
                  className={`nav-link ${currentView === 'all-expenses' ? 'active' : ''}`}
                >
                  👁️ Все заявки
                </button>
                <button
                  onClick={() => setCurrentView('reports')}
                  className={`nav-link ${currentView === 'reports' ? 'active' : ''}`}
                >
                  📈 Отчеты
                </button>
              </>
            )}

            {user.role === 'admin' && (
              <button
                onClick={() => setCurrentView('users')}
                className={`nav-link ${currentView === 'users' ? 'active' : ''}`}
              >
                👥 Пользователи
              </button>
            )}
          </div>

          <div className="nav-user">
            <span className="user-info">
              👤 {user.full_name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              🚪 Выйти
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;