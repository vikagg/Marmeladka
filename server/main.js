document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    initAuthForm();
    
    if (document.querySelector('.cards')) {
        loadProducts();
    }
    
    if (document.querySelector('.product-page')) {
        initProductPage();
    }
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const container = document.querySelector('.cards');
        container.innerHTML = products.map(product => `
            <div class="card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="price">${product.price} ₽</span>
            </div>
        `).join('');
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                window.location.href = `product.html?id=${productId}`;
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function initAuthForm() {
    if (document.querySelector('.form-container')) {
        const form = document.getElementById('authForm');
        const loginInput = form.querySelector('input[name="login"]');
        const passwordInput = form.querySelector('input[name="password"]');
        const nameInput = form.querySelector('input[name="name"]');
        const nameField = document.getElementById('nameField');
        const switchModeBtn = document.getElementById('switchMode');
        const submitBtn = document.getElementById('submitBtn');
        
        let isLoginMode = true;

        switchModeBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            nameField.style.display = isLoginMode ? 'none' : 'block';
            submitBtn.textContent = isLoginMode ? 'Войти' : 'Зарегистрироваться';
            switchModeBtn.textContent = isLoginMode ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (loginInput.value.length < 3 || passwordInput.value.length < 6) {
                alert('Ошибка валидации! Логин - минимум 3 символа, пароль - минимум 6 символов');
                return;
            }

            try {
                if (isLoginMode) {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            login: loginInput.value, 
                            password: passwordInput.value 
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        const user = result.user;
                        alert(`Добро пожаловать, ${user.name || user.username}!`);
                        localStorage.setItem('currentUser', JSON.stringify(user));

                        if (user.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else {
                            window.location.href = 'index.html';
                        }
                    } else {
                        alert(result.error);
                    }
                } else {
                    const name = nameInput.value.trim();
                    if (!name) {
                        alert('Введите имя!');
                        return;
                    }
                    
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            login: loginInput.value, 
                            password: passwordInput.value,
                            name: name
                        })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        alert('Регистрация успешна!');
                        localStorage.setItem('currentUser', JSON.stringify(result.user));
                        window.location.href = 'index.html';
                    } else {
                        alert(result.error);
                    }
                }
            } catch (error) {
                alert('Произошла ошибка при обработке запроса');
            }
        });
    }
}

function updateNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const adminLink = document.getElementById('adminLink');
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (currentUser) {
        if (loginLink) {
            loginLink.textContent = 'Выйти';
            loginLink.href = '#';
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
        
        if (adminLink && currentUser.role === 'admin') {
            adminLink.style.display = 'inline-block';
        }
    } else {
        if (adminLink) {
            adminLink.style.display = 'none';
        }
        if (loginLink) {
            loginLink.textContent = 'Вход';
            loginLink.href = 'login.html';
        }
    }
}

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        document.querySelector('.product-page').innerHTML = '<p>ID товара не указан</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        document.querySelector('.product-page img').src = product.image;
        document.querySelector('.product-page img').alt = product.name;
        document.querySelector('.product-info h1').textContent = product.name;
        document.querySelector('.product-info p').textContent = product.description;
        document.querySelector('.product-info .price').textContent = `${product.price} ₽`;
        
        const bookButton = document.querySelector('.product-info button');
        if (bookButton) {
            bookButton.addEventListener('click', () => {
                alert(`Добавлено в корзину "${product.name}"!`);
            });
        }
    } catch (error) {
        document.querySelector('.product-page').innerHTML = '<p>Ошибка загрузки товара</p>';
    }
}