import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';

const ExpenseList = ({ user, showAll = false, onUpdate }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(''); // Добавляем состояние для ошибок

  useEffect(() => {
    loadExpenses();
  }, [showAll, filter]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading expenses...', { showAll, filter });

      const token = localStorage.getItem('token');
      console.log('Current token:', token ? 'есть' : 'отсутствует');

      const response = showAll
        ? await expensesAPI.getAllExpenses()
        : await expensesAPI.getMyExpenses();

      console.log('Expenses response:', response);

      let filteredExpenses = response.data;

      if (filter !== 'all') {
        filteredExpenses = response.data.filter(expense => expense.status === filter);
      }

      setExpenses(filteredExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setError(`Ошибка загрузки: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (expenseId, newStatus) => {
    try {
      await expensesAPI.updateStatus(expenseId, newStatus);
      loadExpenses();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(`Ошибка обновления: ${error.response?.data?.detail || error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: '⏳ На рассмотрении', color: '#f59e0b' },
      approved: { class: 'status-approved', text: '✅ Утверждена', color: '#10b981' },
      rejected: { class: 'status-rejected', text: '❌ Отклонена', color: '#ef4444' },
      paid: { class: 'status-paid', text: '💰 Оплачена', color: '#8b5cf6' }
    };

    const config = statusConfig[status] || { class: 'status-pending', text: status, color: '#6b7280' };
    return (
      <span
        className={`status-badge ${config.class}`}
        style={{ backgroundColor: config.color + '20', color: config.color, borderColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusActions = (expense) => {
    if (!showAll || user.role === 'employee' || expense.status !== 'pending') {
      return null;
    }

    return (
      <div className="expense-actions">
        <button
          className="btn-success small"
          onClick={() => handleStatusUpdate(expense.id, 'approved')}
        >
          ✅ Утвердить
        </button>
        <button
          className="btn-danger small"
          onClick={() => handleStatusUpdate(expense.id, 'rejected')}
        >
          ❌ Отклонить
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка заявок...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>❌ Ошибка</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={loadExpenses}>
          🔄 Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      <div className="list-header">
        <h1>{showAll ? '👁️ Все заявки' : '📋 Мои заявки'}</h1>
        <p>
          {showAll
            ? 'Просмотр и управление всеми заявками в системе'
            : 'История ваших заявок на расход денежных средств'
          }
        </p>
      </div>

      <div className="filters">
        <label>Фильтр по статусу:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Все</option>
          <option value="pending">⏳ На рассмотрении</option>
          <option value="approved">✅ Утверждены</option>
          <option value="rejected">❌ Отклонены</option>
          <option value="paid">💰 Оплачены</option>
        </select>

        <button
          className="btn-secondary"
          onClick={loadExpenses}
        >
          🔄 Обновить
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Заявки не найдены</h3>
          <p>
            {filter !== 'all'
              ? `Нет заявок со статусом "${filter}"`
              : showAll
                ? 'В системе пока нет заявок'
                : 'У вас нет созданных заявок'
            }
          </p>
        </div>
      ) : (
        <div className="expenses-grid">
          {expenses.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <h3 className="expense-title">{expense.title}</h3>
                {getStatusBadge(expense.status)}
              </div>

              {expense.description && (
                <p className="expense-description">{expense.description}</p>
              )}

              <div className="expense-details">
                <div className="detail-item">
                  <span className="detail-label">💰 Сумма:</span>
                  <span className="detail-value">
                    {expense.amount.toLocaleString()} {expense.currency}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">📂 Категория:</span>
                  <span className="detail-value">{expense.category}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">📅 Создана:</span>
                  <span className="detail-value">
                    {new Date(expense.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                {showAll && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">👤 Автор:</span>
                      <span className="detail-value">{expense.user_name}</span>
                    </div>

                    {expense.user_department && (
                      <div className="detail-item">
                        <span className="detail-label">🏢 Отдел:</span>
                        <span className="detail-value">{expense.user_department}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {getStatusActions(expense)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;