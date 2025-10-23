import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Функция для получения токена
const getToken = () => {
  return localStorage.getItem('token');
};



// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const usersAPI = {
  getMe: () =>
    api.get('/users/me'),
  getUsers: () =>
    api.get('/users'),
  getUser: (userId) =>
    api.get(`/users/${userId}`),
  updateUser: (userId, userData) =>
    api.put(`/users/${userId}`, userData),
  updateUserPassword: (userId, newPassword) =>
    api.put(`/users/${userId}/password`, { new_password: newPassword }),
  deactivateUser: (userId) =>
    api.delete(`/users/${userId}`),
};

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  register: (userData) =>
    api.post('/auth/register', userData),
};

export const expensesAPI = {
  create: (expenseData) =>
    api.post('/expenses', expenseData),
  getMyExpenses: () =>
    api.get('/expenses'),
  getAllExpenses: () =>
    api.get('/expenses/all'),
  updateStatus: (expenseId, status) =>
    api.put(`/expenses/${expenseId}`, { status }),
  getStats: () =>
    api.get('/expenses/stats'),
};

// Функция для проверки аутентификации
export const checkAuth = () => {
  return !!getToken();
};

export default api;