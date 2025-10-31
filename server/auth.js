<<<<<<< Updated upstream
   let users = []; // Инициализируем users пустым массивом
=======
<<<<<<< Updated upstream
import  users  from './DB/mockUsers.js';
>>>>>>> Stashed changes

   async function initializeAuth() {
       try {
           const response = await fetch('../server/DB/mockUsers.json');
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           users = await response.json(); // Загружаем данные и сохраняем в users
           console.log('Users загружены:', users); // Для отладки
       } catch (error) {
           console.error('Ошибка при загрузке данных о пользователях:', error);
           // Обработка ошибки загрузки (например, вывод сообщения пользователю)
       }
   }

   export async function loginUser(login, password) {
       // Убедимся, что users загружены перед использованием
       if (!users) {
           console.error('Данные о пользователях еще не загружены!');
           return { success: false, error: 'Не удалось загрузить данные пользователей' };
       }

       const user = users.find(u => u.login === login && u.password === password);
       if (user) {
           localStorage.setItem('currentUser', JSON.stringify(user));
           return { success: true, user };
       }
       return { success: false, error: 'Неверный логин или пароль' };
   }

<<<<<<< Updated upstream
   export async function registerUser(login, password, name) {
       // Убедимся, что users загружены перед использованием
       if (!users) {
           console.error('Данные о пользователях еще не загружены!');
           return { success: false, error: 'Не удалось загрузить данные пользователей' };
       }

       if (users.find(u => u.login === login)) {
           return { success: false, error: 'Пользователь с таким логином уже существует' };
       }
       const newUser = { id: users.length + 1, login, password, name };
       users.push(newUser); // В реальной системе нужно сохранять в БД
       localStorage.setItem('currentUser', JSON.stringify(newUser));
       return { success: true, user: newUser };
   }

   export function logoutUser() {
       localStorage.removeItem('currentUser');
   }

   export function getCurrentUser() {
       const user = localStorage.getItem('currentUser');
       return user ? JSON.parse(user) : null;
   }

   // Инициализируем загрузку данных при загрузке модуля
   initializeAuth();
=======
export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}
=======
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
>>>>>>> Stashed changes
>>>>>>> Stashed changes
