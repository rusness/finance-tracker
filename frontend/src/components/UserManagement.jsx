import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import UserEditModal from './UserEditModal';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите деактивировать этого пользователя?')) {
      return;
    }

    try {
      await usersAPI.deactivateUser(userId);
      setMessage('✅ Пользователь деактивирован');
      loadUsers(); // Перезагружаем список
    } catch (error) {
      setMessage(`❌ Ошибка: ${error.response?.data?.detail || error.message}`);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      employee: { text: '👨‍💼 Сотрудник', color: '#3b82f6' },
      manager: { text: '👨‍💼 Менеджер', color: '#10b981' },
      admin: { text: '👨‍💻 Администратор', color: '#ef4444' }
    };

    const config = roleConfig[role] || { text: role, color: '#6b7280' };
    return (
      <span
        className="role-badge"
        style={{ backgroundColor: config.color + '20', color: config.color }}
      >
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>👥 Управление пользователями</h1>
        <p>Просмотр и управление пользователями системы</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="users-grid">
        {users.map(userItem => (
          <div key={userItem.id} className="user-card">
            <div className="user-avatar">
              {userItem.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>

            <div className="user-info">
              <h3>{userItem.full_name}</h3>
              <p className="user-username">@{userItem.username}</p>
              <p className="user-email">{userItem.email}</p>
              {userItem.department && (
                <p className="user-department">🏢 {userItem.department}</p>
              )}
            </div>

            <div className="user-role">
              {getRoleBadge(userItem.role)}
            </div>

            <div className="user-actions">
              <button
                className="btn-primary small"
                onClick={() => handleEditUser(userItem)}
              >
                ✏️ Редактировать
              </button>
              {userItem.id !== user.id && ( // Нельзя деактивировать себя
                <button
                  className="btn-danger small"
                  onClick={() => handleDeactivateUser(userItem.id)}
                >
                  🗑️ Деактивировать
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="users-stats">
        <div className="stat-item">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Всего пользователей</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {users.filter(u => u.role === 'employee').length}
          </div>
          <div className="stat-label">Сотрудников</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {users.filter(u => u.role === 'manager').length}
          </div>
          <div className="stat-label">Менеджеров</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="stat-label">Администраторов</div>
        </div>
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;