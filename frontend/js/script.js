// Конфигурация
const API_BASE_URL = 'http://localhost:5000/api';

// Глобальные переменные состояния
let currentUser = null;
let selectedMaterial = null;
let materials = [];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Определяем текущую страницу
    const path = window.location.pathname.split('/').pop();
    
    // Инициализируем соответствующие обработчики
    switch(path) {
        case 'user_selection.html':
            initUserSelection();
            break;
        case 'material_selection.html':
            initMaterialSelection();
            break;
        case 'instructions.html':
            initInstructionsPage();
            break;
        case 'statistics.html':
            initStatisticsPage();
            break;
        default:
            // Если на главной, перенаправляем на выбор пользователя
            if(path === '' || path === 'index.html') {
                window.location.href = 'user_selection.html';
            }
    }
    
    // Инициализация базы данных (вызывается один раз при первом запуске)
    // fetch(`${API_BASE_URL}/init`, { method: 'POST' })
    //     .then(response => console.log('DB initialized'))
    //     .catch(error => console.log('DB already initialized'));
});

// Страница 1: Выбор пользователя
async function initUserSelection() {
    // Загружаем список пользователей
    await loadUsers();
    
    // Обработчик выбора пользователя
    document.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.user-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            currentUser = {
                id: this.dataset.id,
                username: this.dataset.username
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        });
    });
    
    // Обработчик добавления пользователя
    document.getElementById('addUserBtn').addEventListener('click', async function() {
        const input = document.getElementById('newUsername');
        const username = input.value.trim();
        
        if(!username) {
            alert('Введите имя пользователя');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            
            const user = await response.json();
            
            // Сохраняем текущего пользователя
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Очищаем поле
            input.value = '';
            
            // Перезагружаем список
            await loadUsers();
            
            // Выбираем нового пользователя
            const newUserItem = document.querySelector(`.user-item[data-id="${user.id}"]`);
            if(newUserItem) {
                newUserItem.click();
            }
            
        } catch(error) {
            console.error('Error adding user:', error);
            alert('Ошибка при добавлении пользователя');
        }
    });
    
    // Обработчик кнопки "Далее"
    document.getElementById('nextBtn').addEventListener('click', function() {
        if(!currentUser) {
            alert('Выберите пользователя');
            return;
        }
        
        window.location.href = 'material_selection.html';
    });
    
    // Кнопка "Назад" (если есть)
    const backBtn = document.getElementById('backBtn');
    if(backBtn) {
        backBtn.addEventListener('click', function() {
            // На первой странице эта кнопка может вести на главную или статистику
            window.location.href = 'statistics.html';
        });
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();
        
        const container = document.getElementById('userList');
        container.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.dataset.id = user.id;
            userElement.dataset.username = user.username;
            userElement.textContent = user.username;
            
            // Проверяем, не является ли это текущим пользователем
            const storedUser = localStorage.getItem('currentUser');
            if(storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if(parsedUser.id === user.id) {
                    currentUser = parsedUser;
                    userElement.classList.add('selected');
                }
            }
            
            container.appendChild(userElement);
        });
    } catch(error) {
        console.error('Error loading users:', error);
    }
}

// Страница 2: Выбор материала
async function initMaterialSelection() {
    // Загружаем текущего пользователя
    const storedUser = localStorage.getItem('currentUser');
    if(storedUser) {
        currentUser = JSON.parse(storedUser);
    } else {
        // Если пользователь не выбран, возвращаем на первую страницу
        window.location.href = 'user_selection.html';
        return;
    }
    
    // Загружаем материалы
    await loadMaterials();
    
    // Обработчик выбора материала
    document.querySelectorAll('.material-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.material-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const materialId = this.dataset.id;
            selectedMaterial = materials.find(m => m.id == materialId);
            
            // Сохраняем в localStorage
            localStorage.setItem('selectedMaterial', JSON.stringify(selectedMaterial));
        });
    });
    
    // Обработчик кнопки "Далее"
    document.getElementById('nextBtn').addEventListener('click', function() {
        if(!selectedMaterial) {
            alert('Выберите материал');
            return;
        }
        
        window.location.href = 'instructions.html';
    });
    
    // Кнопка "Назад"
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'user_selection.html';
    });
}

async function loadMaterials() {
    try {
        const response = await fetch(`${API_BASE_URL}/materials`);
        materials = await response.json();
        
        const container = document.getElementById('materialsContainer');
        container.innerHTML = '';
        
        materials.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';
            card.dataset.id = material.id;
            
            card.innerHTML = `
                <div class="material-title">${material.name}</div>
                <div class="material-description">${material.description}</div>
                <div class="material-example">${material.example}</div>
            `;
            
            container.appendChild(card);
        });
        
        // Проверяем, не был ли материал выбран ранее
        const storedMaterial = localStorage.getItem('selectedMaterial');
        if(storedMaterial) {
            const parsedMaterial = JSON.parse(storedMaterial);
            const materialCard = document.querySelector(`.material-card[data-id="${parsedMaterial.id}"]`);
            if(materialCard) {
                materialCard.click();
            }
        }
    } catch(error) {
        console.error('Error loading materials:', error);
    }
}

// Страница 3: Инструкции
function initInstructionsPage() {
    // Загружаем выбранный материал
    const storedMaterial = localStorage.getItem('selectedMaterial');
    if(!storedMaterial) {
        window.location.href = 'material_selection.html';
        return;
    }
    
    selectedMaterial = JSON.parse(storedMaterial);
    
    // Отображаем инструкции
    document.getElementById('materialName').textContent = selectedMaterial.name;
    document.getElementById('instructionsText').textContent = selectedMaterial.instructions;
    document.getElementById('restrictionsText').textContent = selectedMaterial.restrictions;
    
    // Обработчик кнопки "Есть триггер"
    document.getElementById('hasTriggerBtn').addEventListener('click', function() {
        if(confirm('Вы уверены, что у предмета есть особенности, запрещающие утилизацию?')) {
            window.location.href = 'user_selection.html';
        }
    });
    
    // Обработчик кнопки "Далее"
    document.getElementById('nextBtn').addEventListener('click', async function() {
        // Регистрируем утилизацию
        try {
            await fetch(`${API_BASE_URL}/dispose`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    material_id: selectedMaterial.id
                })
            });
            
            // Переходим к статистике
            window.location.href = 'statistics.html';
            
        } catch(error) {
            console.error('Error recording disposal:', error);
            alert('Ошибка при сохранении данных');
        }
    });
    
    // Кнопка "Назад"
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'material_selection.html';
    });
}

// Страница 4: Статистика
async function initStatisticsPage() {
    // Загружаем текущего пользователя
    const storedUser = localStorage.getItem('currentUser');
    if(!storedUser) {
        window.location.href = 'user_selection.html';
        return;
    }
    
    currentUser = JSON.parse(storedUser);
    
    // Загружаем статистику
    await loadStatistics();
    
    // Генерация комплимента
    generateCompliment();
    
    // Обработчик кнопки "Далее"
    document.getElementById('nextBtn').addEventListener('click', function() {
        window.location.href = 'user_selection.html';
    });
    
    // Кнопка "Назад"
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'instructions.html';
    });
}

async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics/${currentUser.id}`);
        const stats = await response.json();
        
        // Отображаем общую статистику
        document.getElementById('totalDisposals').textContent = stats.total;
        document.getElementById('yearlyDisposals').textContent = stats.yearly;
        document.getElementById('monthlyDisposals').textContent = stats.monthly;
        
        // Отображаем разбивку по материалам
        const breakdownContainer = document.getElementById('materialsBreakdown');
        breakdownContainer.innerHTML = '';
        
        if(stats.by_material && Object.keys(stats.by_material).length > 0) {
            for(const [material, count] of Object.entries(stats.by_material)) {
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                item.innerHTML = `
                    <span>${material}</span>
                    <span class="stat-value">${count}</span>
                `;
                breakdownContainer.appendChild(item);
            }
        } else {
            breakdownContainer.innerHTML = '<p style="text-align: center; color: #666;">Нет данных об утилизации</p>';
        }
        
    } catch(error) {
        console.error('Error loading statistics:', error);
        document.getElementById('totalDisposals').textContent = '0';
        document.getElementById('yearlyDisposals').textContent = '0';
        document.getElementById('monthlyDisposals').textContent = '0';
    }
}

function generateCompliment() {
    const compliments = [
        "Спасибо, что правильно утилизировали отходы! Планета благодарна вам.",
        "Каждая правильная сортировка — шаг к чистой Земле. Вы молодец!",
        "Деревья кланяются вам в ноги за спасённую бумагу!",
        "Благодаря вам меньше мусора попадает на свалки. Продолжайте в том же духе!",
        "Ваш вклад в экологию бесценен. Спасибо за сознательность!",
        "Сортируя мусор, вы создаёте лучшее будущее. Так держать!",
        "Один человек может изменить мир. Вы — тот самый человек!"
    ];
    
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    document.getElementById('complimentText').textContent = randomCompliment;
}