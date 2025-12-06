// УПРОЩЕННАЯ ВЕРСИЯ 2.0 - С УДАЛЕНИЕМ ПОЛЬЗОВАТЕЛЕЙ И ИНДИВИДУАЛЬНОЙ СТАТИСТИКОЙ
console.log('TrashSort JS loaded - Версия 2.2 с поиском пользователей');

// ========== ДАННЫЕ ==========
const materials = [
    {
        id: 1,
        name: "Пластик",
        description: "Бутылки, упаковки, контейнеры из пластика",
        example: "PET-бутылки (1), канистры (2), пакеты (4), стаканчики (6)",
        instructions: "1. Ополосните от остатков содержимого\n2. Снимите крышки и этикетки\n3. Сплющите для экономии места\n4. Отнесите в контейнер для пластика",
        restrictions: "Не принимается: загрязнённый жиром пластик, игрушки, трубы, смешанные материалы"
    },
    {
        id: 2,
        name: "Стекло",
        description: "Бутылки, банки, стеклянная тара",
        example: "Пищевые банки, бутылки из-под напитков, стеклянная посуда",
        instructions: "1. Ополосните от остатков\n2. Не разбивайте заранее\n3. Крышки снимайте отдельно\n4. Сортируйте по цвету если требуется",
        restrictions: "Не принимается: зеркала, оконные стёкла, лампочки, хрусталь, керамика"
    },
    {
        id: 3,
        name: "Бумага",
        description: "Газеты, картон, офисная бумага",
        example: "Газеты, журналы, картон, офисная бумага, тетради",
        instructions: "1. Удалите скрепки и скобы\n2. Не мните в комок\n3. Сложите аккуратно\n4. Свяжите в стопки или используйте коробки",
        restrictions: "Не принимается: ламинированная бумага, чеки, салфетки, обои, упаковка от яиц"
    },
    {
        id: 4,
        name: "Металл",
        description: "Алюминиевые и жестяные банки, металлические изделия",
        example: "Банки из-под напитков, консервные банки, фольга, крышки",
        instructions: "1. Ополосните от остатков\n2. Сплющите для экономии места\n3. Отделите от других материалов\n4. Сложите в специальный контейнер",
        restrictions: "Не принимается: баллончики с остатками, батарейки, электроника, провода"
    },
    {
        id: 5,
        name: "Органика",
        description: "Пищевые отходы, растения",
        example: "Очистки овощей, фрукты, яичная скорлупа, чайные пакетики",
        instructions: "1. Собирайте в отдельный контейнер\n2. Используйте биоразлагаемые пакеты\n3. Регулярно выносите\n4. Можно компостировать",
        restrictions: "Не принимается: кости, мясо, рыба, молочные продукты, масла"
    },
    {
        id: 6,
        name: "Опасные отходы",
        description: "Батарейки, лампы, электроника, лекарства",
        example: "Батарейки, энергосберегающие лампы, градусники, просроченные лекарства",
        instructions: "1. Никогда не выбрасывайте с обычным мусором\n2. Отнесите в специальный пункт приёма\n3. Храните отдельно от детей",
        restrictions: "Требуют специальной утилизации! Не смешивать с другим мусором"
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
    
    // Отображаем материалы
    materialsContainer.innerHTML = '';
    materials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.dataset.id = material.id;
        
        card.innerHTML = `
            <div class="material-title">${material.name}</div>
            <div class="material-description">${material.description}</div>
            <div class="material-example">${material.example}</div>
        `;
        
        card.onclick = function() {
            // Убираем выделение у всех
            document.querySelectorAll('.material-card').forEach(item => {
                item.classList.remove('selected');
            });
            // Выделяем текущий
            this.classList.add('selected');
            selectedMaterial = material;
            saveData('selectedMaterial', material);
            console.log('Выбран материал:', material.name);
        };
        
        materialsContainer.appendChild(card);
    });
    
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

// ========== СТРАНИЦА 3: ИНСТРУКЦИИ ==========
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
    
    // Отображаем информацию о материале
    materialName.textContent = selectedMaterial.name;
    if (instructionsText) instructionsText.textContent = selectedMaterial.instructions;
    if (restrictionsText) restrictionsText.textContent = selectedMaterial.restrictions;
    
    // Кнопка "Есть триггер"
    if (hasTriggerBtn) {
        hasTriggerBtn.onclick = function() {
            if (confirm('Вы уверены, что у предмета есть особенности, запрещающие утилизацию?')) {
                alert('Предмет не подлежит утилизации через эту систему. Обратитесь в специальную службу.');
                goToPage('user_selection.html');
            }
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
                material_name: selectedMaterial.name,
                timestamp: new Date().toISOString()
            });
            saveData('trashsort_disposals', disposals);
            
            // Сохраняем информацию для мотивационной страницы
            saveData('last_disposed_material', {
                id: selectedMaterial.id,
                name: selectedMaterial.name,
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

// ========== СТРАНИЦА 4: СТАТИСТИКА (ОБНОВЛЕННАЯ) ==========
function initStatisticsPage() {
    console.log('Инициализация страницы статистики');

    // ========== ОБРАБОТКА КНОПКИ "ГЛАВНАЯ" ==========
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        };
        
        // Анимация при наведении
        homeBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        });
        
        homeBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    }
    
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
        // Добавляем имя пользователя в заголовок если нет отдельного элемента
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.innerHTML = `Статистика: <span style="color: #ffed4e">${currentUser.username}</span>`;
        }
    }
    
    // Получаем статистику ТОЛЬКО для текущего пользователя
    const stats = getUserStatistics(currentUser.id);
    
    // Отображаем статистику
    if (totalDisposals) totalDisposals.textContent = stats.total;
    if (yearlyDisposals) yearlyDisposals.textContent = stats.yearly;
    if (monthlyDisposals) monthlyDisposals.textContent = stats.monthly;
    
    // ========== ОБНОВЛЕННЫЕ КОМПЛИМЕНТЫ С МОТИВАЦИЕЙ ==========
    if (complimentText) {
        // Получаем последний утилизированный материал
        const lastDisposal = loadData('last_disposed_material');
        let compliment;
        
        if (lastDisposal) {
            // Тематические мотивирующие фразы для каждого материала
            const materialSpecificCompliments = {
                'Пластик': [
                    "Каждая пластиковая бутылка на переработке спасает морских животных! 🐋",
                    "Вы делаете океаны чище, сдавая пластик! 🌊",
                    "Пластик, который вы сдали, получит вторую жизнь как одежда или мебель!",
                    "Спасибо за борьбу с пластиковым загрязнением планеты!"
                ],
                'Стекло': [
                    "Стекло, которое вы сдали, обретёт новую жизнь через 30 дней! 🔄",
                    "Вы экономите природные ресурсы и энергию, сдавая стекло!",
                    "Стеклянная тара может перерабатываться бесконечно - вы участвуете в вечном цикле!",
                    "Спасибо за правильную утилизацию хрупкого, но ценного материала!"
                ],
                'Бумага': [
                    "Деревья благодарят вас за переработку бумаги! 🌳",
                    "Вы спасаете леса и экономьте воду с каждой сданной бумагой! 💧",
                    "Эта бумага станет новой книгой или тетрадью благодаря вам! 📚",
                    "Переработка бумаги - это дыхание для наших лесов!"
                ],
                'Металл': [
                    "Металл, который вы сдали, будет служить вечно в новом качестве! ♾️",
                    "Экономия 95% энергии через переработку металла - это ваш вклад! ⚡",
                    "Вы сохраняете природные ресурсы Земли, сдавая металл!",
                    "Спасибо за участие в бесконечном цикле переработки металлов!"
                ],
                'Органика': [
                    "Ваши органические отходы превратятся в жизнь для новых растений! 🌱",
                    "Круговорот веществ в природе начинается с вашей сознательности! 🔄",
                    "Вы создаёте компост, а не метан - это важно для климата! 🌍",
                    "Органика возвращается в природу благодаря вам!"
                ],
                'Опасные отходы': [
                    "Вы - настоящий герой, защищающий природу от токсинов! 🦸",
                    "Спасибо за безопасную утилизацию опасных материалов! 🛡️",
                    "Вы оберегаете почву и воду для будущих поколений! 💧",
                    "Правильная утилизация опасных отходов спасает жизни животных и людей! ❤️"
                ]
            };
            
            // Получаем количество утилизаций этого материала
            const materialCount = stats.byMaterial[lastDisposal.name] || 0;
            
            // Выбираем случайную фразу или генерируем особую
            const phrases = materialSpecificCompliments[lastDisposal.name] || [
                "Спасибо за ваш вклад в экологию!"
            ];
            
            // Иногда добавляем количество к фразе
            if (materialCount > 1 && Math.random() > 0.5) {
                compliment = `Вы уже утилизировали ${materialCount} раз ${lastDisposal.name.toLowerCase()}! ${phrases[Math.floor(Math.random() * phrases.length)]}`;
            } else {
                compliment = phrases[Math.floor(Math.random() * phrases.length)];
            }
            
        } else {
            // Если нет последней утилизации, используем общие комплименты
            if (stats.total === 0) {
                compliment = "Начните сортировать мусор - планета будет благодарна! Каждый маленький шаг имеет значение! 🌱";
            } else if (stats.total < 5) {
                compliment = "Спасибо за ваши первые шаги в сортировке отходов! Вы на правильном пути! 🚶♂️";
            } else if (stats.total < 20) {
                compliment = "Вы делаете планету чище с каждой утилизацией! Продолжайте в том же духе! 🌍";
            } else if (stats.monthly > 10) {
                compliment = "Вы - настоящий эко-герой! Такой регулярный вклад действительно меняет мир! 🦸♀️";
            } else if (Object.keys(stats.byMaterial).length >= 3) {
                compliment = "Вы сортируете разнообразные материалы - это отличная экологическая привычка! 🏆";
            } else {
                const generalCompliments = [
                    "Спасибо, что правильно утилизировали отходы! Планета благодарна вам.",
                    "Каждая правильная сортировка — шаг к чистой Земле. Вы молодец!",
                    "Деревья кланяются вам в ноги за спасённую бумагу! 🌳",
                    "Благодаря вам меньше мусора попадает на свалки. Продолжайте в том же духе!",
                    "Вы создаёте лучшее будущее своими экологичными действиями! ✨"
                ];
                compliment = generalCompliments[Math.floor(Math.random() * generalCompliments.length)];
            }
        }
        
        complimentText.textContent = compliment;
    }
    
    // ========== РАЗБИВКА ПО МАТЕРИАЛАМ ==========
    if (materialsBreakdown) {
        materialsBreakdown.innerHTML = '';
        
        if (Object.keys(stats.byMaterial).length > 0) {
            // Сортируем материалы по количеству утилизаций
            const sortedMaterials = Object.entries(stats.byMaterial)
                .sort((a, b) => b[1] - a[1]);
            
            sortedMaterials.forEach(([material, count]) => {
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                
                // Добавляем иконку материала
                const iconMap = {
                    'Пластик': '🧴',
                    'Стекло': '🥛',
                    'Бумага': '📄',
                    'Металл': '🥫',
                    'Органика': '🍎',
                    'Опасные отходы': '⚠️'
                };
                
                const icon = iconMap[material] || '♻️';
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">${icon}</span>
                        <span style="flex-grow: 1;">${material}</span>
                        <span class="stat-value">${count}</span>
                    </div>
                `;
                materialsBreakdown.appendChild(item);
            });
        } else {
            materialsBreakdown.innerHTML = `
                <div style="text-align: center; color: #666; padding: 30px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">Нет данных об утилизации</p>
                    <p style="color: #ffd700; font-size: 1rem;">Начните сортировать мусор, чтобы увидеть статистику!</p>
                </div>
            `;
        }
    }
    
    // ========== КНОПКА "ЗАВЕРШИТЬ" ==========
    if (nextBtn) {
        nextBtn.onclick = function() {
            goToPage('user_selection.html');
        };
    }
    
    // ========== КНОПКА "НАЗАД" ==========
    if (backBtn) {
        backBtn.onclick = function() {
            goToPage('motivation.html'); // Теперь ведёт на мотивационную страницу
        };
    }
    
    // ========== КНОПКА СБРОСА СТАТИСТИКИ ПОЛЬЗОВАТЕЛЯ ==========
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn warning-button';
    resetBtn.textContent = '🗑️ Сбросить мою статистику';
    resetBtn.onclick = function() {
        if (confirm(`ВНИМАНИЕ: Вы собираетесь удалить ВСЮ статистику пользователя "${currentUser.username}"!\n\nЭто действие: \n• Удалит все записи об утилизации\n• Нельзя будет отменить\n• Не затронет других пользователей\n\nПродолжить?`)) {
            // Удаляем все утилизации этого пользователя
            let disposals = loadData('trashsort_disposals') || [];
            disposals = disposals.filter(d => d.user_id !== currentUser.id);
            saveData('trashsort_disposals', disposals);
            
            // Удаляем информацию о последней утилизации
            localStorage.removeItem('last_disposed_material');
            
            // Показываем сообщение и перезагружаем страницу
            alert(`Статистика пользователя "${currentUser.username}" полностью сброшена!`);
            
            // Перезагружаем страницу
            location.reload();
        }
    };
    
    // ========== КНОПКА БЫСТРОГО ПРОДОЛЖЕНИЯ ==========
    const quickContinueBtn = document.createElement('button');
    quickContinueBtn.className = 'btn btn-primary';
    quickContinueBtn.style.marginTop = '10px';
    quickContinueBtn.style.marginRight = '10px';
    quickContinueBtn.textContent = '♻️ Продолжить сортировку';
    quickContinueBtn.onclick = function() {
        goToPage('material_selection.html');
    };
    
    // Добавляем кнопки в контейнер
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        // Очищаем контейнер и добавляем новые кнопки
        actionButtons.innerHTML = '';

        actionButtons.appendChild(resetBtn);        // Сначала кнопка сброса
        actionButtons.appendChild(quickContinueBtn); // Потом кнопка продолжения
    }
    
    // ========== ДОБАВЛЯЕМ ДОПОЛНИТЕЛЬНУЮ ИНФОРМАЦИЮ ==========
    const additionalInfo = document.createElement('div');
    additionalInfo.className = 'instructions-section';
    additionalInfo.style.marginTop = '40px';
    additionalInfo.style.padding = '20px';
    additionalInfo.style.backgroundColor = 'rgba(255, 215, 0, 0.05)';
    additionalInfo.style.borderRadius = '10px';
    additionalInfo.style.border = '1px solid rgba(255, 215, 0, 0.2)';
    
    let ecoImpactMessage = '';
    if (stats.total > 0) {
        // Рассчитываем экологический вклад
        const treesSaved = Math.floor((stats.byMaterial['Бумага'] || 0) * 0.17);
        const energySaved = (stats.byMaterial['Металл'] || 0) * 4.5 + 
                          (stats.byMaterial['Стекло'] || 0) * 3.2 + 
                          (stats.byMaterial['Пластик'] || 0) * 2.1;
        const waterSaved = (stats.byMaterial['Бумага'] || 0) * 50;
        
        ecoImpactMessage = `
            <h3 class="section-title">🌱 Ваш экологический вклад:</h3>
            <div class="instructions-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                ${treesSaved > 0 ? `<div style="text-align: center; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 5px;">
                    <div style="font-size: 1.8rem;">🌳</div>
                    <div style="font-weight: bold; color: #4CAF50;">${treesSaved}</div>
                    <div style="font-size: 0.9rem; color: #ccc;">деревьев спасено</div>
                </div>` : ''}
                
                ${energySaved > 0 ? `<div style="text-align: center; padding: 10px; background: rgba(255, 193, 7, 0.1); border-radius: 5px;">
                    <div style="font-size: 1.8rem;">⚡</div>
                    <div style="font-weight: bold; color: #FFC107;">${energySaved} кВт•ч</div>
                    <div style="font-size: 0.9rem; color: #ccc;">энергии сэкономлено</div>
                </div>` : ''}
                
                ${waterSaved > 0 ? `<div style="text-align: center; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 5px;">
                    <div style="font-size: 1.8rem;">💧</div>
                    <div style="font-weight: bold; color: #2196F3;">${waterSaved} л</div>
                    <div style="font-size: 0.9rem; color: #ccc;">воды сохранено</div>
                </div>` : ''}
                
                <div style="text-align: center; padding: 10px; background: rgba(255, 87, 34, 0.1); border-radius: 5px;">
                    <div style="font-size: 1.8rem;">📊</div>
                    <div style="font-weight: bold; color: #FF5722;">${stats.total}</div>
                    <div style="font-size: 0.9rem; color: #ccc;">всего утилизаций</div>
                </div>
            </div>
        `;
    }
    
    additionalInfo.innerHTML = ecoImpactMessage;
    
    // Вставляем дополнительную информацию перед футером
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsContainer.appendChild(additionalInfo);
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
        // Если нет данных, возвращаем к выбору материала
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
    
    // Устанавливаем иконку в зависимости от материала
    const iconMap = {
        'Пластик': '🧴',
        'Стекло': '🥛',
        'Бумага': '📄',
        'Металл': '🥫',
        'Органика': '🍎',
        'Опасные отходы': '⚠️'
    };
    
    materialIcon.textContent = iconMap[lastDisposal.name] || '♻️';
    
    // Устанавливаем заголовок
    pageTitle.textContent = `Вы утилизировали ${lastDisposal.name.toLowerCase()}!`;
    
    // Генерируем мотивирующую фразу в зависимости от материала
    const motivationPhrases = {
        'Пластик': [
            `Вы только что спасли ${Math.floor(materialDisposals * 1.5)} морских животных от пластикового мусора!`,
            `Этот пластик может быть переработан в новую бутылку уже через месяц!`,
            `Благодаря вам ${materialDisposals * 100} лет не понадобится для разложения этого пластика в природе.`,
            `Вы сделали океан чище на один пластиковый предмет! 🐋`
        ],
        'Стекло': [
            `Переработанное стекло экономит ${materialDisposals * 25}% энергии при производстве нового!`,
            `Это стекло может быть переработано бесконечно без потери качества!`,
            `Вы сохранили ${materialDisposals * 1.2} кг песка, который понадобился бы для нового стекла.`,
            `Стеклянная бутылка, которую вы сдали, вернётся на полку через 30 дней!`
        ],
        'Бумага': [
            `Вы спасли ${Math.floor(materialDisposals * 0.17)} дерева от вырубки! 🌳`,
            `Переработка этой бумаги сэкономила ${materialDisposals * 50} литров воды!`,
            `Благодаря вам сохранено ${materialDisposals * 4.5} кВт•ч энергии.`,
            `Эта бумага получит вторую жизнь как тетрадь, упаковка или газета!`
        ],
        'Металл': [
            `Переработка металла экономит ${materialDisposals * 95}% энергии! ⚡`,
            `Вы только что сэкономили ${materialDisposals * 4} кг железной руды!`,
            `Этот металл может быть переплавлен и использован бесконечно!`,
            `Спасибо, что не дали этому металлу ржаветь на свалке 100+ лет!`
        ],
        'Органика': [
            `Ваши органические отходы станут удобрением для ${materialDisposals * 3} новых растений! 🌱`,
            `Вы предотвратили выброс ${materialDisposals * 0.5} кг метана в атмосферу!`,
            `Эта органика превратится в компост и вернётся в природу!`,
            `Спасибо за круговорот веществ в природе! ♻️`
        ],
        'Опасные отходы': [
            `Вы защитили почву и воду от ${materialDisposals * 5} лет загрязнения! 🛡️`,
            `Спасибо, что не допустили попадание токсинов в природу!`,
            `Вы обезопасили ${materialDisposals * 10} животных от отравления!`,
            `Правильная утилизация опасных отходов спасает жизни! ❤️`
        ]
    };
    
    // Выбираем случайную фразу для этого материала
    const phrases = motivationPhrases[lastDisposal.name] || [
        'Спасибо за ваш вклад в чистоту планеты! 🌍'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    motivationText.textContent = randomPhrase;
    
    // Добавляем экологический факт
    const ecoFacts = [
        `Знаете ли вы? Если бы каждый человек сортировал мусор, мы бы сократили свалки на 60%!`,
        `Факт: Переработка одной алюминиевой банки экономит столько энергии, сколько нужно для работы телевизора 3 часа.`,
        `Интересно: Стекло разлагается более 1000 лет, но может быть переработано бесконечно.`,
        `Знаете ли вы? Органические отходы на свалках выделяют метан - газ, усиливающий парниковый эффект.`,
        `Факт: Переработка пластика экономит до 80% энергии по сравнению с производством нового.`
    ];
    const randomFact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
    environmentFact.innerHTML = `<strong>Экологический факт:</strong> ${randomFact}`;
    
    // Обновляем статистику
    totalCount.textContent = totalUserDisposals;
    materialCount.textContent = materialDisposals;
    todayCount.textContent = todayDisposals;
    
    // Обработчики кнопок
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
}

// ========== ГЛАВНАЯ СТРАНИЦА ==========
function initMainPage() {
    console.log('Инициализация главной страницы');
    // Кнопка "Начать сортировку" уже работает через onclick в HTML
}

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен - TrashSort v2.0');
    
    // Определяем текущую страницу
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    console.log('Текущая страница:', page);
    
    switch(page) {
        case 'index.html':
        case '':
            initMainPage();
            break;
        case 'material_selection.html':
            initMaterialSelection();
            break;
        case 'instructions.html':
            initInstructionsPage();
            break;
        default:
            console.log('Неизвестная страница:', page);
    }
    
    // Общая обработка всех кнопок "Назад"
    setTimeout(() => {
        const allBackBtns = document.querySelectorAll('#backBtn');
        allBackBtns.forEach(btn => {
            if (!btn.onclick) {
                btn.onclick = function() {
                    window.history.back();
                };
            }
        });
    }, 100);
});

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    // ========== ДЕЛАЕМ ЛОГОТИП КЛИКАБЕЛЬНЫМ ==========
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.title = 'Вернуться на главную';
        
        logo.onclick = function() {
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'index.html' || currentPage === '' || currentPage === 'index.html') {
                // Уже на главной - прокрутка наверх
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Переход на главную
                window.location.href = 'index.html';
            }
        };
        
        // Анимация при наведении
        logo.addEventListener('mouseenter', () => {
            logo.style.color = '#ffed4e';
            logo.style.transform = 'scale(1.05)';
        });
        
        logo.addEventListener('mouseleave', () => {
            logo.style.color = '#ffd700';
            logo.style.transform = 'scale(1)';
        });
    }
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
        case 'motivation.html':  // НОВАЯ СТРАНИЦА МОТИВАЦИИ
            initMotivationPage();
            break;
        case 'statistics.html':
            initStatisticsPage();
            break;
        default:
            console.log('Неизвестная страница:', page);
            // Пробуем определить по URL параметрам
            if (window.location.search.includes('motivation')) {
                initMotivationPage();
            } else {
                // По умолчанию перенаправляем на главную
                window.location.href = 'index.html';
            }
    }
    
        // Общая обработка всех кнопок "Назад"
    setTimeout(() => {
        const allBackBtns = document.querySelectorAll('#backBtn');
        allBackBtns.forEach(btn => {
            // Удаляем старые обработчики
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Добавляем новые обработчики
        document.querySelectorAll('#backBtn').forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Back clicked, history length:', window.history.length);
                
                // ВСЕГДА используем настоящую навигацию назад
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // Только если нет истории, используем fallback
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
            
            // Добавляем анимацию
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(-3px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
    }, 100);
        
        // Добавляем обработчик для кнопок "На главную"
        const homeButtons = document.querySelectorAll('.go-home');
        homeButtons.forEach(btn => {
            btn.onclick = function() {
                goToPage('index.html');
            };
        });
        
    }, 100);

// Глобальные функции для кнопок в HTML
window.goToPage = goToPage;
window.goBack = function() {
    window.history.back();
};
window.deleteUser = deleteUser;
window.getUserStatistics = getUserStatistics;

// Функция для получения случайной мотивационной фразы
window.getRandomMotivation = function(material) {
    const motivations = {
        'Пластик': [
            "Пластиковая бутылка, которую вы сдали, не станет частью мусорного острова в океане! 🌊",
            "Вы дали пластику второй шанс стать чем-то полезным!",
            "Каждый грамм переработанного пластика - это чище наша планета!"
        ],
        'Стекло': [
            "Стекло, которое вы сдали, будет переработано и вернётся к вам как новая тара! 🔄",
            "Вы экономите 30% энергии при производстве нового стекла!",
            "Спасибо за участие в вечном цикле переработки стекла!"
        ],
        'Бумага': [
            "Бумага, которую вы сдали, спасла дерево и сэкономила воду! 🌳💧",
            "Вы создали спрос на переработанную бумагу - это важно!",
            "Каждый килограмм бумаги на переработку - это чище воздух!"
        ],
        'Металл': [
            "Металл, который вы сдали, избежал ржавчины на свалке!",
            "Вы участвуете в самой эффективной переработке - металлической!",
            "Спасибо за сохранение невозобновляемых ресурсов Земли!"
        ],
        'Органика': [
            "Ваши органические отходы станут плодородной почвой! 🌱",
            "Вы предотвратили выброс парниковых газов на свалке!",
            "Спасибо за участие в естественном круговороте веществ!"
        ],
        'Опасные отходы': [
            "Вы защитили почву и грунтовые воды от загрязнения! 🛡️",
            "Спасибо за ответственную утилизацию опасных материалов!",
            "Вы обезопасили окружающую среду для будущего!"
        ]
    };
    
    const phrases = motivations[material] || ["Спасибо за ваш вклад в экологию! 🌍"];
    return phrases[Math.floor(Math.random() * phrases.length)];
};

// Функция для расчета экологического вклада
window.calculateEcoImpact = function(disposals) {
    return {
        treesSaved: Math.floor((disposals.filter(d => d.material_name === 'Бумага').length || 0) * 0.17),
        energySaved: (disposals.filter(d => d.material_name === 'Металл').length || 0) * 4.5 +
                    (disposals.filter(d => d.material_name === 'Стекло').length || 0) * 3.2 +
                    (disposals.filter(d => d.material_name === 'Пластик').length || 0) * 2.1,
        waterSaved: (disposals.filter(d => d.material_name === 'Бумага').length || 0) * 50,
        co2Reduced: disposals.length * 1.5 // кг CO2
    };
};