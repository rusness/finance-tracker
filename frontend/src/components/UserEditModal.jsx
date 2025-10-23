import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const UserEditModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' или 'password'

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role || 'employee',
        department: user.department || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await usersAPI.updateUser(user.id, formData);
      setMessage('✅ Данные пользователя обновлены!');
      if (onUpdate) {
        onUpdate();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(`❌ Ошибка: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newPassword = form.new_password.value;
    const confirmPassword = form.confirm_password.value;

    if (newPassword !== confirmPassword) {
      setMessage('❌ Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await usersAPI.updateUserPassword(user.id, newPassword);
      setMessage('✅ Пароль успешно изменен!');
      form.reset();
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(`❌ Ошибка: ${error.response?.data?.detail || error.message}`);
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

  if (!user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>✏️ Редактирование пользователя</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Профиль
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔑 Пароль
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>👤 Имя пользователя</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>📧 Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>👨‍💼 ФИО *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>🎭 Роль *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="employee">👨‍💼 Сотрудник</option>
                <option value="manager">👨‍💼 Менеджер</option>
                <option value="admin">👨‍💻 Администратор</option>
              </select>
            </div>

            <div className="form-group">
              <label>🏢 Отдел</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Например: IT, Финансы, Разработка"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? '💾 Сохранение...' : '💾 Сохранить изменения'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                ❌ Отмена
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>🔑 Новый пароль *</label>
              <input
                type="password"
                name="new_password"
                placeholder="Введите новый пароль"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>🔑 Подтверждение пароля *</label>
              <input
                type="password"
                name="confirm_password"
                placeholder="Повторите новый пароль"
                required
                minLength="6"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? '🔐 Изменение...' : '🔐 Изменить пароль'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab('profile')}
              >
                ↩️ Назад к профилю
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserEditModal;