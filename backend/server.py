#!/usr/bin/env python3
"""
Сервер для структуры: backend/server.py и frontend/index.html
"""

import http.server
import socketserver
import os

PORT = 8000
# Путь к папке с фронтендом относительно расположения server.py
FRONTEND_PATH = "../frontend"  # или "frontend" если в одной папке

def main():
    
    if not os.path.exists(os.path.join(FRONTEND_PATH, "index.html")):
        print("❌ index.html не найден во фронтенде!")
        print(f"Проверьте: {FRONTEND_PATH}/index.html")
        return
    
    # Меняем рабочую директорию на фронтенд
    os.chdir(FRONTEND_PATH)
    
    print("=" * 50)
    print(f"📂 Фронтенд папка: {os.path.abspath('.')}")
    print(f"🌐 Сервер запущен: http://localhost:{PORT}")
    print("=" * 50)
    print("📂 Содержимое фронтенд папки:")
    for item in os.listdir("."):
        print(f"  • {item}")
    print("=" * 50)
    
    # Запускаем сервер
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"✅ Сервер работает! Открывайте http://localhost:{PORT}")
        print("⏹️  Нажмите Ctrl+C для остановки\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Сервер остановлен")

if __name__ == "__main__":
    main()