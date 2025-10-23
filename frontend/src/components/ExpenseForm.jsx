import React, { useState } from 'react';
import { expensesAPI } from '../services/api';

const ExpenseForm = ({ onExpenseCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    currency: 'RUB'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Командировочные расходы',
    'Офисные принадлежности',
    'ИТ оборудование',
    'Обучение и развитие',
    'Представительские расходы',
    'Транспортные расходы',
    'Прочие расходы'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('📤 Отправка данных заявки:', formData);

      // Проверяем токен
      const token = localStorage.getItem('token');
      console.log('🔐 Токен:', token ? 'есть' : 'отсутствует');

      const response = await expensesAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      console.log('✅ Ответ от сервера:', response);

      setMessage('✅ Заявка успешно создана!');
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: '',
        currency: 'RUB'
      });

      if (onExpenseCreated) {
        onExpenseCreated();
      }
    } catch (error) {
      console.error('❌ Ошибка при создании заявки:', error);
      console.error('Детали ошибки:', error.response?.data);
      setMessage(`❌ Ошибка при создании заявки: ${error.response?.data?.detail || error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="expense-form-container">
      <div className="form-header">
        <h1>📝 Новая заявка на расход</h1>
        <p>Заполните форму для создания новой заявки на расход денежных средств</p>
      </div>

      <div className="form-card">
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">📌 Наименование расхода *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Например: Покупка монитора для отдела разработки"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">📄 Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Подробное описание необходимости расхода, обоснование..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">💰 Сумма *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">🌍 Валюта</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="RUB">RUB - Российский рубль</option>
                <option value="USD">USD - Доллар США</option>
                <option value="EUR">EUR - Евро</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">📂 Категория *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Создание...
                </>
              ) : (
                '✅ Создать заявку'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Добавляем отладочную информацию */}
      <div className="debug-info">
        <h3>🔍 Отладочная информация:</h3>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            console.log('Текущие данные формы:', formData);
            console.log('Токен из localStorage:', localStorage.getItem('token'));
            console.log('Пользователь из localStorage:', localStorage.getItem('user'));
          }}
        >
          Показать отладочную информацию в консоли
        </button>
      </div>
    </div>
  );
};

export default ExpenseForm;