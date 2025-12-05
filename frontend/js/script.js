// УПРОЩЕННАЯ ВЕРСИЯ 2.0 - С УДАЛЕНИЕМ ПОЛЬЗОВАТЕЛЕЙ И ИНДИВИДУАЛЬНОЙ СТАТИСТИКОЙ
console.log('TrashSort JS loaded - Версия 2.0');

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
    let users = loadData('trashsort_users') || [
        { id: 1, username: "Алексей" },
        { id: 2, username: "Мария" },
        { id: 3, username: "Дмитрий" }
    ];
    
    // Отображаем пользователей
    function renderUsers() {
        userList.innerHTML = '';
        
        if (users.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'user-item';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#666';
            emptyMsg.textContent = 'Нет пользователей. Добавьте первого!';
            userList.appendChild(emptyMsg);
            return;
        }
        
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.dataset.id = user.id;
            userItem.dataset.username = user.username;
            
            userItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>${user.username}</span>
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
                    users = deleteUser(userId);
                    
                    // Перерисовываем список
                    renderUsers();
                    
                    // Если удалили текущего пользователя, сбрасываем выбор
                    if (currentUser && currentUser.id === userId) {
                        currentUser = null;
                        localStorage.removeItem('currentUser');
                    }
                }
            };
        });
        
        // Автовыбор первого пользователя если нет текущего
        if (!currentUser && users.length > 0) {
            const firstUserItem = document.querySelector('.user-item:not([style*="text-align: center"])');
            if (firstUserItem) {
                firstUserItem.click();
            }
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
            const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (existingUser) {
                alert('Пользователь с таким именем уже существует!');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                username: username
            };
            
            users.push(newUser);
            saveData('trashsort_users', users);
            renderUsers();
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
            if (!currentUser) {
                alert('Выберите пользователя');
                return;
            }
            goToPage('material_selection.html');
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
    
    // Кнопка "Далее"
    if (nextBtn) {
        nextBtn.onclick = function() {
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
            
            goToPage('statistics.html');
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
    
    // Комплимент в зависимости от статистики
    if (complimentText) {
        let compliment;
        if (stats.total === 0) {
            compliment = "Начните сортировать мусор - планета будет благодарна!";
        } else if (stats.total < 5) {
            compliment = "Спасибо за ваши первые шаги в сортировке отходов!";
        } else if (stats.total < 20) {
            compliment = "Вы делаете планету чище с каждой утилизацией!";
        } else if (stats.monthly > 10) {
            compliment = "Вы - настоящий герой экологии! Так держать!";
        } else {
            const compliments = [
                "Спасибо, что правильно утилизировали отходы! Планета благодарна вам.",
                "Каждая правильная сортировка — шаг к чистой Земле. Вы молодец!",
                "Деревья кланяются вам в ноги за спасённую бумагу!",
                "Благодаря вам меньше мусора попадает на свалки. Продолжайте в том же духе!"
            ];
            compliment = compliments[Math.floor(Math.random() * compliments.length)];
        }
        complimentText.textContent = compliment;
    }
    
    // Разбивка по материалам
    if (materialsBreakdown) {
        materialsBreakdown.innerHTML = '';
        
        if (Object.keys(stats.byMaterial).length > 0) {
            for (const [material, count] of Object.entries(stats.byMaterial)) {
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                item.innerHTML = `
                    <span>${material}</span>
                    <span class="stat-value">${count}</span>
                `;
                materialsBreakdown.appendChild(item);
            }
        } else {
            materialsBreakdown.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Нет данных об утилизации</p>';
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
            goToPage('instructions.html');
        };
    }
    
    // Добавляем кнопку сброса статистики пользователя
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary';
    resetBtn.style.marginTop = '20px';
    resetBtn.textContent = 'Сбросить мою статистику';
    resetBtn.onclick = function() {
        if (confirm(`Сбросить всю статистику пользователя "${currentUser.username}"? Это действие нельзя отменить.`)) {
            // Удаляем все утилизации этого пользователя
            let disposals = loadData('trashsort_disposals') || [];
            disposals = disposals.filter(d => d.user_id !== currentUser.id);
            saveData('trashsort_disposals', disposals);
            
            alert('Статистика сброшена!');
            // Перезагружаем страницу
            location.reload();
        }
    };
    
    // Добавляем кнопку в контейнер
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(resetBtn);
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

// Глобальные функции для кнопок в HTML
window.goToPage = goToPage;
window.goBack = function() {
    window.history.back();
};
window.deleteUser = deleteUser;
window.getUserStatistics = getUserStatistics;