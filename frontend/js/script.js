// УПРОЩЕННАЯ ВЕРСИЯ 2.0 - С УДАЛЕНИЕМ ПОЛЬЗОВАТЕЛЕЙ И ИНДИВИДУАЛЬНОЙ СТАТИСТИКОЙ
console.log('TrashSort JS loaded - Версия 2.2 с поиском пользователей');

// ========== ДАННЫЕ МАТЕРИАЛОВ ==========
const materials = [
    {
        id: 1,
        container: "Контейнер 1",
        name: "ПЭТ-бутылки",
        example: "Бутылки от воды, газировки",
        instructions: "✓ Пищевая\n✓ Прозрачная\n✓ Смятая\n✓ Желательно закрученная крышкой\n✓ Без остатков органики",
        restrictions: "✗ Белая непрозрачная\n✗ Контейнеры, стаканы\n✗ От растительного масла\n✗ Не пищевая"
    },
    {
        id: 2,
        container: "Контейнер 2",
        name: "Бытовой пластик",
        example: "Пластик от бытовой химии, канистры, флаконы",
        instructions: "✓ Пищевые и нет\n✓ Любого цвета\n✓ Желательно смятые\n✓ Без остатков продукта\n✓ Пупырка\n✓ Плотная плёнка\n✓ Плотные пакеты",
        restrictions: "✗ Без маркировки\n✗ Со скотчем"
    },
    {
        id: 3,
        container: "Контейнер 3",
        name: "Пищевой пластик",
        example: "Твёрдые стаканчики и крышки, контейнеры, упаковка от готовой еды, жёсткая одноразовая посуда",
        instructions: "✓ Чистые\n✓ Со снятыми наклейками, термоусадочной плёнкой\n✓ С цветной печатью прямо на пластике\n✓ Только твёрдые ёмкости",
        restrictions: "✗ С термоусадочной плёнкой\n✗ Пакеты с маркировкой\n✗ Крупногабаритные ёмкости (вёдра, тазы и т.д.)"
    },
    {
        id: 4,
        container: "Контейнер 4",
        name: "Пенопласт",
        example: "Упаковка от техники, яичные лотки",
        instructions: "✓ От мебели или техники\n✓ Строительный, в т.ч. пеноплекс\n✓ Упаковочный\n✓ Ячейки от яиц",
        restrictions: "✗ Из под еды"
    },
    {
        id: 5,
        container: "Контейнер 5",
        name: "Картон, бумага",
        example: "Коробки, бумага",
        instructions: "✓ Чистые и сухие коробки\n✓ Газеты и журналы\n✓ Офисная бумага\n✓ Картон",
        restrictions: "✗ Мокрая или грязная бумага\n✗ Чеки\n✗ Санитарно-гигиенические изделия\n✗ Ламинированная бумага"
    },
    {
        id: 6,
        container: "Контейнер 6",
        name: "Стекло",
        example: "Бутылки, банки",
        instructions: "✓ Чистые бутылки\n✓ Стеклянные банки\n✓ Без крышек\n✓ Без этикеток",
        restrictions: "✗ Оконные стёкла\n✗ Зеркала\n✗ Автомобильные стёкла\n✗ Хрусталь и керамика"
    }
];

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentUser = null;
let selectedMaterial = null;
let allUsers = []; // Будет хранить всех пользователей для поиска

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Сохранить в localStorage
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Загрузить из localStorage
function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Перейти на страницу
function goToPage(page) {
    window.location.href = page;
}

// Удалить пользователя
function deleteUser(userId) {
    // Загружаем пользователей
    let users = loadData('trashsort_users') || [];
    
    // Фильтруем удаляемого пользователя
    users = users.filter(user => user.id !== userId);
    
    // Сохраняем обновленный список
    saveData('trashsort_users', users);
    
    // Если удаляем текущего пользователя, сбрасываем его
    if (currentUser && currentUser.id === userId) {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    // Удаляем все утилизации этого пользователя
    let disposals = loadData('trashsort_disposals') || [];
    disposals = disposals.filter(d => d.user_id !== userId);
    saveData('trashsort_disposals', disposals);
    
    return users;
}

// Получить статистику для конкретного пользователя
function getUserStatistics(userId) {
    // Загружаем все утилизации
    const disposals = loadData('trashsort_disposals') || [];
    
    // Фильтруем по пользователю
    const userDisposals = disposals.filter(d => d.user_id === userId);
    
    // Рассчитываем статистику
    const total = userDisposals.length;
    
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const yearly = userDisposals.filter(d => new Date(d.timestamp) > oneYearAgo).length;
    const monthly = userDisposals.filter(d => new Date(d.timestamp) > oneMonthAgo).length;
    
    // Разбивка по материалам
    const byMaterial = {};
    userDisposals.forEach(d => {
        const materialName = d.material_name || "Неизвестно";
        byMaterial[materialName] = (byMaterial[materialName] || 0) + 1;
    });
    
    return {
        total,
        yearly,
        monthly,
        byMaterial,
        userDisposals
    };
}

// ========== СТРАНИЦА 1: ВЫБОР ПОЛЬЗОВАТЕЛЯ ==========
function initUserSelection() {
    console.log('Инициализация страницы выбора пользователя');
    const userList = document.getElementById('userList');
    const addUserBtn = document.getElementById('addUserBtn');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    
    if (!userList) return;
    
    // Загружаем пользователей из localStorage
    allUsers = loadData('trashsort_users') || [
        { id: 1, username: "Алексей" },
        { id: 2, username: "Мария" },
        { id: 3, username: "Дмитрий" }
    ];
    
    // Создаем контейнер для поиска с иконкой лупы
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.cssText = `
        margin-bottom: 20px;
        width: 100%;
        position: relative;
    `;
    
    searchContainer.innerHTML = `
        <div style="position: relative;">
            <input type="text" 
                   id="userSearch" 
                   class="add-user-input" 
                   placeholder="Поиск пользователей..."
                   style="width: 100%; margin-bottom: 10px; padding-left: 40px;">
            <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; font-size: 1.2rem;">
            </div>
        </div>
    `;
    
    // Вставляем поиск перед списком пользователей
    userList.parentNode.insertBefore(searchContainer, userList);
    
    // Отображаем пользователей с фильтрацией
    function renderUsers(searchTerm = '') {
        userList.innerHTML = '';
        
        // Фильтруем пользователей по поисковому запросу
        let filteredUsers = allUsers;
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filteredUsers = allUsers.filter(user => 
                user.username.toLowerCase().includes(term)
            );
        }
        
        // Обновляем информацию о результатах поиска
        const searchResultsInfo = document.getElementById('searchResultsInfo');
        if (searchResultsInfo) {
            if (searchTerm.trim() !== '') {
                if (filteredUsers.length === 0) {
                    searchResultsInfo.innerHTML = `<span style="color: #ff3333">Не найдено пользователей по запросу "${searchTerm}"</span>`;
                } else if (filteredUsers.length === 1) {
                    searchResultsInfo.innerHTML = `Найден 1 пользователь`;
                } else {
                    searchResultsInfo.innerHTML = `Найдено ${filteredUsers.length} пользователей`;
                }
            } else {
                searchResultsInfo.innerHTML = '';
            }
        }
        
        if (filteredUsers.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'user-item';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#666';
            
            if (searchTerm.trim() == '') {
                emptyMsg.textContent = 'Нет пользователей. Добавьте первого!';
            }
            
            userList.appendChild(emptyMsg);
            return;
        }
        
        filteredUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.dataset.id = user.id;
            userItem.dataset.username = user.username;
            
            // Подсветка текста поиска если есть
            let displayName = user.username;
            if (searchTerm.trim() !== '') {
                const term = searchTerm.toLowerCase();
                const name = user.username;
                const matchIndex = name.toLowerCase().indexOf(term);
                
                if (matchIndex !== -1) {
                    const before = name.substring(0, matchIndex);
                    const match = name.substring(matchIndex, matchIndex + term.length);
                    const after = name.substring(matchIndex + term.length);
                    displayName = `${before}<strong style="color: #ffd700">${match}</strong>${after}`;
                }
            }
            
            userItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>${displayName}</span>
                    <button class="delete-user-btn" data-id="${user.id}" 
                            style="background: #ff3333; color: white; border: none; 
                                   border-radius: 3px; padding: 3px 8px; cursor: pointer;
                                   font-size: 12px;">
                        Удалить
                    </button>
                </div>
            `;
            
            // Обработчик выбора пользователя
            userItem.onclick = function(e) {
                // Если кликнули по кнопке удаления - не выбираем пользователя
                if (e.target.classList.contains('delete-user-btn')) {
                    return;
                }
                
                // Убираем выделение у всех
                document.querySelectorAll('.user-item').forEach(item => {
                    item.classList.remove('selected');
                });
                // Выделяем текущего
                this.classList.add('selected');
                currentUser = user;
                saveData('currentUser', user);
                console.log('Выбран пользователь:', user.username);
            };
            
            userList.appendChild(userItem);
        });
        
        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.onclick = function(e) {
                e.stopPropagation(); // Останавливаем всплытие события
                const userId = parseInt(this.dataset.id);
                const userName = this.closest('.user-item').querySelector('span').textContent;
                
                if (confirm(`Удалить пользователя "${userName}"?`)) {
                    // Удаляем пользователя
                    allUsers = deleteUser(userId);
                    
                    // Получаем текущий поисковый запрос
                    const searchInput = document.getElementById('userSearch');
                    const currentSearch = searchInput ? searchInput.value : '';
                    
                    // Перерисовываем список
                    renderUsers(currentSearch);
                    
                    // Если удалили текущего пользователя, сбрасываем выбор
                    if (currentUser && currentUser.id === userId) {
                        currentUser = null;
                        localStorage.removeItem('currentUser');
                    }
                }
            };
        });
    }
    
    // ========== НАСТРОЙКА ПОИСКА ==========
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        // Обработчик ввода в поле поиска
        searchInput.addEventListener('input', function() {
            renderUsers(this.value);
        });
        
        // Обработчик очистки поиска при нажатии Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                renderUsers('');
                this.blur();
            }
        });
        
        // Обработчик клика по иконке поиска
        const searchIcon = searchInput.parentNode.querySelector('div');
        if (searchIcon) {
            searchIcon.style.cursor = 'pointer';
            searchIcon.title = 'Нажмите для фокуса на поле поиска';
            searchIcon.onclick = function() {
                searchInput.focus();
            };
        }
    }
    
    // Кнопка "Добавить пользователя"
    if (addUserBtn) {
        addUserBtn.onclick = function() {
            const input = document.getElementById('newUsername');
            const username = input.value.trim();
            
            if (!username) {
                alert('Введите имя пользователя');
                return;
            }
            
            // Проверяем, нет ли уже пользователя с таким именем
            const existingUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (existingUser) {
                alert('Пользователь с таким именем уже существует!');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                username: username
            };
            
            allUsers.push(newUser);
            saveData('trashsort_users', allUsers);
            
            // Очищаем поле поиска при добавлении нового пользователя
            const searchInput = document.getElementById('userSearch');
            if (searchInput) {
                searchInput.value = '';
            }
            
            renderUsers('');
            input.value = '';
            
            // Выбираем нового пользователя
            setTimeout(() => {
                const newUserElem = document.querySelector(`.user-item[data-id="${newUser.id}"]`);
                if (newUserElem) {
                    newUserElem.click();
                }
            }, 100);
        };
    }
    
    // Кнопка "Далее"
    if (nextBtn) {
        nextBtn.onclick = function() {
            // ЯВНАЯ проверка - есть ли ВИЗУАЛЬНО выбранный пользователь
            const selectedUserElement = document.querySelector('.user-item.selected');
            
            if (!selectedUserElement) {
                alert('❌ ВЫБЕРИТЕ ПОЛЬЗОВАТЕЛЯ!\n\nНажмите на имя пользователя в списке выше.');
                
                // Визуальная обратная связь
                userList.style.border = '3px solid #ff3333';
                userList.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
                
                setTimeout(() => {
                    userList.style.border = '2px solid #ffd700';
                    userList.style.boxShadow = 'none';
                }, 2000);
                
                return;
            }
            
            // Убедимся, что currentUser соответствует выбранному элементу
            const userId = parseInt(selectedUserElement.dataset.id);
            const selectedUser = allUsers.find(u => u.id === userId);
            
            if (selectedUser) {
                currentUser = selectedUser;
                saveData('currentUser', currentUser);
                console.log('Переход для пользователя:', currentUser.username);
                goToPage('material_selection.html');
            } else {
                alert('Ошибка: пользователь не найден');
            }
        };
    }
    
    // Кнопка "Назад"
    if (backBtn) {
        backBtn.onclick = function() {
            goToPage('statistics.html');
        };
    }
    
    // Загружаем текущего пользователя из localStorage
    currentUser = loadData('currentUser');
    
    // Первоначальная отрисовка
    renderUsers();
}

// ========== СТРАНИЦА 2: ВЫБОР МАТЕРИАЛА ==========
function initMaterialSelection() {
    console.log('Инициализация страницы выбора материала');
    
    const materialsContainer = document.getElementById('materialsContainer');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    
    if (!materialsContainer) return;
    
    // Загружаем выбранного пользователя
    currentUser = loadData('currentUser');
    if (!currentUser) {
        alert('Сначала выберите пользователя');
        goToPage('user_selection.html');
        return;
    }
    
    // Отображаем материалы - ВСЕ КОНТЕЙНЕРЫ ОДИНАКОВОГО РАЗМЕРА
    materialsContainer.innerHTML = '';
    materials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.dataset.id = material.id;
        
        // Используем container в заголовке и example в описании
        card.innerHTML = `
            <div class="material-title">${material.container}</div>
            <div class="material-name">${material.name}</div>
            <div class="material-description">${material.example}</div>
        `;
        
        // АНИМАЦИИ - ЖЁЛТАЯ ОБВОДКА И ЦВЕТ ПРИ НАВЕДЕНИИ
        card.onmouseenter = function() {
            this.style.transform = 'translateY(-5px) scale(1.03)';
            this.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.4)';
            this.style.border = '3px solid #ffd700';
            this.style.backgroundColor = 'rgba(255, 215, 0, 0.15)';
        };
        
        card.onmouseleave = function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
                this.style.border = '3px solid #ffd700';
                this.style.backgroundColor = '';
            }
        };
        
        card.onclick = function() {
            // Убираем выделение у всех
            document.querySelectorAll('.material-card').forEach(item => {
                item.classList.remove('selected');
                item.style.border = '3px solid #ffd700';
                item.style.backgroundColor = '';
                item.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            });
            
            // Выделяем текущий с анимацией
            this.classList.add('selected');
            this.style.border = '4px solid #ffd700';
            this.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            this.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.5)';
            
            // Эффект "пульсации"
            this.style.animation = 'pulse 0.5s ease-in-out';
            
            selectedMaterial = material;
            saveData('selectedMaterial', material);
            console.log('Выбран материал:', material.container, material.name);
            
            // Убираем анимацию после завершения
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        };
        
        materialsContainer.appendChild(card);
    });
    
    // Добавляем CSS для ОДИНАКОВЫХ КОНТЕЙНЕРОВ
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .material-card {
            width: 100%;
            height: 180px; /* ФИКСИРОВАННАЯ ВЫСОТА для всех */
            margin: 10px auto;
            padding: 20px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 3px solid #ffd700;
            border-radius: 15px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        }
        
        /* Полоска сверху */
        .material-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: #ffd700;
            opacity: 0.9;
        }
        
        .material-title {
            font-size: 1.4rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            line-height: 1.2;
        }
        
        .material-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ff9900;
            margin-bottom: 10px;
            line-height: 1.2;
        }
        
        .material-description {
            font-size: 0.95rem;
            color: #666;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        /* АДАПТИВНОСТЬ ДЛЯ ПЛАНШЕТА (ГОРИЗОНТАЛЬНО) */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
            #materialsContainer {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                max-width: 900px;
                margin: 0 auto;
                padding: 10px;
            }
            
            .material-card {
                margin: 0;
                height: 180px; /* ТА ЖЕ ВЫСОТА */
                width: 100%;
            }
            
            .material-title {
                font-size: 1.3rem;
            }
            
            .material-name {
                font-size: 1.1rem;
            }
            
            .material-description {
                font-size: 1rem;
                -webkit-line-clamp: 2;
            }
        }
        
        @media (min-width: 1024px) {
            #materialsContainer {
                grid-template-columns: repeat(3, 1fr);
                gap: 25px;
                max-width: 1200px;
            }
            
            .material-card {
                height: 180px; /* ТА ЖЕ ВЫСОТА */
            }
        }
        
        /* Для вертикальных планшетов */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
            #materialsContainer {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .material-card {
                height: 180px; /* ТА ЖЕ ВЫСОТА */
            }
        }
        
        /* Для мобильных */
        @media (max-width: 767px) {
            #materialsContainer {
                display: block;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .material-card {
                height: 180px; /* ТА ЖЕ ВЫСОТА */
                margin: 10px auto;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Кнопка "Далее"
    if (nextBtn) {
        nextBtn.onclick = function() {
            if (!selectedMaterial) {
                alert('Выберите материал');
                return;
            }
            goToPage('instructions.html');
        };
    }
    
    // Кнопка "Назад"
    if (backBtn) {
        backBtn.onclick = function() {
            goToPage('user_selection.html');
        };
    }
}

// ========== СТРАНИЦА 3: ИНСТРУКЦИИ (МИНИМАЛИСТИЧНАЯ) ==========
function initInstructionsPage() {
    console.log('Инициализация страницы инструкций');
    
    const materialName = document.getElementById('materialName');
    const instructionsText = document.getElementById('instructionsText');
    const restrictionsText = document.getElementById('restrictionsText');
    const hasTriggerBtn = document.getElementById('hasTriggerBtn');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    
    if (!materialName) return;
    
    // Загружаем выбранный материал
    selectedMaterial = loadData('selectedMaterial');
    if (!selectedMaterial) {
        alert('Сначала выберите материал');
        goToPage('material_selection.html');
        return;
    }
    
    // Загружаем текущего пользователя
    currentUser = loadData('currentUser');
    if (!currentUser) {
        alert('Пользователь не найден');
        goToPage('user_selection.html');
        return;
    }
    
    // МИНИМАЛИСТИЧНЫЙ ЗАГОЛОВОК
    materialName.innerHTML = `
        <h2 style="text-align: center; color: #333; margin-bottom: 5px; font-size: 1.8rem;">
            ${selectedMaterial.name}
        </h2>
        <div style="text-align: center; color: #666; font-size: 1.1rem; margin-bottom: 25px;">
            ${selectedMaterial.container}
        </div>
    `;
    
    if (instructionsText) {
        // МИНИМАЛИСТИЧНАЯ ИНСТРУКЦИЯ
        instructionsText.innerHTML = `
            <div style="margin-bottom: 25px;">
                <div style="
                    font-size: 1.2rem; 
                    font-weight: 600; 
                    color: #28a745;
                    margin-bottom: 12px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #28a745;
                ">
                    Можно:
                </div>
                <div style="
                    font-size: 1.1rem;
                    line-height: 1.5;
                    color: #333;
                    padding: 5px 0;
                ">
                    ${selectedMaterial.instructions.split('\n').map(line => {
                        if (line.startsWith('✓')) {
                            return `<div style="margin: 8px 0;">• ${line.substring(1).trim()}</div>`;
                        }
                        return line;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    if (restrictionsText) {
        // МИНИМАЛИСТИЧНЫЕ ОГРАНИЧЕНИЯ
        restrictionsText.innerHTML = `
            <div style="margin-bottom: 25px;">
                <div style="
                    font-size: 1.2rem; 
                    font-weight: 600; 
                    color: #dc3545;
                    margin-bottom: 12px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #dc3545;
                ">
                    Нельзя:
                </div>
                <div style="
                    font-size: 1.1rem;
                    line-height: 1.5;
                    color: #333;
                    padding: 5px 0;
                ">
                    ${selectedMaterial.restrictions.split('\n').map(line => {
                        if (line.startsWith('✗')) {
                            return `<div style="margin: 8px 0;">• ${line.substring(1).trim()}</div>`;
                        }
                        return line;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Добавляем минималистичный CSS
    const style = document.createElement('style');
    style.textContent = `
        /* МИНИМАЛИСТИЧНЫЙ ДИЗАЙН */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #333;
        }
        
        /* АДАПТИВНОСТЬ ДЛЯ ПЛАНШЕТА (ГОРИЗОНТАЛЬНО) */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
            #materialName h2 {
                font-size: 2rem;
            }
            
            #materialName div {
                font-size: 1.2rem;
            }
            
            #instructionsText > div,
            #restrictionsText > div {
                max-width: 80%;
                margin: 0 auto 30px auto;
            }
            
            #instructionsText > div > div:last-child,
            #restrictionsText > div > div:last-child {
                font-size: 1.1rem;
            }
            
            .button-container {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 30px;
            }
        }
        
        @media (min-width: 1024px) {
            #materialName h2 {
                font-size: 2.2rem;
            }
            
            #instructionsText > div,
            #restrictionsText > div {
                max-width: 600px;
                margin: 0 auto 30px auto;
            }
        }
        
        @media (max-width: 767px) {
            #materialName h2 {
                font-size: 1.6rem;
            }
            
            #instructionsText > div,
            #restrictionsText > div {
                margin: 0 15px 25px 15px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Кнопка "Есть триггер"
    if (hasTriggerBtn) {
        hasTriggerBtn.onclick = function() {
            goToPage('user_selection.html');
        };
    }
    
    // Кнопка "Далее" - теперь ведет на страницу мотивации
    if (nextBtn) {
        nextBtn.onclick = function() {
            if (!selectedMaterial) {
                alert('Выберите материал');
                return;
            }
            
            // Сохраняем статистику ТОЛЬКО для текущего пользователя
            let disposals = loadData('trashsort_disposals') || [];
            disposals.push({
                id: Date.now(),
                user_id: currentUser.id,
                username: currentUser.username,
                material_id: selectedMaterial.id,
                material_name: `${selectedMaterial.container}: ${selectedMaterial.name}`,
                timestamp: new Date().toISOString()
            });
            saveData('trashsort_disposals', disposals);
            
            // Сохраняем информацию для мотивационной страницы
            saveData('last_disposed_material', {
                id: selectedMaterial.id,
                name: `${selectedMaterial.container}: ${selectedMaterial.name}`,
                timestamp: new Date().toISOString()
            });
            
            // Переходим на страницу мотивации
            goToPage('motivation.html');
        };
    }
    
    // Кнопка "Назад"
    if (backBtn) {
        backBtn.onclick = function() {
            goToPage('material_selection.html');
        };
    }
}

// ========== СТРАНИЦА 4: СТАТИСТИКА ==========
function initStatisticsPage() {
    console.log('Инициализация страницы статистики');

    const totalDisposals = document.getElementById('totalDisposals');
    const yearlyDisposals = document.getElementById('yearlyDisposals');
    const monthlyDisposals = document.getElementById('monthlyDisposals');
    const complimentText = document.getElementById('complimentText');
    const materialsBreakdown = document.getElementById('materialsBreakdown');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    // Загружаем текущего пользователя
    currentUser = loadData('currentUser');
    if (!currentUser) {
        alert('Сначала выберите пользователя');
        goToPage('user_selection.html');
        return;
    }
    
    // Отображаем имя пользователя в заголовке
    if (userNameDisplay) {
        userNameDisplay.textContent = currentUser.username;
    } else {
        // Добавляем имя пользователя в заголовок
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.innerHTML = `Статистика: <span style="color: #ffd700">${currentUser.username}</span>`;
        }
    }
    
    // Получаем статистику ТОЛЬКО для текущего пользователя
    const stats = getUserStatistics(currentUser.id);
    
    // Отображаем статистику
    if (totalDisposals) totalDisposals.textContent = stats.total;
    if (yearlyDisposals) yearlyDisposals.textContent = stats.yearly;
    if (monthlyDisposals) monthlyDisposals.textContent = stats.monthly;
    
    // Комплименты
    if (complimentText) {
        const lastDisposal = loadData('last_disposed_material');
        let compliment;
        
        if (lastDisposal) {
            const materialSpecificCompliments = {
                'Контейнер 1: ПЭТ-бутылки': [
                    "Каждая пластиковая бутылка на переработке спасает морских животных! 🐋",
                    "Вы делаете океаны чище, сдавая пластик! 🌊",
                    "Пластик, который вы сдали, получит вторую жизнь как одежда или мебель!",
                ],
                'Контейнер 2: Бытовой пластик': [
                    "Бытовой пластик правильно утилизирован - опасные вещества не попадут в природу!",
                    "Флаконы и канистры получат новую жизнь благодаря вам!",
                    "Вы предотвратили химическое загрязнение окружающей среды!",
                ],
                'Контейнер 3: Пищевой пластик': [
                    "Пищевой пластик чист и готов к переработке в новые изделия!",
                    "Вы правильно подготовили упаковку от еды к переработке!",
                    "Стаканчики и контейнеры не станут мусором благодаря вам!",
                ],
                'Контейнер 4: Пенопласт': [
                    "Пенопласт упакован правильно - он займет минимум места!",
                    "Вы спасли упаковку от техники от долгого разложения на свалке!",
                    "Яичные лотки будут использованы повторно!",
                ],
                'Контейнер 5: Картон, бумага': [
                    "Деревья благодарят вам за переработку бумаги! 🌳",
                    "Вы спасаете леса и экономите воду с каждой сданной бумагой! 💧",
                    "Эта бумага станет новой книгой или тетрадью благодаря вам! 📚",
                ],
                'Контейнер 6: Стекло': [
                    "Стекло, которое вы сдали, обретёт новую жизнь через 30 дней! 🔄",
                    "Вы экономите природные ресурсы и энергию, сдавая стекло!",
                    "Стеклянная тара может перерабатываться бесконечно!",
                ]
            };
            
            const materialCount = stats.byMaterial[lastDisposal.name] || 0;
            const phrases = materialSpecificCompliments[lastDisposal.name] || [
                "Спасибо за ваш вклад в экологию!"
            ];
            
            if (materialCount > 1 && Math.random() > 0.5) {
                compliment = `Вы уже утилизировали ${materialCount} раз ${lastDisposal.name.toLowerCase()}! ${phrases[Math.floor(Math.random() * phrases.length)]}`;
            } else {
                compliment = phrases[Math.floor(Math.random() * phrases.length)];
            }
            
        } else {
            if (stats.total === 0) {
                compliment = "Начните сортировать мусор - планета будет благодарна! 🌱";
            } else if (stats.total < 5) {
                compliment = "Спасибо за ваши первые шаги в сортировке отходов! 🚶♂️";
            } else if (stats.total < 20) {
                compliment = "Вы делаете планету чище с каждой утилизацией! 🌍";
            } else if (stats.monthly > 10) {
                compliment = "Вы - настоящий эко-герой! 🦸♀️";
            } else if (Object.keys(stats.byMaterial).length >= 3) {
                compliment = "Вы сортируете разнообразные материалы - это отличная привычка! 🏆";
            } else {
                const generalCompliments = [
                    "Спасибо, что правильно утилизировали отходы!",
                    "Каждая правильная сортировка — шаг к чистой Земле.",
                    "Деревья кланяются вам за спасённую бумагу! 🌳",
                    "Благодаря вам меньше мусора попадает на свалки.",
                ];
                compliment = generalCompliments[Math.floor(Math.random() * generalCompliments.length)];
            }
        }
        
        complimentText.textContent = compliment;
    }
    
    // Разбивка по материалам
    if (materialsBreakdown) {
        materialsBreakdown.innerHTML = '';
        
        if (Object.keys(stats.byMaterial).length > 0) {
            const sortedMaterials = Object.entries(stats.byMaterial)
                .sort((a, b) => b[1] - a[1]);
            
            sortedMaterials.forEach(([material, count]) => {
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                
                const iconMap = {
                    'Контейнер 1: ПЭТ-бутылки': '🧴',
                    'Контейнер 2: Бытовой пластик': '🧴',
                    'Контейнер 3: Пищевой пластик': '🥡',
                    'Контейнер 4: Пенопласт': '📦',
                    'Контейнер 5: Картон, бумага': '📄',
                    'Контейнер 6: Стекло': '🥛'
                };
                
                const icon = iconMap[material] || '♻️';
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 10px 0;">
                        <span style="font-size: 1.5rem;">${icon}</span>
                        <span style="flex-grow: 1; font-size: 1rem;">${material}</span>
                        <span style="font-weight: bold; color: #ffd700; font-size: 1.2rem;">${count}</span>
                    </div>
                `;
                materialsBreakdown.appendChild(item);
            });
        } else {
            materialsBreakdown.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                    <p style="font-size: 1.1rem;">Нет данных об утилизации</p>
                </div>
            `;
        }
    }
    
    // Кнопка "Завершить"
    if (nextBtn) {
        nextBtn.onclick = function() {
            goToPage('user_selection.html');
        };
    }
    
    // Кнопка "Назад"
    if (backBtn) {
        backBtn.onclick = function() {
            goToPage('motivation.html');
        };
    }
}

// ========== СТРАНИЦА 5: МОТИВАЦИЯ ==========
function initMotivationPage() {
    console.log('Инициализация страницы мотивации');
    
    const materialIcon = document.getElementById('materialIcon');
    const pageTitle = document.getElementById('pageTitle');
    const motivationText = document.getElementById('motivationText');
    const environmentFact = document.getElementById('environmentFact');
    const totalCount = document.getElementById('totalCount');
    const materialCount = document.getElementById('materialCount');
    const todayCount = document.getElementById('todayCount');
    const continueBtn = document.getElementById('continueBtn');
    const statsBtn = document.getElementById('statsBtn');
    
    if (!materialIcon) return;
    
    // Загружаем информацию о последней утилизации
    const lastDisposal = loadData('last_disposed_material');
    if (!lastDisposal) {
        goToPage('material_selection.html');
        return;
    }
    
    // Загружаем текущего пользователя
    currentUser = loadData('currentUser');
    if (!currentUser) {
        goToPage('user_selection.html');
        return;
    }
    
    // Загружаем все утилизации пользователя
    const disposals = loadData('trashsort_disposals') || [];
    const userDisposals = disposals.filter(d => d.user_id === currentUser.id);
    
    // Рассчитываем статистику
    const totalUserDisposals = userDisposals.length;
    const today = new Date().toDateString();
    const todayDisposals = userDisposals.filter(d => 
        new Date(d.timestamp).toDateString() === today
    ).length;
    
    const materialDisposals = userDisposals.filter(d => 
        d.material_name === lastDisposal.name
    ).length;
    
    // Устанавливаем иконку
    const iconMap = {
        'Контейнер 1: ПЭТ-бутылки': '🧴',
        'Контейнер 2: Бытовой пластик': '🧴',
        'Контейнер 3: Пищевой пластик': '🥡',
        'Контейнер 4: Пенопласт': '📦',
        'Контейнер 5: Картон, бумага': '📄',
        'Контейнер 6: Стекло': '🥛'
    };
    
    materialIcon.textContent = iconMap[lastDisposal.name] || '♻️';
    
    // Устанавливаем заголовок
    const materialNameOnly = lastDisposal.name.split(': ')[1] || lastDisposal.name;
    pageTitle.textContent = `Вы утилизировали ${materialNameOnly.toLowerCase()}!`;
    
    // Генерируем мотивирующую фразу
    const motivationPhrases = {
        'Контейнер 1: ПЭТ-бутылки': [
            `Вы спасли ${Math.floor(materialDisposals * 1.5)} морских животных! 🐋`,
            `Этот пластик будет переработан в новую бутылку!`,
            `Вы сделали океан чище! 🌊`
        ],
        'Контейнер 2: Бытовой пластик': [
            `Вы предотвратили химическое загрязнение!`,
            `Флаконы и канистры получат вторую жизнь!`,
            `Бытовой пластик правильно утилизирован!`
        ],
        'Контейнер 3: Пищевой пластик': [
            `Пищевой пластик чист и готов к переработке!`,
            `Вы правильно подготовили упаковку!`,
            `Стаканчики и контейнеры не станут мусором!`
        ],
        'Контейнер 4: Пенопласт': [
            `Пенопласт упакован правильно!`,
            `Вы спасли упаковку от разложения на свалке!`,
            `Яичные лотки будут использованы повторно!`
        ],
        'Контейнер 5: Картон, бумага': [
            `Вы спасли ${Math.floor(materialDisposals * 0.17)} дерева! 🌳`,
            `Переработка этой бумаги сэкономила ${materialDisposals * 50} л воды! 💧`,
            `Эта бумага станет новой тетрадью! 📚`
        ],
        'Контейнер 6: Стекло': [
            `Переработанное стекло экономит ${materialDisposals * 25}% энергии!`,
            `Это стекло можно перерабатывать бесконечно!`,
            `Стеклянная бутылка вернётся на полку через 30 дней!`
        ]
    };
    
    const phrases = motivationPhrases[lastDisposal.name] || [
        'Спасибо за ваш вклад в чистоту планеты! 🌍'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    motivationText.textContent = randomPhrase;
    
    // Экологический факт
    const ecoFacts = [
        `Если бы каждый человек сортировал мусор, мы бы сократили свалки на 60%!`,
        `Переработка одной алюминиевой банки экономит энергию для работы телевизора 3 часа.`,
        `Стекло разлагается более 1000 лет, но может перерабатываться бесконечно.`,
        `Переработка пластика экономит до 80% энергии.`
    ];
    const randomFact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
    environmentFact.innerHTML = `<strong>Факт:</strong> ${randomFact}`;
    
    // Обновляем статистику
    totalCount.textContent = totalUserDisposals;
    materialCount.textContent = materialDisposals;
    todayCount.textContent = todayDisposals;
    
    const TIMEOUT_SECONDS = 15;
    let timeLeft = TIMEOUT_SECONDS;
    let inactivityTimer;
    
    // Таймер автовозврата
    const timerElement = document.createElement('div');
    timerElement.id = 'autoRedirectTimer';
    timerElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 215, 0, 0.9);
        color: #000;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    const timerIcon = document.createElement('span');
    timerIcon.textContent = '⏱️';
    
    const timerText = document.createElement('span');
    timerText.id = 'timerCountdown';
    timerText.textContent = `Автовозврат через: ${timeLeft} сек`;
    
    timerElement.appendChild(timerIcon);
    timerElement.appendChild(timerText);
    document.body.appendChild(timerElement);
    
    // Функция для сброса таймера
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        timeLeft = TIMEOUT_SECONDS;
        updateTimerDisplay();
        
        inactivityTimer = setTimeout(() => {
            redirectToMainPage();
        }, TIMEOUT_SECONDS * 1000);
    }
    
    // Обновление отображения таймера
    function updateTimerDisplay() {
        timerText.textContent = `Автовозврат через: ${timeLeft} сек`;
        
        if (timeLeft <= 5) {
            timerElement.style.background = 'rgba(255, 51, 51, 0.9)';
            timerElement.style.color = 'white';
        } else if (timeLeft <= 10) {
            timerElement.style.background = 'rgba(255, 193, 7, 0.9)';
        }
    }
    
    // Уменьшение таймера
    const countdownInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Перенаправление на главную
    function redirectToMainPage() {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '0.5';
        
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0,0,0,0.3);
            text-align: center;
            z-index: 9999;
            border: 3px solid #ffd700;
        `;
        message.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 15px;">⏰</div>
            <h3>Возвращаем на главную...</h3>
            <p>Спасибо за использование TrashSort!</p>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    // События, сбрасывающие таймер
    const activityEvents = [
        'mousemove', 'keydown', 'click', 'scroll', 'touchstart'
    ];
    
    activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    
    // Инициализация таймера
    resetInactivityTimer();
    
    // Обработчики кнопок
    if (continueBtn) {
        continueBtn.onclick = function() {
            clearTimeout(inactivityTimer);
            clearInterval(countdownInterval);
            timerElement.remove();
            goToPage('material_selection.html');
        };
    }
    
    if (statsBtn) {
        statsBtn.onclick = function() {
            clearTimeout(inactivityTimer);
            clearInterval(countdownInterval);
            timerElement.remove();
            goToPage('statistics.html');
        };
    }
    
    // Очистка
    window.addEventListener('beforeunload', function() {
        clearTimeout(inactivityTimer);
        clearInterval(countdownInterval);
    });
}

// ========== ГЛАВНАЯ СТРАНИЦА ==========
function initMainPage() {
    console.log('Инициализация главной страницы');
}

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен - TrashSort v2.2 с поиском пользователей!');
    
    // Определяем текущую страницу
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    console.log('Текущая страница:', page);
    
    switch(page) {
        case 'index.html':
        case '':
            initMainPage();
            break;
        case 'user_selection.html':
            initUserSelection();
            break;
        case 'material_selection.html':
            initMaterialSelection();
            break;
        case 'instructions.html':
            initInstructionsPage();
            break;
        case 'motivation.html':
            initMotivationPage();
            break;
        case 'statistics.html':
            initStatisticsPage();
            break;
        default:
            console.log('Неизвестная страница:', page);
            window.location.href = 'index.html';
    }
    
    // Обработка кнопок "Назад"
    setTimeout(() => {
        const allBackBtns = document.querySelectorAll('#backBtn');
        allBackBtns.forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    const currentPage = window.location.pathname.split('/').pop();
                    const fallbackRoutes = {
                        'user_selection.html': 'index.html',
                        'material_selection.html': 'user_selection.html',
                        'instructions.html': 'material_selection.html',
                        'motivation.html': 'instructions.html',
                        'statistics.html': 'motivation.html'
                    };
                    
                    if (fallbackRoutes[currentPage]) {
                        window.location.href = fallbackRoutes[currentPage];
                    }
                }
            };
        });
    }, 100);
    
    // Кликабельный логотип
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.title = 'Вернуться на главную';
        
        logo.onclick = function() {
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'index.html' || currentPage === '' || currentPage === 'index.html') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.location.href = 'index.html';
            }
        };
    }
});

// Глобальные функции
window.goToPage = goToPage;
window.goBack = function() {
    window.history.back();
};
window.deleteUser = deleteUser;
window.getUserStatistics = getUserStatistics;