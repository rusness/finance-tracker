#!/bin/bash

echo "🔍 Диагностика системы Finance Tracker"

echo ""
echo "1. Проверка процессов:"
echo "======================"
echo "Backend процессы:"
ps aux | grep -E "(uvicorn|python start.py)" | grep -v grep || echo "Нет backend процессов"
echo ""
echo "Frontend процессы:"
ps aux | grep -E "(vite|node)" | grep -v grep || echo "Нет frontend процессов"

echo ""
echo "2. Проверка портов:"
echo "==================="
echo "Порт 8000:"
netstat -tulpn | grep :8000 || echo "Порт 8000 свободен"
echo ""
echo "Порт 3000:"
netstat -tulpn | grep :3000 || echo "Порт 3000 свободен"
echo ""
echo "Порт 3001:"
netstat -tulpn | grep :3001 || echo "Порт 3001 свободен"

echo ""
echo "3. Проверка базы данных:"
echo "========================"
if [ -f "backend/finance_tracker.db" ]; then
    echo "✅ База данных существует"
    echo "Размер базы: $(du -h backend/finance_tracker.db | cut -f1)"
else
    echo "❌ База данных не найдена"
fi

echo ""
echo "4. Проверка логов (последние 10 строк backend):"
echo "=============================================="
if [ -f "backend/log.txt" ]; then
    tail -10 backend/log.txt
else
    echo "Файл логов не найден"
fi

echo ""
echo "💡 Рекомендации:"
echo "1. Откройте Developer Tools (F12) в браузере"
echo "2. Проверьте вкладку Console на ошибки"
echo "3. Проверьте вкладку Network - смотрите запросы к /api/v1/expenses"
echo "4. Проверьте вкладку Application -> Local Storage - должен быть токен"