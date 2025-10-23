#!/bin/bash

echo "🔄 Перезапуск системы..."

# Останавливаем все процессы на нужных портах
echo "⏹️  Останавливаем процессы..."
echo "Останавливаем процессы на порту 8000..."
sudo lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "Останавливаем процессы на порту 3000..."
sudo lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Останавливаем процессы на порту 3001..."
sudo lsof -ti:3001 | xargs kill -9 2>/dev/null || true

sleep 3

# ЗАПРЕЩАЕМ очистку базы данных - данные должны сохраняться!
echo "💾 Сохраняем базу данных - данные пользователей и заявок защищены!"

# Запускаем backend
echo "🔧 Запускаем backend..."
cd backend

# Проверяем свободен ли порт 8000
if netstat -tulpn 2>/dev/null | grep :8000 > /dev/null; then
    echo "⚠️  Порт 8000 занят, используем порт 8001"
    python start.py --port 8001 &
else
    python start.py &
fi

BACKEND_PID=$!
cd ..

sleep 5

# Запускаем frontend
echo "🎨 Запускаем frontend..."
cd frontend

# Проверяем свободен ли порт 3000
if netstat -tulpn 2>/dev/null | grep :3000 > /dev/null; then
    echo "⚠️  Порт 3000 занят, используем порт 3001"
    npm run dev -- --port 3001 &
else
    npm run dev &
fi

FRONTEND_PID=$!
cd ..

# Функция для определения портов
get_backend_port() {
    if netstat -tulpn 2>/dev/null | grep :8000 > /dev/null; then
        echo "8001"
    else
        echo "8000"
    fi
}

get_frontend_port() {
    if netstat -tulpn 2>/dev/null | grep :3000 > /dev/null; then
        echo "3001"
    else
        echo "3000"
    fi
}

echo ""
echo "✅ Система перезапущена!"
echo ""
echo "📊 Frontend: http://localhost:$(get_frontend_port)"
echo "🔧 Backend:  http://localhost:$(get_backend_port)"
echo "📚 API Docs: http://localhost:$(get_backend_port)/docs"
echo ""
echo "💡 Все данные сохранены: пользователи, заявки, история"
echo "⏹️  Для остановки нажмите Ctrl+C"

# Обработка прерывания
trap "echo ''; echo '🛑 Остановка...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Ждем
wait