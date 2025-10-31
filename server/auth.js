import { validateForm } from './validation.js';
import { loginUser, registerUser } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('authForm');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('name');
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

        const { isValid } = validateForm(loginInput.value, passwordInput.value);
        if (!isValid) {
            alert('Ошибка валидации! Логин - минимум 3 символа, пароль - минимум 6 символов');
            return;
        }

        try {
            if (isLoginMode) {
                const result = await loginUser(loginInput.value, passwordInput.value);
                
                if (result.success) {
                    alert(`Добро пожаловать, ${result.user.name}!`);
                    if (result.user.role === 'admin') {
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
                
                const result = await registerUser(loginInput.value, passwordInput.value, name);
                if (result.success) {
                    alert('Регистрация успешна!');
                    window.location.href = 'index.html';
                } else {
                    alert(result.error);
                }
            }
        } catch (error) {
            alert('Произошла ошибка при обработке запроса');
        }
    });
});