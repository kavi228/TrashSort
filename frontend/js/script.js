// УПРОЩЕННАЯ ВЕРСИЯ 2.0 - С УДАЛЕНИЕМ ПОЛЬЗОВАТЕЛЕЙ И ИНДИВИДУАЛЬНОЙ СТАТИСТИКОЙ
console.log('TrashSort JS loaded - Версия 2.4 с улучшенным дизайном');

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
let allUsers = [];

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function goToPage(page) {
    window.location.href = page;
}

function deleteUser(userId) {
    let users = loadData('trashsort_users') || [];
    users = users.filter(user => user.id !== userId);
    saveData('trashsort_users', users);
    
    if (currentUser && currentUser.id === userId) {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    let disposals = loadData('trashsort_disposals') || [];
    disposals = disposals.filter(d => d.user_id !== userId);
    saveData('trashsort_disposals', disposals);
    
    return users;
}

function getUserStatistics(userId) {
    const disposals = loadData('trashsort_disposals') || [];
    const userDisposals = disposals.filter(d => d.user_id === userId);
    const total = userDisposals.length;
    
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const yearly = userDisposals.filter(d => new Date(d.timestamp) > oneYearAgo).length;
    const monthly = userDisposals.filter(d => new Date(d.timestamp) > oneMonthAgo).length;
    
    const byMaterial = {};
    userDisposals.forEach(d => {
        const materialName = d.material_name || "Неизвестно";
        byMaterial[materialName] = (byMaterial[materialName] || 0) + 1;
    });
    
    return { total, yearly, monthly, byMaterial, userDisposals };
}

// ========== СТРАНИЦА 1: ВЫБОР ПОЛЬЗОВАТЕЛЯ (КОМПАКТНЫЙ) ==========
function initUserSelection() {
    console.log('Инициализация страницы выбора пользователя');
    const userList = document.getElementById('userList');
    const addUserBtn = document.getElementById('addUserBtn');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const searchContainer = document.getElementById('searchContainer');
    
    if (!userList) return;
    
    // Загружаем пользователей
    allUsers = loadData('trashsort_users') || [
        { id: 1, username: "Алексей" },
        { id: 2, username: "Мария" },
        { id: 3, username: "Дмитрий" }
    ];
    
    // Создаем поиск
    if (searchContainer) {
        searchContainer.innerHTML = `
            <input type="text" 
            id="userSearch" 
            class="add-user-input" 
            placeholder="Поиск пользователей..."
            style="width: 100%; margin-bottom: 10px; padding: 16px 20px; border: 2px solid #ffd700; border-radius: 10px;">
        `;
    }
    
    // Отображаем пользователей с фильтрацией
    function renderUsers(searchTerm = '') {
        userList.innerHTML = '';
        
        // Фильтруем пользователей
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
            emptyMsg.textContent = searchTerm.trim() === '' ? 'Нет пользователей. Добавьте первого!' : 'Пользователи не найдены';
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
                                   font-size: 12px; min-width: 70px;">
                        Удалить
                    </button>
                </div>
            `;
            
            // Обработчик выбора пользователя
            userItem.onclick = function(e) {
                if (e.target.classList.contains('delete-user-btn')) return;
                
                document.querySelectorAll('.user-item').forEach(item => {
                    item.classList.remove('selected');
                });
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
                e.stopPropagation();
                const userId = parseInt(this.dataset.id);
                const userName = this.closest('.user-item').querySelector('span').textContent;
                
                if (confirm(`Удалить пользователя "${userName}"?`)) {
                    allUsers = deleteUser(userId);
                    const searchInput = document.getElementById('userSearch');
                    const currentSearch = searchInput ? searchInput.value : '';
                    renderUsers(currentSearch);
                    
                    if (currentUser && currentUser.id === userId) {
                        currentUser = null;
                        localStorage.removeItem('currentUser');
                    }
                }
            };
        });
    }
    
    // Настройка поиска
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderUsers(this.value);
        });
        
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                renderUsers('');
                this.blur();
            }
        });
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
            
            const existingUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (existingUser) {
                alert('Пользователь с таким именем уже существует!');
                return;
            }
            
            const newUser = { id: Date.now(), username: username };
            allUsers.push(newUser);
            saveData('trashsort_users', allUsers);
            
            const searchInput = document.getElementById('userSearch');
            if (searchInput) searchInput.value = '';
            
            renderUsers('');
            input.value = '';
            
            setTimeout(() => {
                const newUserElem = document.querySelector(`.user-item[data-id="${newUser.id}"]`);
                if (newUserElem) newUserElem.click();
            }, 100);
        };
    }
    
    // Кнопка "Далее"
    if (nextBtn) {
        nextBtn.onclick = function() {
            const selectedUserElement = document.querySelector('.user-item.selected');
            
            if (!selectedUserElement) {
                alert('❌ ВЫБЕРИТЕ ПОЛЬЗОВАТЕЛЯ!\n\nНажмите на имя пользователя в списке выше.');
                
                userList.style.border = '3px solid #ff3333';
                userList.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
                
                setTimeout(() => {
                    userList.style.border = '2px solid #ffd700';
                    userList.style.boxShadow = 'none';
                }, 2000);
                return;
            }
            
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
    
    // Загружаем текущего пользователя
    currentUser = loadData('currentUser');
    renderUsers();
}

// ========== СТРАНИЦА 2: ВЫБОР МАТЕРИАЛА ==========
function initMaterialSelection() {
    console.log('Инициализация страницы выбора материала');
    
    const fromClassifierNotSuitable = localStorage.getItem('fromClassifierNotSuitable') === 'true';
    if (fromClassifierNotSuitable) {
        // Показываем сообщение, что нужно выбрать другой материал
        setTimeout(() => {
            alert('Вы указали, что предмет не подходит для предложенного контейнера. Пожалуйста, выберите подходящий контейнер из списка.');
        }, 500);
        
        // Очищаем флаг
        localStorage.removeItem('fromClassifierNotSuitable');
    }
    
    const materialsContainer = document.getElementById('materialsContainer');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const cornerButton = document.getElementById('cornerButton');
    
    if (!materialsContainer) return;
    
    // Загружаем выбранного пользователя
    currentUser = loadData('currentUser');
    if (!currentUser) {
        alert('Сначала выберите пользователя');
        goToPage('user_selection.html');
        return;
    }
    
    // Добавляем кнопку с фотоаппаратом в углу
    if (cornerButton) {
        cornerButton.onclick = function() {
            goToPage('recycle-classifier.html');
        };
    }
    
    // Отображаем материалы в оригинальном дизайне
    materialsContainer.innerHTML = '';
    materials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.dataset.id = material.id;
        
        card.innerHTML = `
            <div class="material-title">${material.container}</div>
            <div style="font-size: 1.1rem; color: #ff9900; font-weight: 600; margin-bottom: 10px;">${material.name}</div>
            <div class="material-description">${material.example}</div>
        `;
        
        // Оригинальные эффекты при наведении
        card.onmouseenter = function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(255, 215, 0, 0.3)';
        };
        
        card.onmouseleave = function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }
        };
        
        card.onclick = function() {
            // Убираем выделение у всех
            document.querySelectorAll('.material-card').forEach(item => {
                item.classList.remove('selected');
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                item.style.backgroundColor = '#ffffff';
            });
            
            // Выделяем текущий с анимацией
            this.classList.add('selected');
            this.style.backgroundColor = '#fff9e6';
            this.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
            this.style.transform = 'translateY(-5px)';
            
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
    
    // Добавляем CSS для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: translateY(-5px) scale(1); }
            50% { transform: translateY(-5px) scale(1.05); }
            100% { transform: translateY(-5px) scale(1); }
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

// ========== СТРАНИЦА 3: ИНСТРУКЦИИ (СУПЕР КОМПАКТНЫЕ) ==========
function initInstructionsPage() {
    console.log('Инициализация страницы инструкций');
    
    const pageTitle = document.getElementById('pageTitle');
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
    
    // Обновляем заголовок страницы
    if (pageTitle) {
        pageTitle.textContent = `Инструкция по утилизации: ${selectedMaterial.name}`;
    }
    
    // Компактное название материала
    materialName.innerHTML = `
        <div style="font-size: 1.5rem; font-weight: bold; color: #333; margin-bottom: 5px;">
            ${selectedMaterial.name}
        </div>
        <div style="font-size: 1rem; color: #666;">
            ${selectedMaterial.container}
        </div>
    `;
    
    // Компактные инструкции
    if (instructionsText) {
        instructionsText.innerHTML = `
            <div style="font-size: 0.9rem; line-height: 1.4;">
                ${selectedMaterial.instructions.split('\n').map(line => {
                    if (line.startsWith('✓')) {
                        return `<div style="margin: 4px 0; padding-left: 8px; border-left: 2px solid #28a745;">${line.substring(1).trim()}</div>`;
                    }
                    return line;
                }).join('')}
            </div>
        `;
    }
    
    // Компактные ограничения
    if (restrictionsText) {
        restrictionsText.innerHTML = `
            <div style="font-size: 0.9rem; line-height: 1.4;">
                ${selectedMaterial.restrictions.split('\n').map(line => {
                    if (line.startsWith('✗')) {
                        return `<div style="margin: 4px 0; padding-left: 8px; border-left: 2px solid #dc3545;">${line.substring(1).trim()}</div>`;
                    }
                    return line;
                }).join('')}
            </div>
        `;
    }
    
    // Кнопка "Есть триггер"
    if (hasTriggerBtn) {
        hasTriggerBtn.onclick = function() {
            goToPage('user_selection.html');
        };
    }
    
    // Кнопка "Далее"
    if (nextBtn) {
        nextBtn.onclick = function() {
            if (!selectedMaterial) {
                alert('Выберите материал');
                return;
            }
            
            // Сохраняем статистику
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
            goToPage('preparation.html');
        };
    }
    
    // Кнопка "Назад"
    if (backBtn) {
        backBtn.onclick = function() {
            goToPage('material_selection.html');
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
    
    // Красивый заголовок
    const materialNameOnly = lastDisposal.name.split(': ')[1] || lastDisposal.name;
    pageTitle.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 2.5rem; margin-bottom: 10px;"></div>
            <div style="font-size: 1.8rem; font-weight: bold; color: #333; margin-bottom: 5px;">
                Отличная работа!
            </div>
            <div style="font-size: 1.2rem; color: #666;">
                Вы утилизировали <span style="color: #ff9900; font-weight: 600;">${materialNameOnly.toLowerCase()}</span>
            </div>
        </div>
    `;
    
    // Мотивационная фраза
    const motivationPhrases = {
        'Контейнер 1: ПЭТ-бутылки': [
            `🌊 Вы спасли ${Math.floor(materialDisposals * 1.5)} морских животных от пластика!`,
            `♻️ ПЭТ-бутылки получат вторую жизнь как одежда или мебель!`,
            `🐋 Вы делаете океаны чище с каждой бутылкой!`
        ],
        'Контейнер 2: Бытовой пластик': [
            `🛡️ Вы защитили природу от химических веществ!`,
            `🔁 Флаконы и канистры будут переработаны в новые изделия!`,
            `🌿 Правильная утилизация бытового пластика спасает экосистемы!`
        ],
        'Контейнер 3: Пищевой пластик': [
            `🍽️ Пищевой пластик чист и готов к новой жизни!`,
            `📦 Упаковка от еды станет полезными вещами!`,
            `✅ Вы сделали всё правильно - контейнеры не станут мусором!`
        ],
        'Контейнер 4: Пенопласт': [
            `📦 Пенопласт упакован идеально - минимум места!`,
            `♾️ Упаковка от техники избежала 1000 лет разложения!`,
            `🥚 Яичные лотки получат второй шанс!`
        ],
        'Контейнер 5: Картон, бумага': [
            `🌳 Вы спасли ${Math.floor(materialDisposals * 0.17)} дерева!`,
            `💧 Сохранено ${materialDisposals * 50} литров воды!`,
            `📚 Эта бумага станет новой книгой или тетрадью!`
        ],
        'Контейнер 6: Стекло': [
            `⚡ Сэкономлено ${materialDisposals * 25}% энергии на производстве!`,
            `♻️ Стекло можно перерабатывать бесконечно!`,
            `🥛 Бутылки вернутся на полки через 30 дней!`
        ]
    };
    
    const phrases = motivationPhrases[lastDisposal.name] || [
        '🌍 Спасибо за ваш вклад в чистоту планеты!'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    motivationText.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
            padding: 15px;
            border-radius: 12px;
            border-left: 4px solid #ffd700;
            margin: 10px 0;
            font-size: 1.1rem;
            line-height: 1.4;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        ">
            ${randomPhrase}
        </div>
    `;
    
    // Экологический факт
    const ecoFacts = [
        `📊 Если бы каждый сортировал мусор, свалки сократились бы на 60%!`,
        `⚡ Переработка одной алюминиевой банки экономит энергию для работы телевизора 3 часа!`,
        `♻️ Стекло разлагается 1000+ лет, но перерабатывается бесконечно!`,
        `🌱 Переработка пластика экономит до 80% энергии по сравнению с производством нового!`,
        `💧 На производство 1 кг бумаги уходит 300 литров воды - вы экономите этот ресурс!`
    ];
    const randomFact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
    environmentFact.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%);
            padding: 12px;
            border-radius: 10px;
            margin: 15px 0;
            font-size: 0.95rem;
            line-height: 1.4;
            border-left: 4px solid #4CAF50;
        ">
            <div style="font-weight: bold; color: #2E7D32; margin-bottom: 5px;">📚 Экологический факт</div>
            <div>${randomFact}</div>
        </div>
    `;
    
    // Статистика
    if (totalCount && materialCount && todayCount) {
        totalCount.textContent = totalUserDisposals;
        materialCount.textContent = materialDisposals;
        todayCount.textContent = todayDisposals;
    }
    
    // Кнопки
    if (continueBtn) {
        continueBtn.onclick = function() {
            goToPage('material_selection.html');
        };
    }
    
    if (statsBtn) {
        statsBtn.onclick = function() {
            goToPage('statistics.html');
        };
    }
    
    // Таймер автовозврата
    const TIMEOUT_SECONDS = 15;
    let timeLeft = TIMEOUT_SECONDS;
    let inactivityTimer;
    
    const timerElement = document.createElement('div');
    timerElement.id = 'autoRedirectTimer';
    timerElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ffd700 0%, #ffc107 100%);
        color: #000;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
        border: 2px solid rgba(255, 255, 255, 0.3);
    `;
    
    const timerIcon = document.createElement('span');
    timerIcon.textContent = '⏱️';
    
    const timerText = document.createElement('span');
    timerText.id = 'timerCountdown';
    timerText.textContent = `Автовозврат через: ${timeLeft} сек`;
    
    timerElement.appendChild(timerIcon);
    timerElement.appendChild(timerText);
    document.body.appendChild(timerElement);
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        timeLeft = TIMEOUT_SECONDS;
        updateTimerDisplay();
        
        inactivityTimer = setTimeout(() => {
            redirectToMainPage();
        }, TIMEOUT_SECONDS * 1000);
    }
    
    function updateTimerDisplay() {
        timerText.textContent = `Автовозврат через: ${timeLeft} сек`;
        
        if (timeLeft <= 5) {
            timerElement.style.background = 'linear-gradient(135deg, #ff3333 0%, #cc0000 100%)';
            timerElement.style.color = 'white';
        } else if (timeLeft <= 10) {
            timerElement.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
        }
    }
    
    const countdownInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
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
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            text-align: center;
            z-index: 9999;
            border: 3px solid #ffd700;
            min-width: 300px;
        `;
        message.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">🎉</div>
            <h3 style="margin: 0 0 10px 0; color: #333;">Спасибо!</h3>
            <p style="color: #666; margin: 0;">Возвращаем на главную...</p>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    
    resetInactivityTimer();
    
    // Обработчики кнопок с очисткой таймера
    const originalContinueClick = continueBtn.onclick;
    const originalStatsClick = statsBtn.onclick;
    
    continueBtn.onclick = function() {
        clearTimeout(inactivityTimer);
        clearInterval(countdownInterval);
        timerElement.remove();
        originalContinueClick.call(this);
    };
    
    if (statsBtn) {
        statsBtn.onclick = function() {
            clearTimeout(inactivityTimer);
            clearInterval(countdownInterval);
            timerElement.remove();
            originalStatsClick.call(this);
        };
    }
    
    window.addEventListener('beforeunload', function() {
        clearTimeout(inactivityTimer);
        clearInterval(countdownInterval);
    });
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
    const homeBtn = document.getElementById('homeBtn');
    const resetBtn = document.getElementById('resetBtn');
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
    
    // Кнопка "Главная"
    if (homeBtn) {
        homeBtn.onclick = function() {
            goToPage('index.html');
        };
    }
    
    // Кнопка "Сбросить статистику"
    if (resetBtn) {
        resetBtn.onclick = function() {
            if (confirm('Вы уверены, что хотите сбросить всю свою статистику? Это действие нельзя отменить.')) {
                // Удаляем все утилизации этого пользователя
                let disposals = loadData('trashsort_disposals') || [];
                disposals = disposals.filter(d => d.user_id !== currentUser.id);
                saveData('trashsort_disposals', disposals);
                
                // Перезагружаем страницу
                location.reload();
            }
        };
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

// ========== ГЛАВНАЯ СТРАНИЦА ==========
function initMainPage() {
    console.log('Инициализация главной страницы');
    
    // НА ГЛАВНОЙ СТРАНИЦЕ логотип НЕ кликабелен
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'default'; // Курсор по умолчанию
        logo.style.pointerEvents = 'none'; // Отключаем клики
        logo.title = ''; // Убираем подсказку
        
        // Убираем ховер-эффект на главной
        logo.onmouseenter = null;
        logo.onmouseleave = null;
        logo.onclick = null;
    }
}

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен - TrashSort v2.4 с улучшенным дизайном!');
    
    // Определяем текущую страницу
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    console.log('Текущая страница:', page);
    
    // Вызываем соответствующую функцию инициализации
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
        case 'empty.html':
            // Пустая страница не требует инициализации
            break;
        default:
            console.log('Неизвестная страница:', page);
            window.location.href = 'index.html';
    }
    
    // Обработка кнопок "Назад" для всех страниц
    setTimeout(() => {
        const allBackBtns = document.querySelectorAll('#backBtn');
        allBackBtns.forEach(btn => {
            if (btn) {
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
                            'statistics.html': 'motivation.html',
                            'empty.html': 'material_selection.html'
                        };
                        
                        if (fallbackRoutes[currentPage]) {
                            window.location.href = fallbackRoutes[currentPage];
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                };
            }
        });
    }, 100);
    
    // Кликабельный логотип на ВСЕХ страницах кроме главной
    const logo = document.querySelector('.logo');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (logo && currentPage !== 'index.html' && currentPage !== '') {
        logo.style.cursor = 'pointer';
        logo.title = 'Вернуться на главную';
        logo.style.pointerEvents = 'auto';
        
        // Добавляем ховер-эффект
        logo.addEventListener('mouseenter', function() {
            this.style.color = '#ffd700';
            this.style.transform = 'scale(1.05)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.color = '#333333';
            this.style.transform = 'scale(1)';
        });
        
        logo.onclick = function() {
            goToPage('index.html');
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