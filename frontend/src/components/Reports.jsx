import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';

const Reports = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      const response = await expensesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка отчетов...</p>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="page-header">
        <h1>📈 Отчеты и аналитика</h1>
        <p>Статистика и аналитика по заявкам на расход</p>
      </div>

      <div className="reports-controls">
        <div className="period-selector">
          <label>Период:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </select>
        </div>

        <button className="btn-primary" onClick={loadStats}>
          🔄 Обновить
        </button>
      </div>

      {stats && (
        <>
          <div className="stats-overview">
            <div className="stat-card large">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{stats.total_expenses}</div>
                <div className="stat-label">Всего заявок</div>
              </div>
            </div>

            <div className="stat-card large">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">{stats.total_amount.toLocaleString()} ₽</div>
                <div className="stat-label">Общая сумма</div>
              </div>
            </div>
          </div>

          <div className="reports-grid">
            <div className="report-card">
              <h3>📋 Статус заявок</h3>
              <div className="status-chart">
                {Object.entries(stats.status_counts).map(([status, count]) => (
                  <div key={status} className="status-item">
                    <span className="status-label">
                      {getStatusText(status)}:
                    </span>
                    <span className="status-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-card">
              <h3>📂 Распределение по категориям</h3>
              <div className="categories-chart">
                {stats.categories.map(category => (
                  <div key={category.name} className="category-item">
                    <span className="category-name">{category.name}</span>
                    <div className="category-bar">
                      <div
                        className="category-fill"
                        style={{
                          width: `${(category.count / stats.total_expenses) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="category-count">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="actions-panel">
            <button className="btn-primary">
              📄 Экспорт в Excel
            </button>
            <button className="btn-secondary">
              🖨️ Печать отчета
            </button>
            <button className="btn-secondary">
              📧 Отправить по email
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const getStatusText = (status) => {
  const statusMap = {
    pending: '⏳ На рассмотрении',
    approved: '✅ Утверждены',
    rejected: '❌ Отклонены',
    paid: '💰 Оплачены'
  };
  return statusMap[status] || status;
};

export default Reports;