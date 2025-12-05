# backend/app.py
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Создаём экземпляры
app = Flask(__name__)
CORS(app)

# Конфигурация
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///trashsort.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Модель прямо здесь
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    container_number = db.Column(db.Integer)
    description = db.Column(db.Text)
    examples = db.Column(db.Text)

# Маршруты прямо здесь
@app.route('/')
def index():
    return jsonify({
        "message": "TrashSort Backend is running!",
        "endpoints": ["/api/categories", "/api/health"]
    })

@app.route('/api/categories')
def get_categories():
    categories = Category.query.all()
    return jsonify([{
        'id': cat.id,
        'name': cat.name,
        'container_number': cat.container_number,
        'description': cat.description
    } for cat in categories])

@app.route('/api/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Добавляем тестовые данные если таблица пуста
        if Category.query.count() == 0:
            categories = [
                Category(name="ПЭТ-бутылки", container_number=1, 
                        description="Прозрачные пищевые бутылки"),
                Category(name="Пластик HDPE", container_number=2,
                        description="Бутылки от молока, бытовой химии"),
                Category(name="Пластик PP", container_number=3,
                        description="Жесткие контейнеры и крышки"),
                Category(name="Пенопласт", container_number=4,
                        description="Упаковочный пенопласт"),
                Category(name="Картон/Бумага", container_number=5,
                        description="Бумага и картон"),
                Category(name="Стекло", container_number=6,
                        description="Стеклянная тара")
            ]
            db.session.bulk_save_objects(categories)
            db.session.commit()
            print("✅ Добавлены тестовые категории")
    
    print("🚀 Сервер запущен: http://localhost:5000")
    app.run(debug=True, port=5000)