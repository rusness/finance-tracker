import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Загрузка данных дашборда...');

      // Загружаем статистику только для менеджеров и админов
      let statsData = null;
      if (user.role !== 'employee') {
        try {
          const statsResponse = await expensesAPI.getStats();
          statsData = statsResponse.data;
          console.log('✅ Статистика загружена:', statsData);
        } catch (statsError) {
          console.warn('⚠️ Не удалось загрузить статистику:', statsError.message);
        }
      }

      // Загружаем последние заявки пользователя
      const expensesResponse = await expensesAPI.getMyExpenses();
      const expenses = expensesResponse.data;
      console.log('✅ Заявки загружены:', expenses.length, 'шт.');

      setStats(statsData);
      setRecentExpenses(expenses.slice(0, 5));

    } catch (error) {
      console.error('❌ Ошибка загрузки дашборда:', error);
      setError(`Ошибка загрузки: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: '⏳ На рассмотрении' },
      approved: { class: 'status-approved', text: '✅ Утверждена' },
      rejected: { class: 'status-rejected', text: '❌ Отклонена' },
      paid: { class: 'status-paid', text: '💰 Оплачена' }
    };

    const config = statusConfig[status] || { class: 'status-pending', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>❌ Ошибка</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={loadDashboardData}>
          🔄 Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Добро пожаловать, {user.full_name}! 👋</h1>
        <p>Панель управления системой учета заявок</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total_expenses}</div>
              <div className="stat-label">Всего заявок</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total_amount?.toLocaleString() || 0} ₽</div>
              <div className="stat-label">Общая сумма</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.status_counts?.pending || 0}</div>
              <div className="stat-label">На рассмотрении</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.status_counts?.approved || 0}</div>
              <div className="stat-label">Утверждено</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="recent-expenses">
          <h2>📋 Последние заявки</h2>
          {recentExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>У вас пока нет созданных заявок</p>
              <p className="empty-subtext">Создайте первую заявку на расход</p>
            </div>
          ) : (
            <div className="expenses-list">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-main">
                    <h3>{expense.title}</h3>
                    {expense.description && (
                      <p className="expense-description">{expense.description}</p>
                    )}
                    <div className="expense-meta">
                      <span className="amount">{expense.amount.toLocaleString()} {expense.currency}</span>
                      <span className="category">• {expense.category}</span>
                      <span className="date">• {new Date(expense.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="expense-status">
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {stats && (
          <div className="quick-stats">
            <h2>📈 Быстрая статистика</h2>
            <div className="stats-cards">
              <div className="stat-mini">
                <div className="stat-mini-value">{stats.status_counts?.pending || 0}</div>
                <div className="stat-mini-label">Ожидают</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-value">{stats.status_counts?.approved || 0}</div>
                <div className="stat-mini-label">Утверждены</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-value">{stats.status_counts?.rejected || 0}</div>
                <div className="stat-mini-label">Отклонены</div>
              </div>
            </div>

            {stats.categories && stats.categories.length > 0 && (
              <div className="categories-stats">
                <h3>📂 По категориям</h3>
                {stats.categories.map(cat => (
                  <div key={cat.name} className="category-item">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;